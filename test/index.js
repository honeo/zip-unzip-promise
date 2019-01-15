/*
	Test
*/
const {name, version} = require('../package.json');
console.log(`${name} v${version}: test`);

// Modules
const {zip, unzip, list, debug} = require('../');
//debug(true);
const {is, not, any} = require('@honeo/check');
const fse = require('fs-extra');
const ospath = require('ospath');
const path = require('path');
const Test = require('@honeo/test');

// Var
const option = {
	chtmpdir: true,
	exit: true,
	init(){
		// ./foo/bar/foobar.txt, ./hoge.txt を作成する。
		return fse.emptyDir('./').then( ()=>{
			return fse.outputFile('./foo/bar/foobar.txt', 'foobar');
		}).then( ()=>{
			return fse.outputFile('./hoge.txt', 'hogehoge');
		}).catch( (error)=>{
			return Promise.reject( new Error(`init failed: ${error.message}`) );
		});
	}
}

// Main
Test([

	// zip
	async function(){
		console.log('zip(inputFile, outputFile)');
		const zipPath = await zip('hoge.txt', 'hoge.zip');
		return is.true(
			is.str(zipPath),
			fse.existsSync('./hoge.zip')
		);
	},

	async function(){
		console.log('zip(inputDir, outputFile)');
		const zipPath = await zip('foo', 'foo.zip');
		return is.true(
			is.str(zipPath),
			fse.existsSync('foo.zip')
		);
	},

	async function(){
		console.log('zip([inputFile, inputDir], outputFile)');
		const zipPath = await zip([
			'./hoge.txt',
			'./foo'
		], './bar.zip');
		return is.true(
			is.str(zipPath),
			fse.existsSync('./bar.zip')
		);
	},

	async function(){
		console.log('zip(inputFile, NotExistDir/outputFile)');
		const zipPath = await zip('hoge.txt', 'not/exist/dir/hoge.zip');
		return is.true(
			is.str(zipPath),
			fse.existsSync('./not/exist/dir/hoge.zip')
		);
	},

	async function(){
		console.log('zip(inputFile, outputDuplicateFile) case success');
		const zipPath1 = await zip('hoge.txt', 'archive.zip');
		const zipPath2 = await zip('hoge.txt', 'archive.zip', {
			overwrite: true
		});
		return is.true(
			is.str(zipPath1, zipPath2),
			zipPath1===zipPath2,
			fse.existsSync('archive.zip')
		);
	},

	async function(){
		console.log('zip(inputFile, outputDuplicateFile) case fail');
		const zipPath = await zip('hoge.txt', 'archive.zip');
		const result = await zip('hoge.txt', 'archive.zip').catch( (error)=>{
			return error;
		});
		return is.true(
			is.str(zipPath),
			fse.existsSync('archive.zip'),
			is.error(error)
		);
	},

	// unzip
	async function(){ // 単一ファイルの書庫を解凍
		console.log('unzip(inputFileZip, outputDir)');
		const zipPath = await zip('./foo/bar/foobar.txt', './foobar.zip');
		const dirPath = await unzip(zipPath, './');
		return is.true(
			fse.existsSync('./foobar.txt'),
			is.str(dirPath)
		);
	},

	async function(){ // ディレクトリの書庫を解凍
		console.log('unzip(inputDirZip, outputDir)');
		const zipPath = await zip('./foo/bar', './bar.zip');
		const dirPath = await unzip(zipPath, './bar');
		return is.true(
			is.str(dirPath),
			fse.existsSync('./bar')
		);
	},
	async function(){ // ファイル・ディレクトリ混合の書庫を解凍
		console.log('unzip(inputFile&DirZip, outputDir)');
		const zipPath = await zip(['./foo', './hoge.txt'], 'archive.zip');
		const dirPath = await unzip(zipPath, './output');
		return is.true(
			fse.existsSync('./output/foo'),
			fse.existsSync('./output/hoge.txt')
		);
	},

	// list
	async function(){
		console.log('list(zipPath)');
		const zipPath = await zip(['./foo', './hoge.txt'], 'archive.zip');
		const result = await list(zipPath);
		return is.true(
			is.arr(result),
			result.includes('hoge.txt'),
			result.includes('foo/bar/'),
			result.includes('foo/bar/foobar.txt')
		);
	}

], option);
