import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createBookmarkSchema } from '@/lib/validations/bookmark'
import { handleZodError } from '@/lib/utils'
import { ZodError } from 'zod'

export async function GET() {
    try {
        const bookmarks = await prisma.bookmark.findMany({
            include: { user: true }
        })
        return NextResponse.json(bookmarks)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const json = await request.json()
        const data = createBookmarkSchema.parse(json)
        const bookmark = await prisma.bookmark.create({
            data,
            include: { user: true }
        })
        return NextResponse.json(bookmark, { status: 201 })
    } catch (error) {
        if (error instanceof ZodError) {
            return handleZodError(error)
        }
        return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 })
    }
}
