# 🌟 Endless Quiz
### 運用コストゼロで「一生続く」体験を。技術的制約をホスピタリティへ変えたフルスタック・クイズプラットフォーム

[![Next.js](https://img.shields.io/badge/Next.js-15%2F16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%2FAuth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4_Alpha-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

---

## 🔗 Links
- **Live Demo:** [https://endless-quiz-portfolio.vercel.app](https://endless-quiz-portfolio.vercel.app)
- **Source Code:** [https://github.com/amamiya-1125/endless-quiz](https://github.com/amamiya-1125/endless-quiz)

---

## 💡 概要 (For Everyone & HR)
**「利用者が、24時間365日、何も気にせず遊び続けられること」**
Endless Quizは、この究極のホスピタリティを実現するために設計された、サーバーレス・フルスタック・クイズプラットフォームです。

単なる学習用アプリに留まらず、無料枠の「サーバー休止」という技術的制約を逆手に取り、利用者が自ら復旧できる仕組みを導入。**「開発者の運用コストをゼロにしつつ、ユーザー体験を損なわない」**という、実用性とプロフェッショナル・エンジニアリングの両立を証明したプロジェクトです。

### 💎 コアバリュー
- **メンテナンス・フリー:** サーバーが眠っていても、利用者がワンタップで「起こして」再開できる設計。
- **プロフェッショナル・セキュリティ:** Supabase Auth と RLS による、商用レベルのデータ保護。
- **ネイティブ級の操作感:** Tailwind v4 と Framer Motion による、ストレスのない滑らかなUI。

---

## 🚀 AI活用戦略 (Strategic Engineering)
本プロジェクトでは、AIを単なる「コード生成機」ではなく、**「シニアエンジニア・レベルの設計レビューアー」**として活用しました。

- **アーキテクチャの妥当性検証:** 認証とMiddlewareの同期ロジックにおいて、エッジケース（本番環境特有の挙動）の洗い出しをAIと共に行い、手戻りを最小限に抑えました。
- **高速プロトタイピング:** コアロジック（ランダム出題アルゴリズム）の初案をAIが生成し、人間が「ホスピタリティ」の観点から最適化することで、開発速度を3倍以上に加速させました。

---

## 🛠️ 技術スタック (For Tech)
「なぜその技術か？」という選定理由にこだわりました。

| 区分 | 選定技術 | 採用理由・メリット |
| :--- | :--- | :--- |
| **Frontend** | **Next.js (App Router)** | RSC(Server Components)による初期表示の高速化。 |
| **Database** | **Supabase (PostgreSQL)** | RLSによる堅牢なアクセス制御とスケーラビリティ。 |
| **Auth** | **Supabase Auth / SSR** | Cookieベースのセキュアな認証。SSR側との完全同期。 |
| **Styling** | **Tailwind CSS v4** | 最新エンジンの高速ビルドとCSS-firstな柔軟な設計。 |
| **Animation** | **Framer Motion** | 状態変化に合わせた「心地よい」UI演出の実装。 |
| **Infra** | **Vercel / GitHub** | 環境変数による「本番・展示用」の完全分離運用。 |

---

## ✨ 技術的な挑戦とこだわり (For Tech & HR)

### 🌟 ① 認証とミドルウェアの「完全同期」
**課題:** 一般的な実装ではサーバー側の認証検知にラグが生じ、不要なローディング（くるくる）が発生しがちです。
**解決:** `@supabase/ssr` を導入し、Cookie管理を徹底。window.location.href と Middleware のリダイレクトを最適化することで、本番環境でも「一瞬で」正しいページへ遷移する堅牢な認証基盤を構築しました。

### 🌟 ② サーバー休止検知(Paused Detection) & オンデマンド起動
**課題:** 無料プランによる「1週間でのDB停止」は、一般ユーザーには「故障」に見えてしまいます。
**解決:** 
- 通信エラーを詳細に解析し、サーバーが休止状態であることを特定するロジックを実装。
- 利用者を困惑させない「サーバーを起こす」ボタンとUX（コーヒーアイコン）を提供。
- **独自APIの実装:** Vercel側から秘密のトークンを用いてSupabase Management APIを叩き、ユーザー操作のみで安全にサーバーを再起動させる仕組みを完遂しました。

### 🌟 ③ 1ソース・2データベースの環境分離設計
**課題:** 実運用している環境を、ポートフォリオ公開用に壊したくない。
**解決:** 1つのリポジトリを保ちつつ、Vercelの環境変数を切り替えることで「実運用機」と「展示用機」を完全分離。プロの開発現場と同じ「環境分離」の概念を個人開発に持ち込みました。

---

## 🔧 機能一覧
### 👤 プレイヤー機能
- **非重複ランダム出題:** 全問解き終わるまで同じ問題を出さない高度なフィルタリング。
- **動的リザルト計算:** 正解率をリアルタイム算出し、URLパラメータ経由で結果画面へ引き継ぎ。
- **Trophy UI:** 全問クリア時のみ現れる特別な達成感演出。

### 🔑 管理者機能
- **セキュア・ダッシュボード:** GUIによるクイズのCRUD操作。
- **下書き(Draft)機能:** 公開フラグ制御による、安全なコンテンツ管理。

---

## 📦 セットアップ
```bash
# クローン
git clone https://github.com/your-username/endless-quiz.git

# 依存関係のインストール
npm install

# 環境変数の設定 (.env.exampleを参考に設定)
cp .env.example .env.local

# 起動
npm run dev