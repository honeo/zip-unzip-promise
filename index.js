/*
	かんたんzip圧縮展開
*/

// Modules
const Archiver = require('archiver');
const fs = require('fs');
const fsp = require('fs-promise')
const path = require('path');
const unzip2 = require('unzip2');
const console = require('console-wrapper');

// Var
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
*/
Mod.zip = function(_inputPathArr, _outputZipPath){
	console.log('.zip()', _inputPathArr, _outputZipPath);
	// 絶対パス化、また配列でなければ配列化する。
	const inputPathArr = Array.isArray(_inputPathArr) ?
	 	_inputPathArr.map( (pathStr)=>{
			return path.resolve(pathStr);
		}):
		[path.resolve(_inputPathArr)];
	// stat解決待ちのpromise化
	const promiseArr = inputPathArr.map( (pathStr)=>{
		return fsp.stat(pathStr).then( (stat)=>{
			return {stat, path: pathStr};
		});
	})
	// 出力先ファイル名。引数2があれば絶対パス化、なければ ./{最初のfile(拡張子を除く)/dirname}.zip にする
	const outputZipPath = (function(){
		if( typeof _outputZipPath==='string' ){
			return path.resolve(_outputZipPath);
		}else{
			const {name} = path.parse(inputPathArr[0]);
			return path.resolve(`./${name}.zip`);
		}
	}());
	return Promise.all(promiseArr).then( (objArr)=>{
		// 引数2があればそのまま、なければ作る
		const archive = new Archiver('zip', archiver_zip_op);
		console.log('###########', outputZipPath);
		const stream_write = fs.createWriteStream(outputZipPath);
		return new Promise( (resolve, reject)=>{
			const resolve_bind = resolve.bind(undefined, outputZipPath);
			archive.on('close', resolve_bind);
			archive.on('end', resolve_bind);
			archive.on('finish', resolve_bind);
			archive.on('error', reject);
			archive.pipe(stream_write);
			objArr.forEach( (obj)=>{
				obj.stat.isFile() ?
					archive.file(obj.path, {name: path.basename(obj.path)}):
					archive.directory(obj.path, path.basename(obj.path));
			});
			archive.finalize();
		});
	});
}

/*
	引数パスの.zipファイルを展開する
		promiseを返す
*/
Mod.unzip = function(inputZipPath, outputDirPath='./'){
	console.log('.unzip()', `input: ${inputZipPath}`, `output: ${outputDirPath}`);
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
