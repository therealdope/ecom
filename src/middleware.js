import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define paths that don't require authentication
const publicPaths = [
    '/', // Intro page
    '/auth/signin', // Sign in page
    '/auth/signup', // Sign up page
    '/auth/forgot-password',
    '/api/auth/(.*)'
];

// Define paths that require specific roles
const userPaths = ['/user/(.*)'];
const vendorPaths = ['/vendor/(.*)'];

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Check if the path is public (no auth required)
    const isPublicPath = publicPaths.some(path => {
        const regex = new RegExp(`^${path}$`);
        return regex.test(pathname);
    });

    // Get the user's token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });

    const isAuthenticated = !!token;

    // Allow access to public paths regardless of authentication status
    if (isPublicPath) {
        return NextResponse.next();
    }

    // If user is not authenticated and trying to access a protected route, redirect to sign in
    if (!isAuthenticated) {
        return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    // Check if user is trying to access user-specific paths
    const isUserPath = userPaths.some(path => {
        const regex = new RegExp(`^${path}$`);
        return regex.test(pathname);
    });

    // Check if user is trying to access vendor-specific paths
    const isVendorPath = vendorPaths.some(path => {
        const regex = new RegExp(`^${path}$`);
        return regex.test(pathname);
    });

    // If user is trying to access user paths but is not a USER, redirect to vendor dashboard
    if (isUserPath && token.role !== 'USER') {
        return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    }

    // If user is trying to access vendor paths but is not a VENDOR, redirect to user dashboard
    if (isVendorPath && token.role !== 'VENDOR') {
        return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }

    // If user is authenticated but accessing the root path, redirect to appropriate dashboard
    if (pathname === '/') {
        const redirectPath = token.role === 'USER' ? '/user/dashboard' : '/vendor/dashboard';
        return NextResponse.redirect(new URL(redirectPath, request.url));
    }

    // Allow the request to proceed
    return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
    matcher: [
        '/((?!_next|favicon\.ico|logo\.png|loader\d?\.gif).*)',
    ],
};