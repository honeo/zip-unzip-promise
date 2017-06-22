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
const unzip2 = require('unzip2');
const {is, not, any} = require('@honeo/check');

async function list(inputZipPath){
	// console.log(`.list()`, `input: ${inputZipPath}`, `output: ${outputDirPath}`);
	return [];
}



module.exports = list;
