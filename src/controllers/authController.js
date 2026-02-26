const bcrypt = require('bcryptjs');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

// register new user
async function register(req, res, next) {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await req.prisma.user.create({
      data: { email, password: hashed, name },
    });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    next(err);
  }
}

// login user
async function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  try {
    const user = await req.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    // store refresh token
    await req.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + parseExpiry(process.env.REFRESH_TOKEN_EXPIRY)),
      },
    });
    res.json({ accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
}

function parseExpiry(expiry) {
  // simple parser for 7d, 15m etc
  const num = parseInt(expiry, 10);
  if (expiry.endsWith('d')) return num * 24 * 60 * 60 * 1000;
  if (expiry.endsWith('h')) return num * 60 * 60 * 1000;
  if (expiry.endsWith('m')) return num * 60 * 1000;
  return num * 1000;
}

// refresh tokens
async function refresh(req, res, next) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
  try {
    const payload = verifyRefreshToken(refreshToken);
    // ensure still in DB
    const stored = await req.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored) return res.status(401).json({ error: 'Invalid refresh token' });
    if (new Date() > stored.expiresAt) {
      await req.prisma.refreshToken.delete({ where: { token: refreshToken } });
      return res.status(401).json({ error: 'Refresh token expired' });
    }
    const user = await req.prisma.user.findUnique({ where: { id: payload.sub } });
    const newAccess = signAccessToken(user);
    const newRefresh = signRefreshToken(user);
    // rotate token
    await req.prisma.refreshToken.delete({ where: { token: refreshToken } });
    await req.prisma.refreshToken.create({
      data: {
        token: newRefresh,
        userId: user.id,
        expiresAt: new Date(Date.now() + parseExpiry(process.env.REFRESH_TOKEN_EXPIRY)),
      },
    });
    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
}

// logout (revoke refresh token)
async function logout(req, res, next) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
  try {
    await req.prisma.refreshToken.delete({ where: { token: refreshToken } });
  } catch (err) {
    // ignore not found
  }
  res.json({ ok: true });
}

module.exports = { register, login, refresh, logout };
