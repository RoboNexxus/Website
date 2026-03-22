// In-memory map to track requests per IP. Note: This is per-edge-location and volatile.
const rateLimitMap = new Map();

export const config = {
  matcher: '/api/register',
};

export default function middleware(request) {
  // Only apply rate limiting to POST requests
  if (request.method !== 'POST') {
    return; // Continue to the destination
  }

  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
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
    return new Response(
      JSON.stringify({ error: "Too many requests" }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      }
    );
  }

  // Returning undefined allows the request to continue in Vercel Edge Middleware
}
