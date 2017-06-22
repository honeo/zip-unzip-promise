/*
	圧縮する
		引数
			1: string or array
				圧縮するファイルorディレクトリのパス、またはその配列。
			2: op,string
				出力する圧縮ファイルのパス。
		返り値
			promise
				出力した.zipファイルのパスを引数に解決する。
*/

// Modules
const Archiver = require('archiver');
const fse = require('fs-extra')
const path = require('path');
const {is, not, any} = require('@honeo/check');

// Var
const archiver_zip_op = {
	zlib: {
		level: 9
	}
}



async function zip(_inputPathArr, _outputZipPath){
	// console.log(`.zip()`, _inputPathArr, _outputZipPath);
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

module.exports = zip;
