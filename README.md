# fresh-layouts

## 開発

- Node.js 24
- pnpm 12.4.0

プロジェクトのルートで実行します。

```sh
pnpm install
pnpm dev
```

- 起動ログのURLからダッシュボードを開きます。
- ビルドは `pnpm build` を実行します。

## スプレッドシートの連携

1. Google CloudでGoogle Sheets APIを有効にし、APIキーを取得します。
2. スプレッドシートを「リンクを知っている全員・閲覧者」で共有します。
3. シートを次の形式で作成します。
   - シート名：`走者`
   - 1行目：A列 `name`、B列 `category`、C列 `message`、D列 `twitch_id`
   - 2行目以降：走者名、カテゴリー、メッセージ、Twitch IDの順で1行につき1人を入力
   - 列の位置で読み込むため、この順序を維持する
4. `cfg/fresh-layouts.json` に `googleApiKey` と `spreadsheetId` を設定します。
5. NodeCGを再起動します。
6. 「1-情報管理」→「スプレッドシート取得」の「走者情報を取得」で取り込みます。既存の走者一覧は置き換わります。

## ダッシュボード

- **0-配信管理**：タイマーと完走操作、スケジュールの配信への反映、Twitch配信情報の編集。
- **1-情報管理**：スケジュールの追加・編集・削除、走者情報の編集、スプレッドシートからの手動取得。

スケジュールの反映はタイマー停止中に行います。反映時にはタイマーと完走記録がリセットされます。Twitchの配信タイトル・カテゴリーは「Twitchに反映」で個別に更新します。
走者を編集すると登録済みスケジュールにも反映されます。配信中の情報は保持され、スケジュールを再反映したときに更新されます。スプレッドシートの再取得は走者一覧だけを置き換えます。

## 背景・ロゴ画像

NodeCGのAssetsにある「背景」「ロゴ」から画像をアップロードします。各カテゴリに1枚ずつ登録してください。複数ある場合は一覧の先頭を使用します。変更は配信画面へ自動反映されます。未登録時は同梱画像を表示します。

- 背景：`assets/fresh-layouts/bg/`（1920×1080推奨）
- ロゴ：`assets/fresh-layouts/logo/`

Assetsの画像は環境ごとに保存されます。新しい環境ではアップロードしてください。

## Twitch連携

`cfg/fresh-layouts.json` の `twitch` に設定します。未設定でも他のパネルは利用できます。

```json
{
	"googleApiKey": "REPLACE_WITH_GOOGLE_API_KEY",
	"spreadsheetId": "REPLACE_WITH_SPREADSHEET_ID",
	"twitch": {
		"clientId": "REPLACE_WITH_TWITCH_CLIENT_ID",
		"clientSecret": "REPLACE_WITH_TWITCH_CLIENT_SECRET",
		"broadcasterId": "REPLACE_WITH_TWITCH_USER_ID",
		"refreshToken": "REPLACE_WITH_TWITCH_REFRESH_TOKEN",
		"tokenFile": "db/fresh-layouts/twitch-token.json"
	}
}
```

