/*
	かんたんzip圧縮展開
*/

// Modules
const Archiver = require('archiver');
const fs = require('fs');
const fsp = require('fs-promise')
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
	// zipインスタンス
	const archive = new Archiver('zip', archiver_zip_op);
	archive.on('error', (error)=>{
		throw error;
	});
	const promise_archive_onEnd = new Promise( (resolve)=>{
		archive.on('end', resolve);
	});
	const promise_archive_onFinish = new Promise( (resolve)=>{
		archive.on('finish', resolve);
	});
	// .zipへの書き込みStream
	const stream_write = fs.createWriteStream(outputZipPath);
	stream_write.on('error', (error)=>{
		throw error;
	});
	const promise_stream_onFinish = new Promise( (resolve)=>{
		stream_write.on('finish', resolve);
	});
	archive.pipe(stream_write);
	// 圧縮するファイルのパスからstatと名前を取得、zipに書き込み
	for(let inputPath of inputPathArr){
		const stat = await fsp.stat(inputPath);
		const name = path.basename(inputPath);
		if( stat.isFile() ){
			archive.file(inputPath, {name});
		}else{
			archive.directory(inputPath, name);
		}
	}
	archive.finalize();
	await Promise.all([
		promise_archive_onEnd,
		promise_archive_onFinish,
		promise_stream_onFinish
	]);
	return outputZipPath;
}

/*
	引数パスの.zipファイルを展開する
		promiseを返す
*/
Mod.unzip = function(inputZipPath, outputDirPath='./'){
	console.log(`${ModName}.unzip()`, `input: ${inputZipPath}`, `output: ${outputDirPath}`);
	return new Promise( (resolve, reject)=>{
		const stream_read = fs.createReadStream(inputZipPath);
		const stream_unzip = unzip2.Extract({
			path: outputDirPath//path.resolve(outputDirPath)
		});
		stream_unzip.on('close', ()=>{
			resolve(outputDirPath);
		});
		stream_unzip.on('error', reject);
		stream_read.pipe(stream_unzip);
	});
}

module.exports = Mod;
