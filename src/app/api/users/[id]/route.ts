import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { updateUserSchema } from '@/lib/validations/user'
import { handleZodError } from '@/lib/utils'
import { ZodError } from 'zod'
import { hashPassword } from '@/lib/password'

interface Params {
    params: {
        id: string
    }
}

export async function GET(request: NextRequest, { params }: Params) {
    const id = await parseInt(params.id)
    if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }
    try {
        const user = await prisma.user.findUnique({
            where: { id: id }
        })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }
        return NextResponse.json(user)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, { params }: Params) {
    const id = await parseInt(params.id)
    if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }
    try {
        const json = await request.json()
        let data = updateUserSchema.parse(json)
        const user = await prisma.user.update({
            where: { id: id },
            data
        })
        return NextResponse.json(user)
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error)
        }
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const id = await parseInt(params.id)
    if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }
    try {
        await prisma.user.delete({
            where: { id: id }
        })
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }
}
