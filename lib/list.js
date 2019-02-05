// Mod
const console = require('console-wrapper');
const unzip = require('./unzip.js');

// Var
const obj_defaultOp = {
	encode: 'utf8'
}

/*
	zipファイルのコンテンツ一覧を取得する
		unzipラッパー。

		引数
			1: string
				参照する.zipファイルのパス。
		返り値
			promise
				取得した [...'path'] を引数に解決する。
*/
async function list(str_inputZipPath, options={}){
	console.group('list()', str_inputZipPath, options);

	const arr_path = [];
	const options_merged = Object.assign({}, obj_defaultOp, options, {
		filter({path, type}){
			arr_path.push(path);
			return false;
		}
	});

	return unzip(str_inputZipPath, '', options_merged).then( (args)=>{
		console.log('result', arr_path);
		return arr_path;
	}).finally( ()=>{
		console.groupEnd();
	});
}



module.exports = list;