配信するアカウント自身で、`channel:manage:broadcast` を許可したAuthorization Code GrantのRefresh Tokenを取得してください。任意で初回の `accessToken` も設定できます。取得方法は[Twitch公式認証ドキュメント](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#authorization-code-grant-flow)を参照してください。

extensionは起動時と1時間ごとに認証を検証し、401応答時にトークンを更新します。Client ID・配信者ID・必要な権限も検証します。Twitch設定はブラウザーに公開しません。更新されたトークンは `tokenFile` に保存します。このファイルと親ディレクトリへの書き込みを許可し、永続化してください。Railwayの既存構成では `db/` はVolumeに保存されます。設定のRefresh Tokenを変更すると保存済みトークンを使わず、新しい認証設定を使用します。

配信情報パネルの「再取得」で現在の情報を取得し、タイトルと検索したカテゴリーを編集して「Twitchに反映」を押します。タイトルは1〜140文字です。カテゴリーの選択解除は未設定にします。

API仕様：[配信情報の更新](https://dev.twitch.tv/docs/api/reference/#modify-channel-information)、[トークン検証](https://dev.twitch.tv/docs/authentication/validate-tokens/)、[トークン更新](https://dev.twitch.tv/docs/authentication/refresh-tokens/)。

## 検証

```sh
pnpm test
pnpm run typecheck
pnpm build
```

## デプロイ

1. Railway CLIをインストールします。
2. `railway login` でログインします。
3. 初めて環境を作る場合は、下の「初回セットアップ」を行います。

更新時：

1. `railway link` で対象のプロジェクト・環境・サービスを選びます。
2. `railway status` で接続先を確認します。
3. ローカルの未コミット分を含む変更を確認します。
4. 配信時間外に `railway up` を実行します。

### 初回セットアップ

#### 1. 環境を作成する

1. Railwayで空のプロジェクトと環境を作成します。
2. `railway link` で接続します。
3. `.railway/railway.ts` の `development` 分岐を元に対象環境の定義を作成します。同名の分岐があれば置き換えます。
   - 環境名・プロジェクト名・サービス名・Volume名を変更
   - `PORT: "9090"` を設定
4. `railway config plan` で差分を確認します。
5. `railway config apply` で適用します。
6. `railway link` で作成したサービスを選びます。
7. Networkingで公開ドメインを生成し、target portを9090にします。

#### 2. Volumeを準備する

1. サービスのVariablesに `RAILWAY_RUN_UID=0` を追加します。
2. Start Commandを次に設定します。

   ```sh
   sh -c 'mkdir -p /data/cfg /data/db /data/logs /data/assets && chown 1001:1001 /data/cfg /data/db /data/logs /data/assets && chmod 700 /data/cfg /data/db /data/logs /data/assets && exec tail -f /dev/null'
   ```

3. `railway up` を実行します。

#### 3. 認証と設定ファイルを用意する

1. Discord Developer Portalでアプリを作成し、Client ID・Client Secretを取得します。
2. OAuth2のRedirectsに `https://<公開ホスト名>/login/auth/discord` を登録します。
3. `deploy/railway/nodecg.example.json` を `cfg/nodecg.json` にコピーします。
4. `REPLACE_WITH_...` を置き換えます。
   - `baseURL`：公開ホスト名のみ
   - `clientID`・`clientSecret`：取得した認証情報
   - `allowedUserIDs`：ログインを許可するDiscordユーザーID
   - `sessionSecret`：次のコマンドで生成した値

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

5. `deploy/railway/fresh-layouts.example.json` を `cfg/fresh-layouts.json` にコピーします。
6. Google APIキーとスプレッドシートIDを設定します。Sheets連携を使わない場合は `{}` にします。

#### 4. 設定を配置して起動する

```sh
railway volume files upload ./cfg/nodecg.json /cfg/nodecg.json
railway volume files upload ./cfg/fresh-layouts.json /cfg/fresh-layouts.json
railway ssh
```

SSH接続先で実行します。

```sh
chown 1001:1001 /data/cfg/nodecg.json /data/cfg/fresh-layouts.json
chmod 600 /data/cfg/nodecg.json /data/cfg/fresh-layouts.json
exit
```

1. Variablesから `RAILWAY_RUN_UID` を削除します。
2. Start Commandを空欄に戻します。
3. `railway up` を実行します。
4. 公開URLでDiscordログイン・ダッシュボード・配信画面を確認します。

### 設定を変更する

`railway link` と `railway status` で対象環境を確認します。

Railwayの構成：

1. `.railway/railway.ts` を編集します。
2. `railway config plan` で差分を確認します。
3. `railway config apply` で適用します。

NodeCGの設定を変える場合は `cfg/` のJSONを編集し、変更したファイルを上書きします。

```sh
railway volume files upload ./cfg/nodecg.json /cfg/nodecg.json --overwrite
railway volume files upload ./cfg/fresh-layouts.json /cfg/fresh-layouts.json --overwrite
```

1. `railway ssh` で所有者・グループが1001、権限が600であることを確認します。
2. 権限の修正が必要なら、初回と同じ管理用Start Commandと `RAILWAY_RUN_UID=0` で起動して修正し、通常起動へ戻します。
3. `railway up` で反映します。
