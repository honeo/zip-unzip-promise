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
const obj_archiverOp = {
	zlib: {
		level: 9
	}
}



async function zip(input, str_outputZipPath, options={overwrite: false}){

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

	// 上書き確認
	if( await fse.exists(str_outputZipPath) && not.true(options.overwrite) ){
		throw new Error(`Already exists: ${str_outputZipPath}`);
	}

	// 出力先パスからdir抽出して作成
	const {dir: str_outputDirPath} = path.parse(str_outputZipPath);
	await fse.ensureDir(str_outputDirPath);

	// zipインスタンス(readable)
	const archive = new Archiver('zip', obj_archiverOp);
	const promise_archive = new Promise( (resolve, reject)=>{
		archive.on('end', resolve);
		archive.on('error', reject);
	});
	const promise_archive_onFinish = new Promise( (resolve)=>{
		archive.on('finish', resolve);
	});
	// .zipへの書き込みStream
	const writable = fse.createWriteStream(str_outputZipPath);
	const promise_writable = new Promise( (resolve, reject)=>{
		writable.on('error', reject);
		writable.on('finish', resolve);
	});
	archive.pipe(writable);

	// 圧縮するファイルのパスからstatと名前を取得、zipに書き込み
	for(let inputPath of arr_inputPath){
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

	return str_outputZipPath;
}

module.exports = zip;
