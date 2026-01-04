"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card"
import { Lock, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase" // インポートを忘れずに！
import Link from "next/link"

export default function AdminLogin() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [errorMsg, setErrorMsg] = useState("")

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setErrorMsg("")

        // --- 本物のログイン処理 (Supabase Auth) ---
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setErrorMsg("ログインに失敗しました。メールアドレスまたはパスワードを確認してください。")
            setLoading(false)
        } else {
            // 成功したらダッシュボードへ
            router.push("/admin/dashboard")
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
            <Card className="w-full max-w-sm shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mb-2 text-primary">
                        <Lock className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-2xl font-bold">管理者ログイン</CardTitle>
                    <p className="text-sm text-subtle">登録したメールアドレスでログインしてください</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        {errorMsg && (
                            <div className="text-xs text-red-500 bg-red-50 p-2 rounded text-center font-medium">
                                {errorMsg}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                className="flex h-10 w-full rounded-md border border-subtle/20 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-subtle/20 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            {loading ? "ログイン中..." : "ログイン"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <Link href="/" className="text-sm text-subtle hover:underline">
                        ← アプリに戻る
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}