# document
いわゆる製作メモ。


## TODO
* イベント捕捉部分をawait-eventに。


## メモ

### 上書き確認について
手動でやっている。
fs.createWriteStream(, {flag})に任せると環境によっては機能しないため。

### 出力パスの正規化
unzip()にだけ実装したが、内部ディレクトリ部分がノーチェックだからあまり意味はない気がする。


## 構成
* test
    - index.js
        - テスト実行用。
    - contents
        - テスト素材入れ。
        - CP932.zipはファイル・ディレクトリ名と中身が全てエンコードCP932。


## Modules

### dependencies
* archiver
    * 圧縮。
* console-wrapper
    - 表示一括ON/OFF。
* encoding-japanese
    - 文字コード判定、サブ。
* iconv-lite
    - 文字コード変換。
* jschardet
    - 文字コード判定、メイン。
* sanitize-filename
    - 出力先パスの正規化。
* fs-extra
    * fs拡張。
* unzipper
    * 展開。
* @honeo/check
    * チェック等。

### devDependencies
* @honeo/test
    * テスト。
