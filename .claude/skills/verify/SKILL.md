---
name: verify
description: 変更した挙動を、headless Chromium(Playwright)でアプリを実際に操作して確かめる。シナリオ作成 → サーバー起動 → 操作とスクリーンショット → 目視判定 → 回帰テストへの昇格まで、人間が画面を開く代わりに行う。UI や挙動に触れた変更で、/gate の後に使う。使い方 /verify [focus]
argument-hint: "[focus]"
---
<!-- managed by orchestrator (shared/skills/verify/SKILL.md). Do not edit here; edit in orchestrator and re-run scripts/sync.sh -->

# 動作確認の自動化

人間が画面を開いて確かめる作業を、Playwright の headless Chromium で代替する。`$ARGUMENTS` に焦点があれば、そのシナリオを優先する。

## 前提
`docs/AGENT.md` の `## Verify` を読む(契約: `shared/CONTRACT.md`)。書かれている項目: 起動コマンド、URL とポート、準備完了の判定、主要な画面、ブラウザの用意(`pnpm exec playwright install chromium`)。UI の無いリポジトリでは、CLI をサンプル入力で実行する手順が書かれている。
`## Verify` が無ければ、組み込みの `run` スキルの手順で起動方法を調べ、最終報告に「契約未整備(`## Verify` が無い)」と書く。

## 手順
1. 差分と issue から確認シナリオを 3〜5 個作る(変更箇所 + 隣接する既存機能 1 つ)
2. サーバーをバックグラウンドで起動し、準備完了を判定する。ブラウザが未導入なら用意する
3. 使い捨ての Playwright スクリプトを scratchpad に書いて実行する(リポジトリには置かない)。headless Chromium で各シナリオを操作し、次を集める
   - console error と、失敗したリクエスト
   - desktop 幅と mobile 幅のスクリーンショット
   - 画像の読み込み判定は、`naturalWidth` だけで行わない(`loading="lazy"` の画像を誤って拾う)。スクロールして読み込ませてから調べるか、スクリーンショットで判定する
4. スクリーンショットを `Read` で見て判定する。崩れ・エラー・期待と違う挙動があれば、コードを直して `/gate` を通し、2 に戻る。**同じ原因で 3 回失敗したら停止して報告する**
5. 今後も守るべき挙動は、リポジトリの e2e テストに追加する(`test-writer` に委任できる。配置は `## Test policy`)。使い捨ての確認を回帰テストに昇格させる
6. サーバーを止める

## 禁止
- 確認の通過のために、シナリオの期待値を弱めること
- `.env` や本番の認証情報を使うこと。外部サービスへ送信する操作はモックするか、行わない
- スクリーンショットをリポジトリにコミットすること(`## Test policy` が視覚回帰の基準画像を定める場合を除く)

## 報告
確認したシナリオごとの結果(PASS / FAIL)、直した内容、追加した e2e テスト。PR の Test plan にも同じ内容を書く。
