# zip-unzip-promise
* [honeo/zip-unzip-promise](https://github.com/honeo/zip-unzip-promise)
* [zip-unzip-promise](https://www.npmjs.com/package/zip-unzip-promise)


## なにこれ
ZIP圧縮・展開など。


## 使い方
```bash
$ npm i zip-unzip-promise
```
```js
const {zip, unzip, list} = require('zip-unzip-promise');
```


## API
* 出力先について
	- ファイルが既にあればスキップする。
	- ディレクトリがなければ作成する。
	- [node-sanitize-filename](https://github.com/parshap/node-sanitize-filename)で正規化する。

### options
| key       | type     | default | description                                                            |
|:--------- |:-------- | ------- | ---------------------------------------------------------------------- |
| encode    | string   | "utf8"  | 書庫のファイル・ディレクトリ名に使われている[文字コード名](https://github.com/ashtuchkin/iconv-lite/wiki/Supported-Encodings)。       |
| filter    | function |         | 出力するコンテンツ毎にobjectを引数に実行され、falseが返ればskipする。 |
| overwrite | boolean  | false   | 上書きを許可するか。                                                   |


### .zip(input, outputFilePath [, options])
引数1パスのファイル・ディレクトリまたはそれらの配列を元に圧縮する。
作成した圧縮ファイルの絶対パスを引数に解決するpromiseを返す。
```js
// file => archive
const zipPath = await zip('hoge.txt', 'hoge.zip');

// dir => dir/archive
const zipPath = await zip('hoge', 'output/hoge.zip');

// dir & file => archive
const zipPath = await zip([
	'./hoge', './fuga.ext'
], './piyo.zip');



/*
	options
*/

// overwrite: all
const zipPath = await zip('foo.ext', 'bar.zip', {
	overwrite: true
});

// overwrite: if old
const zipPath = await zip('foo.ext', 'bar.zip', {
	overwrite: true,
	filter({path, type}){
		const stats = fs.statSync(path);
		return stats.birthtime.getFullYear() < new Date().getFullYear();
	}
});
```


### .unzip(inputFilePath, outputDirPath [, options])
引数1パスの圧縮ファイルを展開する。
展開先ディレクトリの絶対パスを引数に解決するpromiseを返す。
```js
// archive => contents
const dirPath = await unzip('./hoge.zip', './');

// archive => dir/contents
const dirPath = await unzip('./hoge.zip', './output');



/*
	options
*/

// overwrite
const dirPath = await unzip('foo.zip', 'bar', {
	overwrite: true
});

// output: *.txt file only
const dirPath = await unzip('foo.zip', 'bar', {
	filter({path, type}){
		return type==='File' && /\.txt$/.test(path);
	}
});

// for not UTF-8
const dirPath = await unzip('archive.zip', './', {
	encode: 'Shift_JIS'
});
```


### .list(inputFilePath, [, options])
引数1パスの圧縮ファイル内のコンテンツ一覧を配列で取得する。
取得した配列を引数に解決するpromiseを返す。
```js
// [...pathString]
const arr = await list('hoge.zip');

// options
const arr = await list('hoge.zip', {encode: 'sjis'});
```



## Breaking Changes

### v1 => v2
* .zip()
	- 引数2が必須化。
* .unzip()
	- 引数2が必須化。
