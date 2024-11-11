import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function handleZodError(error: ZodError) {
    const errors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
    }))
    return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
    )
}