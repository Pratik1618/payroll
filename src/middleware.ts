import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { withBasePath, withoutBasePath } from '@/lib/base-path'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const pathname = withoutBasePath(request.nextUrl.pathname)

  // Allow public files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const isLoginPage = pathname === '/login'

  // ❌ Not logged in → block protected pages
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL(withBasePath('/login'), request.url))
  }

  // ✅ Already logged in → block login page
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL(withBasePath('/dashboard'), request.url))
  }

  return NextResponse.next()
}
