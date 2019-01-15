/*
	zipファイルのコンテンツ一覧を取得する

	引数
		1: string
			参照する.zipファイルのパス。

	返り値
		promise
			取得した [...'content-name'] を引数に解決する。
*/

// Mod
const fse = require('fs-extra')
const path = require('path');
const unzip2 = require('node-unzip-2');
const {is, not, any} = require('@honeo/check');

async function list(inputZipPath){
	if( not.str(inputZipPath) ){
		throw new TypeError(`Invalid argument: ${inputZipPath}`);
	}

	const resultArray = [];
	const readable = fse.createReadStream(inputZipPath);
	const duplex = unzip2.Parse();
	readable.pipe(duplex).on('entry', (entry)=>{
		resultArray.push(entry.path);
		entry.autodrain();
	});
	const promise_readable_close = new Promise( (resolve, reject)=>{
		readable.on('close', resolve);
		readable.on('error', reject);
	});
	const promise_duplex_close = new Promise( (resolve, reject)=>{
		duplex.on('close', resolve);
		duplex.on('error', reject);
	});
	const promise_duplex_finish = new Promise( (resolve, reject)=>{
		duplex.on('finish', resolve);
		duplex.on('error', reject);
	});
	await Promise.all([
		promise_readable_close,
		promise_duplex_close,
		promise_duplex_finish
	]);
	return resultArray;
}



module.exports = list;
