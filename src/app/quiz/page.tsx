"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { supabase } from "@/lib/supabase"
import { Loader2, CheckCircle2, XCircle, ArrowRight, Flag, Trophy, Coffee, AlertCircle } from "lucide-react" // アイコン追加
import type { Database } from "@/types/supabase"
import { cn } from "@/lib/utils"

type Quiz = Database['public']['Tables']['quizzes']['Row']

interface Choice {
    text: string
    isCorrect: boolean
    originalIndex: number
}

export default function QuizPage() {
    const router = useRouter()

    const [stats, setStats] = useState({ correct: 0, total: 0 })
    const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
    const [choices, setChoices] = useState<Choice[]>([])
    const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null)
    const [isAnswered, setIsAnswered] = useState(false)
    const [loading, setLoading] = useState(true)
    const [playedQuizIds, setPlayedQuizIds] = useState<string[]>([])
    const [isOutOfQuestions, setIsOutOfQuestions] = useState(false)
    
    // 【新機能】エラーの種類を管理するステート
    const [errorType, setErrorType] = useState<"none" | "paused" | "other">("none")

    const fetchNewQuestion = useCallback(async () => {
        setLoading(true)
        setIsAnswered(false)
        setSelectedChoiceIndex(null)
        setErrorType("none") // リセット

        try {
            const { data, error } = await supabase
                .from('quizzes')
                .select('*')
                .eq('is_published', true)

            if (error) throw error
            if (!data || data.length === 0) throw new Error("No quizzes found")

            const availableQuizzes = (data as Quiz[]).filter(q => !playedQuizIds.includes(q.id))

            if (availableQuizzes.length === 0) {
                setIsOutOfQuestions(true)
                setLoading(false)
                return
            }

            const randomIndex = Math.floor(Math.random() * availableQuizzes.length)
            const quiz = availableQuizzes[randomIndex] as Quiz
            
            setCurrentQuiz(quiz)
            setPlayedQuizIds(prev => [...prev, quiz.id])

            const rawChoices = [
                { text: quiz.choice_1, isCorrect: true },
                { text: quiz.choice_2, isCorrect: false },
                { text: quiz.choice_3, isCorrect: false },
                { text: quiz.choice_4, isCorrect: false },
            ].filter(c => c.text !== null && c.text !== "")

            const shuffled = rawChoices
                .map((value, index) => ({ value, sort: Math.random(), originalIndex: index }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value, originalIndex }) => ({ ...value, originalIndex }))

            setChoices(shuffled)
        } catch (err: any) {
            console.error("Fetch Error:", err)
            // 【新機能】エラーの振り分けロジック
            // ブラウザの fetch エラー（接続拒否）は Paused の可能性が高い
            if (err.message === 'Failed to fetch' || err.code === 'PGRST301') {
                setErrorType("paused")
            } else {
                setErrorType("other")
            }
        } finally {
            setLoading(false)
        }
    }, [playedQuizIds])

    useEffect(() => {
        fetchNewQuestion()
    }, [])

    // --- 省略（handleAnswer, handleFinish などのロジックは前回と同じ） ---
    const handleAnswer = () => {
        if (selectedChoiceIndex === null || isAnswered) return
        setIsAnswered(true)
        const isCorrect = choices[selectedChoiceIndex].isCorrect
        setStats(prev => ({
            total: prev.total + 1,
            correct: isCorrect ? prev.correct + 1 : prev.correct
        }))
    }

    const handleFinish = () => {
        const query = new URLSearchParams({
            correct: stats.correct.toString(),
            total: stats.total.toString()
        }).toString()
        router.push(`/result?${query}`)
    }

    // --- 表示ロジック（エラー画面の追加） ---

    // 1. サーバーがおやすみ中の表示
    if (errorType === "paused") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-center">
                <div className="bg-amber-100 p-6 rounded-full mb-6">
                    <Coffee className="w-16 h-16 text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">サーバーがお休み中です</h2>
                <p className="text-subtle mb-8 max-w-sm">
                    しばらく使われていなかったため、サーバーが眠っています。管理者がボタンを押すと3分ほどで起きますので、少し待ってから「やり直す」を押してください。
                </p>
                <Button size="xl" onClick={() => window.location.reload()} className="px-12">
                    やり直す
                </Button>
            </div>
        )
    }

    // 2. その他のエラー表示
    if (errorType === "other") {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-center">
                <div className="bg-red-100 p-6 rounded-full mb-6">
                    <AlertCircle className="w-16 h-16 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">通信エラーが発生しました</h2>
                <p className="text-subtle mb-8">
                    インターネットの接続を確認して、もう一度試してみてください。
                </p>
                <Button size="xl" onClick={() => window.location.reload()} className="px-12">
                    もう一度試す
                </Button>
            </div>
        )
    }

    // 3. 全問クリア表示
    if (isOutOfQuestions) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6 bg-primary/10 p-6 rounded-full">
                    <Trophy className="w-16 h-16 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-bold mb-2">全問クリア！</h2>
                <p className="text-subtle mb-8">現在公開されているすべての問題を解き終えました。</p>
                <Button size="xl" onClick={handleFinish} className="px-12 shadow-lg shadow-primary/20">
                    結果を見る
                </Button>
            </div>
        )
    }

    if (loading && !currentQuiz) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        )
    }

    if (!currentQuiz) return null

    return (
        <div className="min-h-screen flex flex-col items-center p-4 md:p-8 bg-background">
            <div className="w-full max-w-2xl flex justify-between items-center mb-6 text-subtle font-medium">
                <div>問 {stats.total + 1}</div>
                <div>スコア: {stats.correct} / {stats.total}</div>
                <Button variant="ghost" size="sm" onClick={handleFinish} className="text-subtle hover:text-foreground">
                    <Flag className="w-4 h-4 mr-2" />
                    終了
                </Button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuiz.id + stats.total}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full max-w-2xl"
                >
                    <Card className="border-none shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-xl md:text-2xl leading-relaxed text-foreground">
                                {currentQuiz.question_text}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {choices.map((choice, index) => {
                                const isSelected = selectedChoiceIndex === index
                                let variant: "outline" | "primary" | "ghost" | "danger" | "secondary" = "outline"

                                if (isAnswered) {
                                    if (choice.isCorrect) variant = "primary"
                                    else if (isSelected && !choice.isCorrect) variant = "danger"
                                    else variant = "ghost"
                                } else if (isSelected) {
                                    variant = "primary"
                                }

                                return (
                                    <Button
                                        key={index}
                                        variant={variant}
                                        size="lg"
                                        className={cn(
                                            "w-full justify-start h-auto py-4 text-left whitespace-normal",
                                            isAnswered && !choice.isCorrect && !isSelected && "opacity-50"
                                        )}
                                        onClick={() => !isAnswered && setSelectedChoiceIndex(index)}
                                        disabled={isAnswered}
                                    >
                                        <span className="mr-4 font-bold opacity-50">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        {choice.text}
                                        {isAnswered && choice.isCorrect && (
                                            <CheckCircle2 className="ml-auto w-6 h-6 text-white" />
                                        )}
                                        {isAnswered && isSelected && !choice.isCorrect && (
                                            <XCircle className="ml-auto w-6 h-6 text-white" />
                                        )}
                                    </Button>
                                )
                            })}
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4 pt-4 border-t border-subtle/10">
                            {isAnswered && (
                                <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                                    <div className="bg-subtle/5 p-4 rounded-xl">
                                        <p className="font-bold text-sm text-subtle mb-1">解説</p>
                                        <p className="text-foreground">{currentQuiz.explanation}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="secondary" className="flex-1" onClick={handleFinish}>
                                            終了する
                                        </Button>
                                        <Button size="lg" className="flex-[2]" onClick={fetchNewQuestion}>
                                            次の問題へ <ArrowRight className="ml-2 w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {!isAnswered && (
                                <Button
                                    size="lg"
                                    className="w-full"
                                    disabled={selectedChoiceIndex === null}
                                    onClick={handleAnswer}
                                >
                                    回答する
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    )
}