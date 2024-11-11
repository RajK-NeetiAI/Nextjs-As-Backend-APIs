import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateApiKey, getApiKeyByUserId, revokeApiKey } from '@/lib/auth'
import { z } from 'zod'
import { verifyPassword } from '@/lib/password'

const generateKeySchema = z.object({
    email: z.string().email(),
    password: z.string().min(6)
})

export async function POST(request: NextRequest) {
    try {
        const json = await request.json()
        const { email, password } = generateKeySchema.parse(json)
        const user = await prisma.user.findUnique({
            where: { email }
        })
        console.log(user);
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }
        const isValid = await verifyPassword(password, user.password)
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }
        const oldApiKey = await getApiKeyByUserId(user.id)
        if (!oldApiKey) {
            const apiKey = await generateApiKey(user.id)
            return NextResponse.json({ apiKey })
        } else {
            return NextResponse.json({ apiKey: oldApiKey })
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation failed', details: error.errors },
                { status: 400 }
            )
        }
        return NextResponse.json(
            { error: 'Failed to generate API key' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    const apiKey = request.headers.get('X-API-Key')
    if (!apiKey) {
        return NextResponse.json(
            { error: 'API key is required' },
            { status: 401 }
        )
    }
    const revoked = await revokeApiKey(apiKey)
    if (!revoked) {
        return NextResponse.json(
            { error: 'Invalid API key' },
            { status: 401 }
        )
    }
    return new NextResponse(null, { status: 204 })
}
