/*
	Test
*/
const {name, version} = require('../package.json');
console.log(`${name} v${version}: test`);

// Modules
const {zip, unzip, debug} = require('../');
//debug(true);
const {is, not, any} = require('@honeo/check');
const fs = require('fs');
const fsp = require('fs-promise');
const ospath = require('ospath');
const path = require('path');
const Test = require('@honeo/test');

// Var
const option = {
	cd: path.join(ospath.tmp(), 'temp-zip-nzip-promise'),
	exit: true,
	init(){
		// ./foo/bar/foobar.txt, ./hoge.txt を作成する。
		return fsp.emptyDir('./').then( ()=>{
			return fsp.outputFile('./foo/bar/foobar.txt', 'foobar');
		}).then( ()=>{
			return fsp.outputFile('./hoge.txt', 'hogehoge');
		}).catch( (error)=>{
			return Promise.reject( new Error(`init failed: ${error.message}`) );
		});
	},
	prefix: ''
}

// Main
Test([
	// zip
	async function(){
		console.log('zip(filepath)');
		const zipPath = await zip('./hoge.txt');
		return fs.existsSync('./hoge.zip');
	},
	async function(){
		console.log('zip(filepath, zipPath)');
		const zipPath = await zip('./hoge.txt', './hogege.zip');
		return is.true(
			is.str(zipPath),
			fsp.existsSync('./hogege.zip')
		);
	},
	function(){
		console.log('zip(dirpath)');
		return zip('foo').then( (zipPath)=>{
			return fsp.exists('foo.zip');
		});
	},
	function(){
		console.log('zip(dirpath, zipPath)');
		return zip('./', './temppp.zip').then( ()=>{
			return fsp.exists('./temppp.zip');
		});
	},
	function(){
		console.log('zip([filepath, dirpath], outputPath)');
		return zip([
			'./hoge.txt',
			'./foo'
		], './bar.zip').then( (zipPath)=>{
			return fsp.exists('./bar.zip');
		});
	},

	// unzip
	function(){
		console.log('unzip(fileZipPath)');
		return zip('./foo/bar/foobar.txt').then(unzip).then( (path)=>{
			return fsp.exists('./foobar.txt');
		});
	},
	function(){
		console.log('unzip(dirZipPath)');
		return zip('./foo/bar').then(unzip).then( (path)=>{
			return fsp.exists('./bar');
		});
	},
	function(){
		console.log('unzip(file&dirZipPath, outputDir)');
		return zip(['./foo', './hoge.txt']).then( (path)=>{
			return unzip(path, 'output');
		}).then( (path)=>{
			return Promise.all([
				fsp.exists('./output/foo'),
				fsp.exists('./output/hoge.txt')
			]);
		}).then( (arr)=>{
			return arr.every( (bool)=>{return bool===true;});
		});
	},
], option);
