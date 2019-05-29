// Mod
const console = require('console-wrapper');
const sanitize = require('sanitize-filename');
const fse = require('fs-extra')
const encoding = require('encoding-japanese');
const iconv = require('iconv-lite');
const jschardet = require('jschardet')
const path = require('path');
const unzipper = require('unzipper');
const {is, not, any} = require('@honeo/check');


// Var
const obj_defaultOp = {
	encode: 'utf8',
	overwrite: false
}

/*
	引数パスの.zipファイルを展開する

		引数
			1: string
				展開する.zipファイルのパス。
			2: string
				展開先ディレクトリのパス。
			3: op, object
				設定。
		返り値
			promise
				展開先ディレクトリのパスを引数に解決する。
*/
async function unzip(inputZipPath, str_outputDirPath, _options={}){
	console.group('unzip()', inputZipPath, str_outputDirPath, _options);

	// validation
	if( not.str(inputZipPath) ){
		throw new TypeError(`Invalid arguments 1: ${inputZipPath}`);
	}
	if( not.str(str_outputDirPath) ){
		throw new TypeError(`Invalid arguments 2: ${str_outputDirPath}`);
	}
	if( not.obj(_options) ){
		throw new TypeError(`Invalid arguments 3: ${_options}`);
	}

	const str_outputDirFullpath = path.resolve(str_outputDirPath);
	const options = Object.assign({}, obj_defaultOp, _options);
	const arr_promise = []; // コンテンツ作成中のpromise

	const readable = fse.createReadStream(inputZipPath);
	const promise_readable = new Promise( (resolve, reject)=>{
		readable.on('end', (arg)=>{
			console.log('readable on end');
			resolve(arg);
		});
		readable.on('error', (error)=>{
			console.log('readable on error');
			reject(error);
		});
	});

	const duplex = readable.pipe(unzipper.Parse());
	const promise_duplex = duplex.promise();

	/*
		listener内は全て同期処理で行う
			確認処理の合間に他の処理が挟まって実体を変化させないため。
	*/
	duplex.on('entry', (entry)=>{
		console.log('duplex on entry:', entry.path);

		// 文字コード指定があれば変換してパスを上書き
		if( options.encode!==obj_defaultOp.encode ){

			let str_encodeType = options.encode;

			// 自動検出
			if( /^auto$/i.test(options.encode) ){
				str_encodeType = jschardet.detect(entry.props.pathBuffer).encoding
					|| encoding.detect(entry.props.pathBuffer)
					|| str_encodeType;
			}

			const str_utf8Path = iconv.decode(
				entry.props.pathBuffer,
				str_encodeType
			);
			console.log(`path convert: ${entry.path} => ${str_utf8Path}`);
			entry.path = str_utf8Path;
		}

		// 正規化, dirなら消された末尾/を補完
		const {dir, base} = path.parse(entry.path);
		entry.path = path.join(
			dir,
			entry.type==='File'?
				sanitize(base):
				sanitize(base)+'/'
		);

		const str_writeContentFullpath = path.resolve(
			path.join(str_outputDirPath, entry.path)
		);

		const promise_entry_finish = new Promise( (resolve, reject)=>{
			entry.on('finish', (arg)=>{
				console.log('entry on finish:', entry.path);
				resolve(arg);
			});
			entry.on('error', (error)=>{
				console.log('entry on error:', entry.path);
				reject(error);
			});
		});
		arr_promise.push(promise_entry_finish);
		// 上でやってるからerrorは省略
		const promise_entry_end = new Promise( (resolve, reject)=>{
			entry.on('end', (arg)=>{
				console.log('entry on end:', entry.path);
				resolve(arg);
			});
		});
		arr_promise.push(promise_entry_end);

		// options.filter
		if( is.func(options.filter) ){
			const isSkip = options.filter({
				type: entry.type,
				path: path.normalize(entry.path)
			});
			if( not.true(isSkip) ){
				arr_promise.push(
					entry.autodrain().promise()
				);
				console.log('skip: ', str_writeContentFullpath);
				return;
			}
		}

		if( entry.type==='File' ){

			// 上書きNG設定で存在すればskip
			if( is.false(options.overwrite) && fse.existsSync(str_writeContentFullpath) ){
				arr_promise.push(
					entry.autodrain().promise()
				);
				console.log(`skip: ${str_writeContentFullpath}`);
				return;
			}

			fse.ensureDirSync(
				path.dirname(str_writeContentFullpath)
			);
			console.log(`write: ${str_writeContentFullpath}`);
			const writable = entry.pipe(
 				fse.createWriteStream(str_writeContentFullpath)
			);
			const promise_writable = new Promise( (resolve, reject)=>{
				writable.on('finish', (arg)=>{
					console.log('writable on finish');
					resolve(arg);
				});
				writable.on('error', reject);
			});
			arr_promise.push(promise_writable);

		}else if( entry.type==='Directory' ){
			// dirならensureしておわり
			console.log(`ensure: ${str_writeContentFullpath}`);
			arr_promise.push(
				fse.ensureDir(str_writeContentFullpath),
				entry.autodrain().promise()
			);
		}else{
			throw new Error(`Invalid entry.type: ${entry.type}`);
		}
	});

	return Promise.all([
		promise_readable,
		promise_duplex
	]).then( (args)=>{
		console.log('arr_promise', arr_promise.length, arr_promise);
		return Promise.all([
			...arr_promise
		]);
	}).then( (args)=>{
		console.log('result:', str_outputDirFullpath);
		return str_outputDirFullpath;
	}).finally( ()=>{
		console.groupEnd();
	});
}



module.exports = unzip;
