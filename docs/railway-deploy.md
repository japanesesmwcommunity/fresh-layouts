# Railwayへのデプロイ

## developmentでの確認状況

- NodeCG・`@nodecg/types` を2.8.0に更新済み。TypeScriptチェック、Railwayビルド、Extension読み込み、ログインページのHTTP 200を確認済み。更新後の動作はユーザーが問題なしと確認済み。
- Railway上でのコンテナビルド・非rootでのNodeCG直接起動を確認済み。
- Discordロールによるログインをユーザーが確認済み。
- 再デプロイ後の永続化をユーザーが確認済み。
- `assets` の永続Volumeへの追加後、アセットの永続化をユーザーが確認済み。
- Google Sheets連携は未設定。
- バックアップの設定・復元テストは未実施。

この構成は `entrypoint.sh` を使用しない。NodeCGをUID/GID 1001で直接起動し、永続Volume上の設定JSONをそのまま読む。

```text
/app/cfg  -> /data/cfg
/app/db   -> /data/db
/app/logs -> /data/logs
/app/assets -> /data/assets
```

Volumeの作成・初期化・設定アップロードはRailway側で一度行う。コンテナのビルド中やpre-deployではVolumeにアクセスできない。

## 1. サービスとVolume

Railwayにリポジトリを接続し、以下を設定する。

| 設定 | 値 |
| --- | --- |
| ビルド | Dockerfile |
| Dockerfileパス | `Dockerfile.railway` |
| Volumeマウント先 | `/data` |
| レプリカ数 | 1 |
| Serverless | 無効 |
| 自動デプロイ | 配信中の更新を避けるため無効を推奨 |
| Variablesの `PORT` | `9090` |
| 公開ドメインのtarget port | `9090` |
| 通常運用のStart Command | 空欄（DockerfileのCMDを使う） |

ボリュームは1つにまとめる。`/app` 全体にはマウントしない。

`railway.json` は既存サービス向けのレガシー設定として残している。2026年の公式仕様では新規サービスに適用できず、既存サービスも2026-12-01で読み取り終了予定。新規サービスは上記をサービス設定またはRailway IaCで設定する。既存サービスのIaC移行は `railway config migrate` で確認する。

## 2. 初回のVolume準備

設定ファイルが完成するまでは、通常のNodeCG起動へ切り替えない。NodeCGは設定未配置の場合に認証無効の既定値で起動し得る。

初回のみ、Variablesに `RAILWAY_RUN_UID=0` を設定し、Start Commandを次に変更してデプロイする。

```sh
sh -c 'mkdir -p /data/cfg /data/db /data/logs /data/assets && chown 1001:1001 /data/cfg /data/db /data/logs /data/assets && chmod 700 /data/cfg /data/db /data/logs /data/assets && exec tail -f /dev/null'
```

これはVolumeを準備して待機する一時的な管理用コマンド。NodeCGは起動せず、設定・DBも上書きしない。

既存データを移行する場合は、旧NodeCGを停止してからDBの関連ファイルを含めて移す。稼働中SQLiteのDB本体だけをコピーしない。既存のVolumeを再利用する場合は作り直さず、その内容を先に確認する。

## 3. 設定JSONを用意する

次のサンプルをローカルの `cfg/` にコピーして編集する。`cfg/` はGitとDockerのコピー対象から除外済み。

| サンプル | 保存名 |
| --- | --- |
| `deploy/railway/nodecg.example.json` | `cfg/nodecg.json` |
| `deploy/railway/fresh-layouts.example.json` | `cfg/fresh-layouts.json` |

すべての `REPLACE_WITH_...` を実際の値に置き換える。

- `baseURL`: `example.up.railway.app` のような公開ホスト名。`https://` や末尾の `/` は付けない。
- `sessionSecret`: 十分な長さのランダムな値を一度作成して保存する。既存DBを移す場合、現在の値を維持するか意図的に変更する。
- Discordのclient ID、client secret、許可するユーザーIDを設定する。IDはJSON文字列にする。
- Discord Developer Portalのredirect URIを `https://<公開ホスト>/login/auth/discord` に揃える。
- Google API keyとspreadsheet IDをバンドル設定に記入する。

