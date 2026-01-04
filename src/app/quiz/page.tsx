"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card"
import { supabase } from "@/lib/supabase"
import { Loader2, CheckCircle2, XCircle, ArrowRight, Flag } from "lucide-react"
import type { Database } from "@/types/supabase"
import { cn } from "@/lib/utils"

// 型定義
type Quiz = Database['public']['Tables']['quizzes']['Row']

interface Choice {
    text: string
    isCorrect: boolean
    originalIndex: number
}

export default function QuizPage() {
    const router = useRouter()

    // --- ステート管理 ---
    const [stats, setStats] = useState({ correct: 0, total: 0 })
    const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
    const [choices, setChoices] = useState<Choice[]>([])
    const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null)
    const [isAnswered, setIsAnswered] = useState(false)
    const [loading, setLoading] = useState(true)

    // --- クイズ取得 (Supabase) ---
    const fetchNewQuestion = useCallback(async () => {
        setLoading(true)
        setIsAnswered(false)
        setSelectedChoiceIndex(null)

        try {
            const { data, error } = await supabase
                .from('quizzes')
                .select('*')
                .eq('is_published', true)

            if (error) throw error
            if (!data || data.length === 0) throw new Error("No quizzes found")

            const randomIndex = Math.floor(Math.random() * data.length)
            const quiz = data[randomIndex] as Quiz
            setCurrentQuiz(quiz)

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
        } catch (err) {
            console.error("Fetch Error:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    // 初回フェッチ
    useEffect(() => {
        fetchNewQuestion()
    }, [fetchNewQuestion])

    // --- ハンドラー ---
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

    // --- 表示ロジック ---
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
                <div>Scope: {stats.correct} / {stats.total}</div>
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
                            {/* 回答後の表示 */}
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

                            {/* 回答前のボタン */}
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