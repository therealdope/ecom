import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Get the token and check if the user is authenticated
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  
  const isAuthenticated = !!token;
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/auth/signin',
    '/auth/signup',
  ];
  
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));
  
  // Redirect logic based on authentication status and role
  if (!isAuthenticated && !isPublicPath) {
    // Redirect unauthenticated users to signin page
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  if (isAuthenticated && isPublicPath) {
    // Redirect authenticated users to their dashboard based on role
    if (token.role === 'USER') {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    } else if (token.role === 'VENDOR') {
      return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    }
  }
  
  // Role-based access control
  if (isAuthenticated) {
    // Prevent users from accessing vendor routes
    if (token.role === 'USER' && pathname.startsWith('/vendor')) {
      return NextResponse.redirect(new URL('/user/dashboard', request.url));
    }
    
    // Prevent vendors from accessing user routes
    if (token.role === 'VENDOR' && pathname.startsWith('/user')) {
      return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all paths except for static files, api routes, and _next
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};