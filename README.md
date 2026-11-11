# zenn-content

[Zenn](https://zenn.dev/)に投稿する記事を管理するリポジトリです。`main`にpushすると、Zennに自動でデプロイされます。

## 連携の設定

Zennの[リポジトリ設定](https://zenn.dev/dashboard/deploys?tab=repo_settings)は、次のとおりです。

| 項目 | 値 |
|---|---|
| デプロイ対象ブランチ | `main` |
| リポジトリへのリンク | 表示する |
| PRで下書きデプロイ | 無効 |

このリポジトリはPublicです。`published: false`の記事も、pushするとGitHubでは誰でも読めます。

## フォルダ

| フォルダ | 内容 |
|---|---|
| `articles/` | 記事。ファイル名がslugになります |
| `books/` | 本 |
| `images/<slug>/` | 記事の画像 |
| `materials/<slug>/` | 記事を作るための資料（撮影手順など）。Zennには出ませんが、GitHubでは読めます |

## 準備

```sh
npm ci
```

## 記事を書く

```sh
npx zenn new:article --slug <slug>
npx zenn preview
```

プレビューは http://localhost:8000 で見られます。

- **slug:** 英小文字、数字、`-`、`_`で12〜50字にします。URLの一部になるので、公開後は変えません。
- **emoji:** 1文字だけ指定します。
- **type:** 技術記事は`tech`、アイデア記事は`idea`です。
- **画像:** `images/<slug>/`に置き、本文では`![説明](/images/<slug>/file.png)`のように`/images/`から書きます。使えるのは`.png`、`.jpg`、`.jpeg`、`.gif`、`.webp`で、1ファイル3MBまでです。
- **画像の説明文:** 画像のすぐ下の行に`*説明*`と書きます。
- **動画:** ZennのガイドにはMP4を直接埋め込む方法の記載がありません。YouTubeのURLだけの行を、前後に空行を入れて置きます。短い動きならGIFかWebPを`images/`に置きます。
- **メモ:** `<!-- メモ -->`は公開ページに出ません。1行で書きます。

## 公開する

1. 未完成の印が残っていないことを確かめます。HTMLコメントは公開ページに出ませんが、GitHubでは読めます。

   ```sh
   grep -n "TODO" articles/<slug>.md
   ```

2. `npx zenn preview`で、表示と画像を確かめます。
3. 記事の`published`を`true`に変えます。
4. `main`にpushします。
5. [デプロイの画面](https://zenn.dev/dashboard/deploys)で成功を確かめてから、公開ページを開きます。

日時を決めて公開するときは、次のように書いてpushします。時刻はJSTで、過ぎると自動で公開されます。

```yaml
published: true
published_at: 2026-11-20 09:00
```

## 注意

- `main`にpushすると、すぐにデプロイされます。公開したくない記事は`published: false`のままにします。
- 公開済みの記事は、本文を直して`main`にpushすると更新されます。
- 使っている画像を`images/`から消すと、Zennからも消えます。
- 画像を差し替えた直後は、最大1分ほど古い画像が出ることがあります。
- ダッシュボードの「手動デプロイ」は、全投稿をデプロイし直すとき以外は不要です。

## 参考

- [Zenn CLIの使い方](https://zenn.dev/zenn/articles/zenn-cli-guide)
- [GitHubリポジトリとの連携](https://zenn.dev/zenn/articles/connect-to-github)
- [GitHubリポジトリの画像を使う](https://zenn.dev/zenn/articles/deploy-github-images)
- [Markdown記法](https://zenn.dev/zenn/articles/markdown-guide)
