import { validateApiKey } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const generateKeySchema = z.object({
    apiKey: z.string()
})

export async function POST(request: NextRequest) {
    try {
        const json = await request.json()
        const { apiKey } = generateKeySchema.parse(json)
        if (!apiKey) {
            return NextResponse.json({ error: 'API key is required' }, { status: 404 })
        }
        const userId = await validateApiKey(apiKey)
        if (!userId) {
            return NextResponse.json({ error: 'Invalid API key' }, { status: 404 })
        }
        return NextResponse.json({ userId: userId }, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to generate API key' },
            { status: 500 }
        )
    }
}
