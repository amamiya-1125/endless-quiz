import { NextResponse } from 'next/server'

export async function POST() {
    const projectRef = process.env.SUPABASE_PROJECT_REF
    const token = process.env.SUPABASE_ACCESS_TOKEN

    try {
        const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/restore`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!res.ok) throw new Error('Failed to wake up')
        return NextResponse.json({ message: 'Waking up...' })
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}