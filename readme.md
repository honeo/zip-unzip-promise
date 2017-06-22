# zip-unzip-promise
* [honeo/zip-unzip-promise](https://github.com/honeo/zip-unzip-promise)  
* [zip-unzip-promise](https://www.npmjs.com/package/zip-unzip-promise)

## なにこれ
ZIP圧縮・展開など。

## 使い方
```sh
$ npm i zip-unzip-promise
```
```js
const {zip, unzip, list} = require('zip-unzip-promise');
```

## API

### .zip(inputPath [, outputPath])
引数1パスのファイル・ディレクトリまたはその配列を圧縮する。  
圧縮後ファイルのパスを引数に解決するpromiseを返す。
```js
// hoge.txt => hoge.zip
const zippath = await zip('hoge.txt');

// foobar => foobar.zip
const zipPath = await zip('./foobar');

// hoge, fuga.ext => piyo.zip
const zipPath = await zip([
	'./hoge',
	'./fuga.ext',
], './piyo.zip');
```

### .unzip(inputZipPath [, outputZipPath])
引数1パスの圧縮ファイルを展開する。  
展開先ディレクトリのパスを引数に解決するpromiseを返す。
```js
// hoge.zip => ./
const dirPath = await unzip('./hoge.zip');

// hoge.zip => fuga
const dirPath = await unzip('./hoge.zip', './fuga');
```

### .list(inputZipPath)
引数1パスの圧縮ファイル内のコンテンツ一覧を配列で取得する。  
取得した配列を引数に解決するpromiseを返す。
```js
// [...'content-name']
const arr = await list('hoge.zip');
```