セッション用のランダム値は、例えばローカルで次のコマンドにより作成できる。

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

以前の `NODECG_LOGIN_*`、`NODECG_BASE_URL`、`NODECG_GOOGLEAPI_KEY`、`NODECG_SPREADSHEET_ID` 等を設定JSONに変換する処理は廃止した。必要な値をJSONへ移し、動作確認後に不要なVariablesを削除する。`PORT` だけを変更してもJSONの待受ポートは変わらないため、9090に統一する。

## 4. アップロードと権限設定

Railway CLIで対象project/environment/serviceを選択する。

```sh
railway login
railway link
railway volume browse /
```

Volumeブラウザーで `cfg` に2つのJSONをアップロードする。Volumeファイル操作の `/` はVolumeのルートであり、コンテナの `/` とは異なる。

CLIのファイル操作を使う場合:

```sh
railway volume files upload ./cfg/nodecg.json /cfg/nodecg.json
railway volume files upload ./cfg/fresh-layouts.json /cfg/fresh-layouts.json
```

一時的な管理用デプロイに `railway ssh` で入り、アップロード後に次を実行する。

```sh
chown 1001:1001 /data/cfg/nodecg.json /data/cfg/fresh-layouts.json
chmod 600 /data/cfg/nodecg.json /data/cfg/fresh-layouts.json
```

DBやログを移行した場合は、移したファイルにもUID/GID 1001の読み書き権限を設定する。所有権の一括変更が必要な場合だけ、管理用デプロイで対象ディレクトリに `chown -R 1001:1001` を実行する。

## 5. 通常起動へ切り替える

1. `RAILWAY_RUN_UID=0` を削除する（Dockerfileの `USER nodecg` を使う）。
2. 一時的なStart Commandを削除して空欄にする。
3. 再デプロイする。

通常の起動コマンドは以下。初期化コマンドやpnpmは実行しない。

```text
node /app/node_modules/nodecg/index.js
```

公開ドメインを設定し、Discord認証、ダッシュボード、OBS用graphicsを確認する。起動に失敗したら、まずVolumeのマウント先、JSONの書式、ファイル権限を確認する。

## 6. 永続化の確認

配信時間外に以下を確認する。

1. ダッシュボードで保存対象のReplicant値を変更する。
2. `railway ssh` でNodeCGプロセスがUID 1001であることと、`/app/cfg`・`/app/db`・`/app/logs`・`/app/assets` のリンク先を確認する（SSH接続自体のユーザーとは区別する）。
3. `/data/db` にDB、`/data/logs/nodecg.log` にログが保存されることを確認する。
4. NodeCGのアセット画面からファイルをアップロードし、`/data/assets` に保存されることを確認する。
5. 再デプロイし、Replicant値・設定・アセットが維持され、ログが継続することを確認する。

設定JSONの変更はファイルを編集・アップロードし、権限を確認してから再デプロイする。NodeCG本体の設定の反映には再起動が必要。アップロードツールが所有権を変更する場合は、管理用デプロイで再度設定する。

## 運用上の注意点

- Volume付きサービスは再デプロイ時に短い停止がある。配信中の無停止更新を保証する構成ではない。
- Daily/WeeklyのVolumeバックアップを設定し、復元を確認する。秘密情報を含む `cfg` もバックアップ対象になる。
- NodeCGのファイルログはサンプルで有効にしている。ローテーションは自動追加していないため、容量を監視し、保管期限と退避・削除の運用を決める。
- `assets` も同じVolumeに保存する。旧構成から更新する場合は、再デプロイ前に旧コンテナの `/app/assets` の内容を `/data/assets` に移し、UID/GID 1001のアクセス権限を設定する。
- 専用のreadinessエンドポイントは未実装。継続監視や起動完了の監視を導入する際は、認証によるリダイレクトと正常応答を区別する。

Railwayの仕様・バックアップ・料金などの調査記録は [railway-2026.md](railway-2026.md) を参照。
