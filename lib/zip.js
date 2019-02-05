// Modules
const Archiver = require('archiver');
const console = require('console-wrapper');
const fse = require('fs-extra')
const path = require('path');
const sanitize = require('sanitize-filename');
const {is, not, any} = require('@honeo/check');

// Var
const obj_archiverOp = {
	zlib: {
		level: 9
	}
}
const obj_defaultOp = {
	overwrite: false
}

/*
	圧縮する
		引数
			1: string or array
				圧縮するファイルorディレクトリのパス、またはその配列。
			2: string
				出力する圧縮ファイルのパス。
			3: op, object
				設定。
		返り値
			promise
				出力した.zipファイルのパスを引数に解決する。
*/

async function zip(input, str_outputZipPath, options=obj_defaultOp){
	console.group('zip()', input, str_outputZipPath, options);

	// 配列でなければ配列化する。
	const arr_inputPath = is.arr(input) ?
		input:
		[input];

	// validation
	arr_inputPath.forEach( (str_inputPath, index)=>{
		if( not.str(str_inputPath) ){
			throw new TypeError(`Invalid arguments 1[${index}]: ${str_inputPath}`);
		}
	});
	if( not.str(str_outputZipPath) ){
		throw new TypeError(`Invalid arguments 2: ${str_outputZipPath}`);
	}
	if( not.obj(options) ){
		throw new TypeError(`Invalid arguments 3: ${options}`);
	}

	// 絶対パス化
	const str_outputZipFullpath = path.resolve(str_outputZipPath);

	// 正規化
	const {dir, base} = path.parse(str_outputZipFullpath);
	const str_validOutputZipFullpath = path.join(
		dir,
		sanitize(base)
	);

	// options.filter
	if( is.func(options.filter) ){
		const isSkip = options.filter({
			type: 'File',
			path: str_validOutputZipFullpath
		});
		if( not.true(isSkip) ){
			console.groupEnd('skip', str_validOutputZipFullpath);
			return '';
		}
	}

	// 上書き確認, 不許可で同パスがあれば終了。
	if( is.false(options.overwrite) && await fse.exists(str_validOutputZipFullpath) ){
		console.groupEnd('skip', str_validOutputZipFullpath);
		return str_validOutputZipFullpath;
	}else if( is.func(options.overwrite) && await fse.exists(str_validOutputZipFullpath) ){
		const isOverwrite = options.overwrite({
			path: str_validOutputZipFullpath,
			type: 'File'
		});
		if( isOverwrite ){
			console.groupEnd('skip', str_validOutputZipFullpath);
			return str_validOutputZipFullpath;
		}
	}
	console.log('write', str_validOutputZipFullpath);

	// 出力先パスからdir抽出して作成
	const {dir: str_outputDirPath} = path.parse(str_validOutputZipFullpath);
	await fse.ensureDir(str_outputDirPath);

	// zipインスタンス(readable)
	const archive = new Archiver('zip', obj_archiverOp);
	archive.on('entry', (arg)=>{
		console.log('archive on entry', arg.name);
	}).on('warning', (error)=>{
		console.log('archive on warning', error);
	});

	const promise_archive_finish = new Promise( (resolve, reject)=>{
		archive.on('finish', ()=>{
			console.log('archive on finish');
			resolve();
		});
		archive.on('error', reject);
	});

	// .zipへの書き込みStream
	const writable = archive.pipe(
		fse.createWriteStream(str_validOutputZipFullpath)
	);
	const promise_writable_finish = new Promise( (resolve, reject)=>{
		writable.on('finish', ()=>{
			console.log('writable on finish');
			resolve();
		});
		writable.on('error', reject);
	});

	// 圧縮するファイルのパスからstatsと名前を取得、zipに書き込み
	for(let str_inputPath of arr_inputPath){
		const stats = await fse.stat(str_inputPath);
		const name = path.basename(str_inputPath);
		if( stats.isFile() ){
			archive.file(str_inputPath, {name});
		}else if( stats.isDirectory() ){
			archive.directory(str_inputPath, name);
		}else{
			throw new Error(`Invalid type: ${stats}`);
		}
	}

	archive.finalize();

	return Promise.all([
		promise_archive_finish,
		promise_writable_finish,
	]).then( (args)=>{
		console.log('result:', str_validOutputZipFullpath);
		return str_validOutputZipFullpath;
	}).finally( ()=>{
		console.groupEnd();
	});
}

module.exports = zip;
