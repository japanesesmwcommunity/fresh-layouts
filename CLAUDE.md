# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

これは配信用のオーバーレイグラフィックス向けNodeCGバンドル「fresh-layouts」です。UIコンポーネントにReact、型安全性にTypeScript、バンドラーにViteを使用しています。

## アーキテクチャ

### NodeCGバンドル構造

- **Extension** (`src/extension/`): NodeCGのNode.js環境で実行されるサーバーサイドロジック
- **Dashboard** (`src/browser/dashboard/`): バンドルを制御するための管理インターフェースパネル
- **Graphics** (`src/browser/graphics/`): OBS/配信ソフトウェアに表示されるオーバーレイグラフィックス
- **Schemas** (`schemas/`): レプリカントデータ構造を定義するJSONスキーマ

### 主要コンポーネント

- **レプリカント**: エクステンションとブラウザコンテキスト間の共有状態（`src/nodecg/replicants.d.ts`で定義）
- **メッセージ**: イベントベース通信システム（`src/nodecg/messages.d.ts`で定義）
- **タイマーシステム**: 開始/停止/リセット制御を備えた時間追跡のコア機能

### 型システム

- JSONスキーマから`nodecg schema-types`を使用して自動生成される型
- 包括的なエラーチェックを備えた厳密なTypeScript設定
- ブラウザ（`src/browser/tsconfig.json`）とエクステンション（`src/extension/tsconfig.json`）コンテキスト用の別々のtsconfig

## 開発コマンド

```bash
# 開発環境を開始（TypeScriptコンパイラ、Vite、NodeCGを実行）
npm run dev

# JSONスキーマからTypeScript型を生成
npm run generate-schema-types

# プロダクション用ビルド
npm run build
```

## 開発フロー

1. **新しいレプリカントの追加**:
   - `schemas/`ディレクトリにJSONスキーマを作成
   - `npm run generate-schema-types`を実行してTypeScript定義を生成
   - `src/nodecg/replicants.d.ts`の`ReplicantMap`に追加

2. **新しいメッセージの追加**:
   - `src/nodecg/messages.d.ts`でメッセージ型を定義
   - エクステンションコードで`nodecg.listenFor()`を使用
   - ダッシュボードからトリガーするために`nodecg.sendMessage()`を使用

3. **ダッシュボードパネルの作成**:
   - `src/browser/dashboard/views/`に新しいビューを追加
   - `package.json`の`nodecg.dashboardPanels`で設定
   - 一貫性のためにMaterial-UIコンポーネントを使用

4. **グラフィックスの作成**:
   - `src/browser/graphics/views/`に新しいビューを追加
   - `package.json`の`nodecg.graphics`で設定
   - 共有状態にアクセスするために`useReplicant`フックを使用

## コードスタイル

- タブを使用するPrettier、セミコロンを使用するように設定を上書き
- prettierプラグインによる整理されたインポート
- Reactコンポーネントはフックを使用した関数コンポーネント
- 型ファーストの開発アプローチ

## 重要なファイル

- `vite.config.mts`: NodeCGプラグインを使用したカスタムVite設定
- `vite-plugin-nodecg.mts`: NodeCGバンドルビルド用カスタムViteプラグイン
- `src/browser/render.ts`: Reactレンダリングユーティリティ
- `src/browser/use-replicant.ts`: NodeCGレプリカント用カスタムフック
- `src/extension/index.ts`: メインエクステンションエントリーポイント

## パフォーマンス最適化

- **定数の外出し**: コンポーネント外で定数を定義して再レンダリング時のメモリ割り当てを最適化
- **統一的な位置計算**: プレイヤー位置計算を`getPlayerPosition`関数で統一し、保守性とパフォーマンスを向上
- **propsの簡素化**: Nameplateコンポーネントでは`x`、`y`、`width`のみをpropsとし、`height`は固定値として定数で管理

## 実装履歴

### 2025-09-05: ThreePlayerコンポーネントの実装

- **ファイル**: `src/browser/graphics/views/ThreePlayer.tsx`
- **概要**: 2x2レイアウトで4つのゲーム画面枠を持つグラフィックスコンポーネントを作成
- **特徴**:
  - TwoPlayerをベースにした設計
  - ゲーム画面サイズ: 460px幅（16:9比率）
  - 2行2列のグリッドレイアウト
  - 各枠の間に20pxのギャップ
  - 3プレイヤーでも4つ目の枠を表示（プレースホルダー）
- **技術実装**:
  - `getPlayerPosition`関数で統一的な位置計算
  - 4つの枠すべてに対応したclipPath生成
  - `package.json`のグラフィックス設定にThreePlayer.htmlを追加

## ルール

- 日本語で応答すること。　コードのコメントは日本語を使う。 CLAUDE.mdへの記述、ユーザーへの応答は日本語で行う。
- npm run dev, npm run buildは実行しない
