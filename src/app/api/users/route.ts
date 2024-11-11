import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createUserSchema } from '@/lib/validations/user'
import { handleZodError } from '@/lib/utils'
import { ZodError } from 'zod'
import { hashPassword } from '@/lib/password'

export async function GET() {
    try {
        const users = await prisma.user.findMany()
        return NextResponse.json(users)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const json = await request.json()
        const data = createUserSchema.parse(json)
        const user = await prisma.user.create({
            data
        })
        return NextResponse.json(user, { status: 201 })
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error)
        }
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }
}
