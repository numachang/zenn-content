# Worktabs 30秒デモ 撮影手順

2026-11-09の動画は、この流れをスクリプトで自動撮影しました。その撮影をもとに作った紹介動画はYouTubeにあります（[日本語](https://youtu.be/mR1Rff7QtwY)、[英語](https://youtu.be/DdB_f7G_cYw)）。

見本のリポジトリ（`C:\wt-demo`）で、本物のClaude Codeの会話を3本走らせて撮ります。録画は3〜5分回しっぱなしで構いません。あとで30秒に詰めます。

## 準備

1. 画面右下の録画用Worktabs（サイドバーに api-server と web-app だけが出ているもの）を最前面にして、ほかのウィンドウを重ねない。
2. TeamsやOutlookなど、通知を出すアプリを閉じる。応答不可（Do Not Disturb）はオフのまま。オンだとWorktabsの通知も出ません。
3. 各タブのチャット欄の下に出ている案内（Prefer the Terminal experience?、Browser connected）を × で閉じる。

## 3つの会話を始める

録画を始めてから、次の3つを送ります。長く走る feat-rate-limits を先に、承認待ちになる fix-login-redirect を最後に、15秒ほど空けて送ると場面が作りやすくなります。fix-login-redirect のタブは裏にしておきます（表のタブでは通知が出ません）。

**web-app / feat-dark-mode**（編集だけなので、止まらずに完了まで走る）

```text
Add a dark mode toggle to the settings page in src/settings/page.js, using currentTheme and setTheme from src/theme.js. Edit the files only. You do not need to run anything.
```

**web-app / fix-login-redirect**（`npm test` で承認待ちになる）

```text
After sign-in, users always land on /. Fix afterSignIn in src/auth/redirect.js so that it returns to the page they came from. It must never leave the site. Then run npm test to confirm.
```

**api-server / feat-rate-limits**（長めに走る）

```text
Add an in-memory rate limit to the public routes in src/routes/public.js: 60 requests per minute per IP, and 429 when exceeded. Include a Retry-After header. Add tests for it in test/public.test.js. Edit the files only. You do not need to run anything.
```

承認待ちが出ないときは、`C:\wt-demo\config.json` の `permissionMode` を `manual` にして起動し直します。

## 録画

Windows標準のSnipping Toolで録画します。`Win+Shift+R` を押し、録画用Worktabsのウィンドウをドラッグで囲んで「スタート」を押します。画面右下に出る通知も、録画範囲に重なるので映るはずです。終わったら停止を押します。

マウスカーソルも映るので、動かすときはゆっくり、クリックの前に一瞬止めると見やすくなります。

## 撮る場面（完成で30秒）

| 秒 | 操作 | 字幕（英語 / 日本語） |
|---|---|---|
| 0〜4 | 何もしない。サイドバーで3つの会話が同時に作業中 | Three Claude Code conversations. Three git worktrees. One window. / 3つの会話、3つのworktree、1つのウィンドウ |
| 4〜10 | サイドバーでworktreeを順にクリック | Every tab is real VS Code with the real Claude Code extension. / どのタブも本物のVS CodeとClaude Code拡張 |
| 10〜14 | ほかのタブを見ている間に fix-login-redirect がオレンジになり、通知が出る | One of them needs you. / 1つがあなたを待っている |
| 14〜20 | 通知かサイドバーの行をクリックして飛び、承認する | Jump straight to it. / クリックでその会話へ |
| 20〜26 | feat-dark-mode が緑になり通知が出る。クリックしてエディタで変更を見る | Review it in the editor you already use. / いつものエディタで確認 |
| 26〜30 | 終わりのカード（あとで付けます） | Keep your VS Code. github.com/worktabs/worktabs / VS Codeのまま、並列に |

## 録画のあと

録画ファイルの場所を教えてください。30秒に詰めて字幕を入れ、MP4とGIFにします。投稿するときは「見本のリポジトリで実際に動かした画面」と書き添えます。

Zennの`images/`に置ける画像は1ファイル3MBまでで、30秒のGIFはこれを超えやすいです。Zennの記事には、MP4をYouTubeに上げてURLを埋め込むのが確実です。GIFはREADMEやXに使います。

## 片付け

録画用のWorktabsを閉じてから、`C:\wt-demo` を丸ごと削除します。Claude Codeの会話履歴は `~/.claude/projects/` の `C--wt-demo-` で始まるフォルダに残るので、不要なら一緒に消せます。普段のWorktabsには何も残りません。
