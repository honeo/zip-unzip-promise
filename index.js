/*
	かんたんzip圧縮展開
*/

// Modules
const Archiver = require('archiver');
const fse = require('fs-extra')
const path = require('path');
const unzip2 = require('unzip2');
const {is, not, any} = require('@honeo/check');
const console = require('console-wrapper');

// Var
const ModName = 'zip-unzip-promise';
const Mod = {
	debug(bool){
		bool ?
			console.enable():
			console.disable();
	}
}

const archiver_zip_op = {
	zlib: {
		level: 9
	}
}


/*
	圧縮する
		引数
			1...: 圧縮するファイルorディレクトリのパス
			last: op, 出力する圧縮ファイルのパス
		返り値
			promise
				出力した.zipファイルのパスを引数に解決する。
*/
Mod.zip = async function(_inputPathArr, _outputZipPath){
	console.log(`${ModName}.zip()`, _inputPathArr, _outputZipPath);
	// 絶対パス化、また配列でなければ配列化する。
	const inputPathArr = is.arr(_inputPathArr) ?
	 	_inputPathArr.map( (pathStr)=>{
			return path.resolve(pathStr);
		}):
		[path.resolve(_inputPathArr)];
	// 出力先ファイル名。引数2があれば絶対パス化、なければ ./{最初のfile(拡張子を除く)/dirname}.zip にする
	const outputZipPath = (function(){
		if( is.str(_outputZipPath) ){
			return path.resolve(_outputZipPath);
		}else{
			const {name} = path.parse(inputPathArr[0]);
			return path.resolve(`./${name}.zip`);
		}
	}());
	// zipインスタンス(readable)
	const archive = new Archiver('zip', archiver_zip_op);
	const promise_archive = new Promise( (resolve, reject)=>{
		archive.on('end', resolve);
		archive.on('error', reject);
	});
	const promise_archive_onFinish = new Promise( (resolve)=>{
		archive.on('finish', resolve);
	});
	// .zipへの書き込みStream
	const writable = fse.createWriteStream(outputZipPath);
	const promise_writable = new Promise( (resolve, reject)=>{
		writable.on('error', reject);
		writable.on('finish', resolve);
	});
	archive.pipe(writable);
	// 圧縮するファイルのパスからstatと名前を取得、zipに書き込み
	for(let inputPath of inputPathArr){
		const stat = await fse.stat(inputPath);
		const name = path.basename(inputPath);
		if( stat.isFile() ){
			archive.file(inputPath, {name});
		}else{
			archive.directory(inputPath, name);
		}
	}
	archive.finalize();
	await Promise.all([
		promise_archive,
		promise_archive_onFinish,
		promise_writable
	]);
	return outputZipPath;
}

/*
	引数パスの.zipファイルを展開する
	引数
		1: string
			展開する.zipファイルのパス。
		2: op, string
			展開先ディレクトリのパス。
			なければ現在の作業ディレクトリに展開する。
	返り値
		promise
			展開先ディレクトリのパスを引数に解決する。
*/
Mod.unzip = async function(inputZipPath, outputDirPath='./'){
	console.log(`${ModName}.unzip()`, `input: ${inputZipPath}`, `output: ${outputDirPath}`);
	const readable = fse.createReadStream(inputZipPath);
	const promise_readable = new Promise( (resolve, reject)=>{
		readable.on('close', resolve);
		readable.on('error', reject);
	});
	const writable = unzip2.Extract({
		path: outputDirPath
	});
	const promise_writable = new Promise( (resolve, reject)=>{
		writable.on('close', resolve);
		writable.on('error', reject);
	});
	readable.pipe(writable);
	await Promise.all([
		promise_readable,
		promise_writable
	]);
	return outputDirPath;
}

module.exports = Mod;
