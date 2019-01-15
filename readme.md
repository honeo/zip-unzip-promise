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

* 出力先に指定したファイル・ディレクトリの親ディレクトリがなければ作成する。
* options.overwriteがtrueなら出力ファイルによる上書きを許可する。

### .zip(input, outputFilePath [, options])
引数1パスのファイル・ディレクトリまたはそれらの配列を元に圧縮する。  
作成した圧縮ファイルのパス文字列を引数に解決するpromiseを返す。
```js
// hoge.txt => hoge.zip
const str_outputFilePath = await zip('hoge.txt', 'hoge.zip');

// hoge => output/hoge.zip
const str_outputFilePath = await zip('hoge', 'output/hoge.zip');

// hoge, fuga.ext => piyo.zip
const str_outputFilePath = await zip([
	'./hoge',
	'./fuga.ext',
], './piyo.zip');

// options
const str_outputFilePath = await zip('foo.ext', 'bar.zip', {
	overwrite: true
});
```


### .unzip(inputFilePath, outputDirPath [, options])
引数1パスの圧縮ファイルを展開する。  
展開先ディレクトリのパスを引数に解決するpromiseを返す。
```js
// hoge.zip => ...
const str_outputDirPath = await unzip('./hoge.zip', './');

// hoge.zip => output/...
const str_outputDirPath = await unzip('./hoge.zip', './output');

// options
const str_outputDirPath = await unzip('foo.zip', 'bar', {
	overwrite: true
});
```


### .list(inputFilePath)
引数1パスの圧縮ファイル内のコンテンツ一覧を配列で取得する。  
取得した配列を引数に解決するpromiseを返す。
```js
// [...'file.ext', 'dir/']
const arr = await list('hoge.zip');
```
