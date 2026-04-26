import axios from 'axios';

const uniqueEmail = () => `e2e-${Date.now()}@test.local`;

describe('Auth endpoints', () => {
  let accessToken: string;
  let refreshToken: string;
  const email = uniqueEmail();
  const password = 'E2ePassword1';

  it('POST /api/auth/register → 201 + tokens', async () => {
    const res = await axios.post('/api/auth/register', { email, password });
    expect(res.status).toBe(201);
    expect(res.data.accessToken).toBeDefined();
    expect(res.data.refreshToken).toBeDefined();
    accessToken = res.data.accessToken as string;
    refreshToken = res.data.refreshToken as string;
  });

  it('POST /api/auth/login → 200 + tokens', async () => {
    const res = await axios.post('/api/auth/login', { email, password });
    expect(res.status).toBe(200);
    expect(res.data.accessToken).toBeDefined();
    expect(res.data.refreshToken).toBeDefined();
    accessToken = res.data.accessToken as string;
    refreshToken = res.data.refreshToken as string;
  });

  it('POST /api/auth/logout → 204 (requires valid JWT)', async () => {
    const res = await axios.post(
      '/api/auth/logout',
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    expect(res.status).toBe(204);
  });

  it('POST /api/auth/refresh → 200 + new tokens', async () => {
    const res = await axios.post('/api/auth/refresh', { refreshToken });
    expect(res.status).toBe(200);
    expect(res.data.accessToken).toBeDefined();
  });
});
