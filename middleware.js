import { NextResponse } from 'next/server';

// In-memory map to track requests per IP. Note: This is per-edge-location and volatile.
const rateLimitMap = new Map();

export const config = {
  matcher: '/api/register',
};

export default function middleware(request) {
  // Only apply rate limiting to POST requests
  if (request.method !== 'POST') {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 5;

  const requestData = rateLimitMap.get(ip) || { count: 0, startTime: now };

  // Reset window if expired
  if (now - requestData.startTime > windowMs) {
    requestData.count = 1;
    requestData.startTime = now;
  } else {
    requestData.count++;
  }

  rateLimitMap.set(ip, requestData);

  if (requestData.count > maxRequests) {
    return new NextResponse(
      JSON.stringify({ message: "Too many requests. Please wait before registering again." }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      }
    );
  }

  return NextResponse.next();
}
