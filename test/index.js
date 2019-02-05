/*
	Test
*/

// Modules
const {zip, unzip, list, debug} = require('../');
const console = require('console-wrapper');
const {is, not, any} = require('@honeo/check');
const fse = require('fs-extra');
const path = require('path');
const Test = require('@honeo/test');

// Var
const options = {
	chtmpdir: true,
	exit: !true,
	init(){},
	tmpdirOrigin: './contents'
}

const {name, version} = require('../package.json');
console.enable();
console.log(`${name} v${version}: test`);


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
		console.log('zip(inputs, outputDuplicateFile, {overwrite: true})');
		await zip('hoge.txt', 'archive.zip');
		const stats_before = await fse.stat('archive.zip');
		await zip(['hoge.txt', 'foo'], 'archive.zip', {
			overwrite: true
		});
		const stats_after = await fse.stat('archive.zip');
		return is.true(
			is.number(stats_before.size,stats_after.size),
			stats_before.size!==stats_after.size,
			await fse.exists('archive.zip')
		);
	},

	async function(){
		console.log('zip(inputFile, outputDuplicateFile, {overwrite: false})');
		await zip('hoge.txt', 'archive.zip');
		const stats_before = await fse.stat('archive.zip');
		await zip('hoge.txt', 'archive.zip', {
			overwrite: false
		});
		const stats_after = await fse.stat('archive.zip');
		return is.true(
			stats_before.atimeMs===stats_after.atimeMs,
			fse.existsSync('archive.zip')
		);
	},

	async function(){
		console.log('zip(inputFile, outputDuplicateFile, {filter}) all');
		let isExeced = false;
		const str_filePath = await zip('hoge.txt', 'archive.zip', {
			filter({path, type}){
				isExeced = true;
				return is.str(path, type);
			}
		});
		return is.true(
			isExeced,
			is.str(str_filePath),
			fse.existsSync('archive.zip')
		);
	},

	async function(){
		console.log('zip(inputFile, outputDuplicateFile, {filter}) no output');
		let isExeced = false;
		const str_filePath = await zip('hoge.txt', 'archive.zip', {
			filter({path, type}){
				isExeced = true;
				return false;
			}
		});
		return is.true(
			isExeced,
			str_filePath==='',
			!fse.existsSync('archive.zip')
		);
	},



	/*
		unzip
	*/
	async function(){ // 単一ファイルの書庫を解凍
		console.log('unzip(inputFileZip, outputDir)');
		const str_dirPath = await unzip('file.zip', './');
		return is.true(
			await fse.exists('file.zip'),
			await fse.exists('file.txt'),
			is.str(str_dirPath)
		);
	},

	async function(){ // 空ディレクトリの書庫を解凍
		console.log('unzip(inputDirZip, outputDir)');
		const str_dirPath = await unzip('emptyDir.zip', './');
		return is.true(
			is.str(str_dirPath),
			fse.existsSync('emptyDir')
		);
	},

	async function(){ // ファイル・ディレクトリ混合の書庫を解凍
		console.log('unzip(inputFile&DirZip, outputDir)');
		const str_dirPath = await unzip('dir.zip', './');
		return is.true(
			fse.existsSync('dir'),
			fse.existsSync('dir/file.txt')
		);
	},


	async function(){ // 存在しないdirへ解凍
		console.log('unzip(inputFileZip, outputNotExistDir)');
		const str_dirPath = await unzip('file.zip', 'not/exist/dir');
		return is.true(
			await fse.exists('file.zip'),
			await fse.exists('not/exist/dir/file.txt'),
			is.str(str_dirPath)
		);
	},

	async function(){ // 上書き
		console.log('unzip(inputFileZip, outputDuplicateDir, {overwrite: true})');
		const str_dirPath1 = await unzip('file.zip', './');
		const stats_before = await fse.stat('file.txt');
		const str_dirPath2 = await unzip('file.zip', './', {overwrite: true});
		const stats_after = await fse.stat('file.txt');
		console.log(stats_before);
		console.log(stats_after);
		return is.true(
			fse.existsSync('file.txt'),
			fse.existsSync('file.zip'),
			stats_before.ctimeMs!==stats_after.ctimeMs
		);
	},


	async function(){ // 上書きしない
		console.log('unzip(inputFileZip, outputDuplicateDir, {overwrite: false})');
		const str_dirPath1 = await unzip('file.zip', './');
		const stats_before = await fse.stat('file.txt');
		const str_dirPath2 = await unzip('file.zip', './', {overwrite: false});
		const stats_after = await fse.stat('file.txt');
		return is.true(
			fse.existsSync('file.txt'),
			fse.existsSync('file.zip'),
			stats_before.atimeMs===stats_after.atimeMs
		);
	},


	async function(){
		console.log('unzip(inputFileZip, outputDuplicateDir, {filter}) all');
		let isExeced = false;
		const str_dirPath = await unzip('dir.zip', 'output', {
			filter({path, type}){
				isExeced = true;
				return is.str(path, type);
			}
		});
		return is.true(
			isExeced,
			is.str(str_dirPath),
			fse.existsSync('output/dir'),
			fse.existsSync('output/dir/file.txt')
		);
	},

	async function(){
		console.log('unzip(inputFileZip, outputDuplicateDir, {filter}); dir only');
		let isExeced = false;
		const str_dirPath = await unzip('dir.zip', 'output', {
			filter({path, type}){
				console.log('filter', path, type);
				isExeced = true;
				return type==='Directory';
			}
		});
		return is.true(
			isExeced,
			is.str(str_dirPath),
			!fse.existsSync('output/dir/file.txt')
		);
	},


	/*
		list
	*/
	async function(){
		console.log('list(zipPath)');
		const arr1 = await list('dir.zip');
		const arr2 = await list('emptyDir.zip');
		const arr3 = await list('file.zip');
		return is.true(
			// arr1
			arr1.length===1,
			path.normalize('dir/file.txt')===arr1[0],
			// 2
			arr2.length===1,
			path.normalize('emptyDir/')===arr2[0],
			// 3
			arr3.length===1,
			'file.txt'===arr3[0]
		);
	},

	async function(){
		console.log('list(zipPath, {encode})');
		const arr1 = await list('CP932.zip');
		const arr2 = await list('CP932.zip', {
			encode: 'CP932'
		});
		return is.true(
			is.str(arr1[0], arr2[0]),
			arr1[0]!==arr2[0],
			arr2[0]===path.normalize('ディレクトリ/テキストファイル.txt')
		);
	}


], options).catch( (error)=>{
	console.log('catch', error)
});
