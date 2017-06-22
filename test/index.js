/*
	Test
*/
const {name, version} = require('../package.json');
console.log(`${name} v${version}: test`);

// Modules
const {zip, unzip, debug} = require('../');
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
		console.log('zip(filepath)');
		const zipPath = await zip('./hoge.txt');
		return is.true(
			is.str(zipPath),
			fse.existsSync('./hoge.zip')
		);
	},
	async function(){
		console.log('zip(filepath, zipPath)');
		const zipPath = await zip('./hoge.txt', './hogege.zip');
		return is.true(
			is.str(zipPath),
			fse.existsSync('./hogege.zip')
		);
	},
	async function(){
		console.log('zip(dirpath)');
		const zipPath = await zip('foo');
		return is.true(
			is.str(zipPath),
			fse.existsSync('foo.zip')
		);
	},
	async function(){
		console.log('zip(dirpath, zipPath)');
		const zipPath = await zip('./', './temppp.zip');
		return is.true(
			is.str('zipPath'),
			fse.existsSync('./temppp.zip')
		);
	},
	async function(){
		console.log('zip([filepath, dirpath], outputPath)');
		const zipPath = await zip([
			'./hoge.txt',
			'./foo'
		], './bar.zip');
		return is.true(
			is.str(zipPath),
			fse.existsSync('./bar.zip')
		);
	},

	// unzip
	async function(){
		console.log('unzip(fileZipPath)');
		const zipPath = await zip('./foo/bar/foobar.txt');
		const dirPath = await unzip(zipPath);
		return is.true(
			fse.existsSync('./foobar.txt'),
			is.str(dirPath)
		);
	},
	async function(){
		console.log('unzip(dirZipPath)');
		const zipPath = await zip('./foo/bar');
		const dirPath = await unzip(zipPath);
		return is.true(
			is.str(dirPath),
			fse.existsSync('./bar')
		);
	},
	async function(){
		console.log('unzip(file&dirZipPath, outputDir)');
		const zipPath = await zip(['./foo', './hoge.txt']);
		const dirPath = await unzip(zipPath, 'output');
		return is.true(
			fse.existsSync('./output/foo'),
			fse.existsSync('./output/hoge.txt')
		);
	},
], option);
