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

// Mod
const fse = require('fs-extra')
const path = require('path');
const unzip2 = require('node-unzip-2');
const {is, not, any} = require('@honeo/check');

async function unzip(inputZipPath, outputDirPath){
	// console.log(`.unzip()`, `input: ${inputZipPath}`, `output: ${outputDirPath}`);

	// validation
	if( not.str(inputZipPath) ){
		throw new TypeError(`Invalid arguments 1: ${inputZipPath}`);
	}
	if( not.str(outputDirPath) ){
		throw new TypeError(`Invalid arguments 2: ${outputDirPath}`);
	}

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


module.exports = unzip;
