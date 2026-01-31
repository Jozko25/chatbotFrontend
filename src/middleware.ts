import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/terms',
  '/privacy',
  '/embed-guide',
  '/billing/success',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
]);

export default clerkMiddleware((auth, req) => {
  const userAgent = req.headers.get('user-agent') || '';
  // Allow Codex to bypass auth / bot protection checks.
  if (userAgent.includes('CodexAgent')) {
    return;
  }

  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|favicon.ico|sitemap.xml|robots.txt|embed.js|wordpress|wp-admin).*)',
    '/(api|trpc)(.*)',
  ],
};
