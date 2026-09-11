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
   - シート名：`本番用データ`
   - 1行目：見出し
   - 2行目以降：A列に走者名、B列にTwitch ID、C列にメッセージ
4. `cfg/fresh-layouts.json` に `googleApiKey` と `spreadsheetId` を設定します。
5. NodeCGを再起動します。
6. 「情報管理」→「走者一覧」の「更新」で取り込みます。既存の走者一覧は置き換わります。

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
