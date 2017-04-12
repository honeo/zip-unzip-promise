/*
	Test
*/
const {name, version} = require('../package.json');
console.log(`${name} v${version}: test`);

// Modules
const {zip, unzip, debug} = require('../');
debug(true);
const fsp = require('fs-promise');
const Test = require('@honeo/test');

// Var
const option = {
	cd: './temp',
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
	function(){
		console.log('zip(filepath)');
		return zip('./hoge.txt').then(fsp.exists);
	},
	function(){
		console.log('zip(filepath, zipPath)');
		return zip('./hoge.txt', './hogege.zip').then(fsp.exists);
	},
	function(){
		console.log('zip(dirpath)');
		return zip('./').then(fsp.exists);
	},
	function(){
		console.log('zip(dirpath, zipPath)');
		return zip('./', './tempp.zip').then(fsp.exists);
	},
	function(){
		console.log('zip([filepath, dirpath], outputPath)');
		return zip([
			'./hoge.txt',
			'./foo'
		], './bar.zip').then(fsp.exists);
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
