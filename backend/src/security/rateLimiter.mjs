import { config } from '../config.mjs';

/**
 * Sliding Window Memory Rate Limiter
 */
const trackingBuckets = new Map();

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

export function checkRateLimit(req, res, category) {
  // Allow test suites to bypass rate limit unless explicitly testing rate limits
  if (process.env.NODE_ENV === 'test' && req.headers['x-test-rate-limit'] !== 'true') {
    return true;
  }

  const ip = getClientIp(req);
  const key = `${category}:${ip}`;
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window

  let maxAllowed = 60;
  if (category === 'auth') {
    maxAllowed = config.rateLimits.authPerMinute;
  } else if (category === 'report_submit') {
    maxAllowed = config.rateLimits.reportPerMinute;
  } else if (category === 'lookup') {
    maxAllowed = config.rateLimits.lookupPerMinute;
  }

  let timestamps = trackingBuckets.get(key) || [];
  // Filter timestamps within current sliding window
  timestamps = timestamps.filter((t) => now - t < windowMs);

  if (timestamps.length >= maxAllowed) {
    const oldest = timestamps[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));

    res.setHeader('Retry-After', retryAfterSeconds.toString());
    res.writeHead(429, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Too Many Requests',
        message: `Rate limit of ${maxAllowed} requests per minute exceeded for ${category}. Please try again in ${retryAfterSeconds} seconds.`,
        retryAfterSeconds,
      })
    );
    return false;
  }

  timestamps.push(now);
  trackingBuckets.set(key, timestamps);
  return true;
}

export function resetRateLimits() {
  trackingBuckets.clear();
}
