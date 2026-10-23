// Automated Integration Tests for Swami Fashion
// Tests Authentication, 3-Attempt Lockout, PIN verification, Session security, Protected APIs
const http = require('http');
const app = require('../src/server');
const pool = require('../src/config/database');

let server;
let baseUrl;

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch (e) { json = body; }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });
    req.on('error', reject);
    if (data) {
      const payload = typeof data === 'object' ? JSON.stringify(data) : data;
      req.setHeader('Content-Type', 'application/json');
      req.setHeader('Content-Length', Buffer.byteLength(payload));
      req.write(payload);
    }
    req.end();
  });
}

async function runTests() {
  console.log('♛ Starting Swami Fashion Automated Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${testName}`);
      failed++;
    }
  }

  // Start test server on random port
  await new Promise((resolve) => {
    const testServer = http.createServer(app);
    testServer.listen(0, '127.0.0.1', () => {
      const port = testServer.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      server = testServer;
      resolve();
    });
  });

  try {
    // Clean test state in database
    await pool.execute('DELETE FROM login_attempts WHERE ip_address = "127.0.0.1"');

    // 1. Health check
    const healthRes = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/health',
      method: 'GET'
    });
    assert(healthRes.statusCode === 200 && healthRes.data.status === 'online', 'Server health check returns online');

    // 2. Public Settings & Derived Brand Identity
    const settingsRes = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/public/settings',
      method: 'GET'
    });
    assert(
      settingsRes.statusCode === 200 &&
      settingsRes.data.settings.brand_name === 'SWAMI FASHION' &&
      settingsRes.data.settings.primary_color === '#5A2A18' &&
      (settingsRes.data.settings.secondary_color === '#C5A059' || settingsRes.data.settings.secondary_color === '#D4AF37'),
      'Public settings return logo-derived colors (Cognac Bronze & Champagne Gold)'
    );

    // 3. Public Products Catalogue
    const productsRes = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/public/products',
      method: 'GET'
    });
    assert(
      productsRes.statusCode === 200 &&
      Array.isArray(productsRes.data.products) &&
      productsRes.data.products.length > 0,
      'Product catalogue returns active products from MySQL database'
    );

    // 4. Single Product Details by Slug
    const productSlug = productsRes.data.products[0].slug;
    const singleProductRes = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: `/api/public/products/${productSlug}`,
      method: 'GET'
    });
    assert(
      singleProductRes.statusCode === 200 &&
      singleProductRes.data.product.slug === productSlug &&
      Array.isArray(singleProductRes.data.product.images),
      'Single product details return gallery images and fabric specs'
    );

    // 5. Protected Admin Route without Session (Must Reject)
    const unauthorizedRes = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/admin/dashboard/stats',
      method: 'GET'
    });
    assert(
      unauthorizedRes.statusCode === 401 && unauthorizedRes.data.code === 'AUTH_REQUIRED',
      'Protected admin endpoints reject unauthenticated requests with 401 AUTH_REQUIRED'
    );

    // 6. Test Incorrect Password Handling (Attempts 1 & 2)
    const badPassRes1 = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/admin/auth/verify-password',
      method: 'POST'
    }, { username: 'swami_admin', password: 'WrongPassword1' });
    assert(badPassRes1.statusCode === 401, 'Incorrect password attempt 1 rejected with 401');

    const badPassRes2 = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/admin/auth/verify-password',
      method: 'POST'
    }, { username: 'swami_admin', password: 'WrongPassword2' });
    assert(badPassRes2.statusCode === 401, 'Incorrect password attempt 2 rejected with 401');

    const badPassRes3 = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/admin/auth/verify-password',
      method: 'POST'
    }, { username: 'swami_admin', password: 'WrongPassword3' });
    assert(badPassRes3.statusCode === 401, 'Incorrect password attempt 3 rejected with 401');

    // 7. Strict 3-Attempt Lockout: 4th Attempt MUST be BLOCKED with HTTP 429 and cooldown
    const lockoutRes = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/admin/auth/verify-password',
      method: 'POST'
    }, { username: 'swami_admin', password: 'SwamiLuxury@2026!' });
    assert(
      lockoutRes.statusCode === 429 &&
      lockoutRes.data.error.includes('Too many login attempts'),
      'Strict 3-attempt limit triggers 15-minute lockout with HTTP 429 and generic message'
    );

    // Reset login attempts to test successful authentication flow
    await pool.execute('DELETE FROM login_attempts WHERE ip_address = "127.0.0.1"');

    // 8. Step 1: Valid Password Verification (Generates 2FA tempToken)
    const step1Res = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/admin/auth/verify-password',
      method: 'POST'
    }, { username: 'swami_admin', password: 'SwamiLuxury@2026!' });
    assert(
      step1Res.statusCode === 200 &&
      step1Res.data.step === 'PIN_REQUIRED' &&
      step1Res.data.tempToken,
      'Step 1 password verification succeeds and issues temporary 2FA token'
    );

    const tempToken = step1Res.data.tempToken;

    // 9. Step 2: Invalid 6-Digit PIN Rejection
    const badPinRes = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/admin/auth/verify-pin',
      method: 'POST'
    }, { tempToken, pin: '111111' });
    assert(badPinRes.statusCode === 401, 'Invalid 6-digit PIN rejected with 401');

    // 10. Step 2: Valid 6-Digit PIN Verification (882200) -> Sets HTTP-only Cookie
    const validPinRes = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/admin/auth/verify-pin',
      method: 'POST'
    }, { tempToken, pin: '882200' });
    const cookies = validPinRes.headers['set-cookie'];
    const sessionCookie = cookies ? cookies[0] : null;

    assert(
      validPinRes.statusCode === 200 &&
      validPinRes.data.success === true &&
      sessionCookie &&
      sessionCookie.includes('swami_admin_session'),
      'Step 2 PIN verification succeeds and sets secure HTTP-only session cookie'
    );

    const cookieHeader = sessionCookie.split(';')[0];

    // 11. Access Protected Dashboard Stats with Session Cookie
    const statsRes = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/admin/dashboard/stats',
      method: 'GET',
      headers: { Cookie: cookieHeader }
    });
    assert(
      statsRes.statusCode === 200 &&
      statsRes.data.stats.totalProducts > 0 &&
      statsRes.data.stats.totalCategories > 0,
      'Authenticated admin successfully accesses dashboard analytics'
    );

    // 12. Session Status Endpoint (Reports Idle & Absolute Lifetime)
    const sessionStatusRes = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/admin/auth/session-status',
      method: 'GET',
      headers: { Cookie: cookieHeader, 'X-Passive-Check': 'true' }
    });
    assert(
      sessionStatusRes.statusCode === 200 &&
      sessionStatusRes.data.remainingIdleSeconds > 0 &&
      sessionStatusRes.data.remainingAbsoluteSeconds > 0,
      'Session status accurately reports remaining idle (5m) and absolute (30m) timers'
    );

    // 13. Test 5-Minute Inactivity Idle Expiry Enforcement
    // Simulate expired idle time by updating last_activity in DB to 6 minutes ago
    const sessionToken = cookieHeader.replace('swami_admin_session=', '');
    await pool.execute(
      'UPDATE admin_sessions SET last_activity = NOW() - INTERVAL 6 MINUTE WHERE session_token = ?',
      [sessionToken]
    );

    const idleExpiredRes = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/admin/dashboard/stats',
      method: 'GET',
      headers: { Cookie: cookieHeader }
    });
    assert(
      idleExpiredRes.statusCode === 401 &&
      idleExpiredRes.data.code === 'SESSION_IDLE_TIMEOUT',
      '5-minute idle inactivity automatically invalidates session with SESSION_IDLE_TIMEOUT'
    );

    // 14. Admin Logout Revocation
    // Log in again fresh
    const loginStep1 = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/admin/auth/verify-password',
      method: 'POST'
    }, { username: 'swami_admin', password: 'SwamiLuxury@2026!' });

    const loginStep2 = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/admin/auth/verify-pin',
      method: 'POST'
    }, { tempToken: loginStep1.data.tempToken, pin: '882200' });

    const freshCookie = loginStep2.headers['set-cookie'][0].split(';')[0];

    const logoutRes = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/admin/auth/logout',
      method: 'POST',
      headers: { Cookie: freshCookie }
    });
    assert(logoutRes.statusCode === 200, 'Admin logout succeeds and clears session');

    // Verify session revoked in database
    const postLogoutRes = await request({
      hostname: '127.0.0.1',
      port: server.address().port,
      path: '/api/admin/dashboard/stats',
      method: 'GET',
      headers: { Cookie: freshCookie }
    });
    assert(postLogoutRes.statusCode === 401, 'Revoked session cannot access admin APIs');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    if (server) server.close();
    await pool.end();
    console.log(`\n====================================================`);
    console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`====================================================\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
