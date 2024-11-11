import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.next()
    }
    if (request.nextUrl.pathname === '/api/users' && request.method === 'POST') {
        return NextResponse.next()
    }
    const apiKey = request.headers.get('X-API-Key')
    if (!apiKey) {
        return NextResponse.json(
            { error: 'API key is required' },
            { status: 401 }
        )
    }
    const options = {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKey })
    }
    const response = await fetch(`${request.nextUrl.origin}/api/auth/validateKey`, options)
    if (!response.ok) {
        return NextResponse.json(
            { error: 'Invalid API key' },
            { status: 401 }
        )
    }
    const { userId } = await response.json()
    if (!userId) {
        return NextResponse.json(
            { error: 'Invalid API key' },
            { status: 401 }
        )
    }
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('X-User-ID', userId.toString())
    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })
}

export const config = {
    matcher: '/api/:path*'
}
