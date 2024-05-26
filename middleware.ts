import { NextRequest, NextResponse } from 'next/server';

const isDevelopment = process.env.NODE_ENV === 'development';
const allowedOrigins = isDevelopment ? ['http://localhost:3000', process.env.HOST_ADDRESS] : ["https://" + process.env.HOST_ADDRESS_PROD];

export function middleware(req: NextRequest) {
    const origin = req.headers.get('origin') || ''; // Default to empty string if null
    const token = req.headers.get('authorization')?.split(' ')[1] || '';

    if (!allowedOrigins.includes(origin)) {
        return new NextResponse('Unauthorized', { status: 403 });
    }

    if (process.env.NEXT_PUBLIC_API_TOKEN !== token) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    return NextResponse.next();
}

// Apply middleware only to API routes
export const config = {
    matcher: '/api/:path*',
}