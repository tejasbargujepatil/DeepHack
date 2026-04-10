const prisma = require('../config/db');
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendSuccess } = require('../utils/response');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// Register User — no OTP, auto-verified
const register = catchAsync(async (req, res, next) => {
  const { name, email, password, phone } = req.body;

  // 1. Check if user already exists and is verified
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser && existingUser.isEmailVerified) {
    return next(new AppError('An account with this email already exists', 400));
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // 3. Create / overwrite unverified user (auto-verify — no OTP needed)
  let user;
  if (existingUser) {
    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: { name, password: hashedPassword, phone, isEmailVerified: true },
    });
  } else {
    user = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone, isEmailVerified: true },
    });
  }

  // 4. Issue tokens immediately so the user is logged in right away
  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Strip password from response
  const { password: _pw, ...safeUser } = user;

  sendSuccess(res, 201, 'Account created successfully!', {
    user: safeUser,
    accessToken,
    refreshToken,
  });
});

// Login User
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Find user — include password for comparison
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return next(new AppError('No account found with this email address', 404));
  }

  // 2. Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new AppError('Incorrect password', 401));
  }

  // 3. Check account status
  if (user.isBlocked) {
    return next(new AppError('Your account has been blocked. Please contact support.', 403));
  }

  // 4. Generate Tokens
  const accessToken = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const { password: _pw, ...safeUser } = user;

  sendSuccess(res, 200, 'Logged in successfully', {
    user: safeUser,
    accessToken,
    refreshToken,
  });
});

// Logout User
const logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
  }
  sendSuccess(res, 200, 'Logged out successfully');
});

// Refresh Access Token
const refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken: token } = req.body;
  if (!token) return next(new AppError('Refresh token is required', 400));

  // Verify token signature
  const decoded = verifyRefreshToken(token);

  // Check it exists in DB (not rotated/revoked)
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    return next(new AppError('Invalid or expired refresh token. Please log in again.', 401));
  }

  // Get user
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || user.isBlocked) {
    return next(new AppError('User not found or blocked', 401));
  }

  // Rotate: delete old, issue new
  await prisma.refreshToken.delete({ where: { token } });
  const newAccessToken = generateAccessToken({ id: user.id, role: user.role });
  const newRefreshToken = generateRefreshToken({ id: user.id });

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  sendSuccess(res, 200, 'Token refreshed', {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

// Register Admin — requires ADMIN_SECRET env var
const registerAdmin = catchAsync(async (req, res, next) => {
  const { name, email, password, phone, adminSecret } = req.body;

  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'TECHDRILL_ADMIN_2024';
  if (adminSecret !== ADMIN_SECRET) {
    return next(new AppError('Invalid admin invite code', 403));
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return next(new AppError('An account with this email already exists', 400));

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, phone, isEmailVerified: true, role: 'ADMIN' },
  });

  const accessToken  = generateAccessToken({ id: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ id: user.id });
  await prisma.refreshToken.create({
    data: { userId: user.id, token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });

  const { password: _pw, ...safeUser } = user;
  sendSuccess(res, 201, 'Admin account created', { user: safeUser, accessToken, refreshToken });
});

module.exports = { register, login, logout, refreshToken, registerAdmin };

