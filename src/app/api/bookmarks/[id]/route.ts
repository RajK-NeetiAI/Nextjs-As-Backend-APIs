import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { updateBookmarkSchema } from '@/lib/validations/bookmark'
import { handleZodError } from '@/lib/utils'
import { ZodError } from 'zod'

interface Params {
    params: {
        id: string
    }
}

export async function GET(request: NextRequest, { params }: Params) {
    const id = await parseInt(params.id)
    const userId = parseInt(request.headers.get('X-User-ID') || '')
    if (isNaN(id) || isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }
    try {
        const bookmark = await prisma.bookmark.findUnique({
            where: { id: id, userId: userId },
            include: { user: true }
        })
        if (!bookmark) {
            return NextResponse.json({ error: 'Bookmark not found' }, { status: 404 })
        }
        return NextResponse.json(bookmark)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch bookmark' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest, { params }: Params) {
    const id = await parseInt(params.id)
    const userId = parseInt(request.headers.get('X-User-ID') || '')
    if (isNaN(id) || isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }
    try {
        const json = await request.json()
        const data = updateBookmarkSchema.parse(json)
        const bookmark = await prisma.bookmark.update({
            where: { id: id, userId: userId },
            data,
            include: { user: true }
        })
        return NextResponse.json(bookmark)
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error)
        }
        return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: Params) {
    const id = await parseInt(params.id)
    const userId = parseInt(request.headers.get('X-User-ID') || '')
    if (isNaN(id) || isNaN(userId)) {
        return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }
    if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 })
    }
    try {
        await prisma.bookmark.delete({
            where: { id: id, userId: userId }
        })
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 })
    }
}