import { NextRequest, NextResponse } from 'next/server';

const isDevelopment = process.env.NODE_ENV === 'development';
const allowedOrigins = isDevelopment ? ['http://localhost:3000', process.env.HOST_ADDRESS] : ["https://" + process.env.HOST_ADDRESS_PROD];

export function middleware(req: NextRequest) {
    const { pathname } = new URL(req.url);
    
    // Skip if the path is api/metrics
    if (pathname === '/api/metrics') {
        return NextResponse.next();
    }

    const origin = req.headers.get('origin') || ''; // Default to empty string if null
    const token = req.headers.get('authorization')?.split(' ')[1] || '';

    if (!allowedOrigins.includes(origin)) {
        return new NextResponse('Unauthorized', { status: 403 });
    }

    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    if (process.env.NEXT_PUBLIC_API_TOKEN !== token) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    return response;
}

// Apply middleware only to API routes
export const config = {
    matcher: '/api/:path*',
}