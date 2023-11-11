import { NextURL } from 'next/dist/server/web/next-url';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

//import REWRITES from '@/scripts/data/rewrites.json'

export async function middleware(
  request: NextRequest,
  response: typeof NextResponse
) {
  const { nextUrl } = request;
  const cleanPathname = getCleanPathname(nextUrl.pathname);
  let isPreviewMode = Boolean(
    request.cookies.get('__next_preview_data')?.value
  );
  /**
   * redirect requests with uppercase letters to lowercase
   **/
  if (
    !nextUrl.pathname.includes('_next') &&
    nextUrl.pathname.includes('-') &&
    /[A-Z]/.test(nextUrl.pathname)
  ) {
    nextUrl.pathname = nextUrl.pathname.toLocaleLowerCase();
    return NextResponse.redirect(nextUrl.toString());
  }

  /**
   * rewrite requests for old site
   **/
  const isRequestForOldSite = true;
  if (isRequestForOldSite && !isPreviewMode) {
    nextUrl.host = 'www.gatewayfirst.com' as string;

    if (nextUrl.protocol.includes('https') === false) {
      nextUrl.protocol = 'https';
      nextUrl.port = '443';
    }
    console.log('rewrite', nextUrl);
    return NextResponse.rewrite(nextUrl);
  }
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - robots.txt
   * - images (public/images folder)
   */
  matcher:
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|images).*)',
};

function getCleanPathname(pathname: NextURL['pathname']) {
  if (!pathname.startsWith('/_next')) return pathname;

  const pathnameParts = pathname.split('/');
  const pathnameAfterBuildId = pathnameParts.slice(
    pathnameParts.indexOf('data') + 2
  );

  const pathnameAfterBuildIdString = pathnameAfterBuildId.join('/');
  let pathnameWithoutDotJson = pathnameAfterBuildIdString.replace('.json', '');

  if (pathnameWithoutDotJson.includes('index'))
    pathnameWithoutDotJson = pathnameWithoutDotJson.replace('index', '');

  return `/${pathnameWithoutDotJson}`;
}
