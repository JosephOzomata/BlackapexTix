import { db, delay, maybeFail } from "../database";
import { ERROR_CODES, makeError, makeSuccess } from "../../utils/errorCodes";
import { randomString } from "../../utils/ids";

/**
 * Mock auth handler.
 * NOTE: sessions here are DEV SIMULATION ONLY.
 * Production auth uses httpOnly cookies issued by the backend.
 */

const PUBLIC_USER_FIELDS = [
  "id",
  "fullName",
  "email",
  "phone",
  "avatarUrl",
  "role",
  "emailVerified",
  "status",
  "createdAt",
  "updatedAt",
];

const toPublicUser = (u) => {
  if (!u) return null;
  const out = {};
  for (const k of PUBLIC_USER_FIELDS) out[k] = u[k];
  return out;
};

export const authHandler = {
  async register({ fullName, email, password, phone }) {
    await delay(400, 800);
    maybeFail();

    const existing = db.getUserByEmail(email);
    if (existing) {
      return makeError(
        ERROR_CODES.EMAIL_ALREADY_EXISTS,
        "An account with this email already exists."
      );
    }

    const user = db.addUser({
      fullName,
      email: email.toLowerCase(),
      phone: phone ?? null,
      password,
      role: "CUSTOMER",
      emailVerified: false,
    });

    const token = randomString(32);
    db.sessions[token] = user.id;

    return makeSuccess(
      { user: toPublicUser(user), sessionToken: token },
      "Account created. Please check your email to verify your address."
    );
  },

  async login({ email, password }) {
    await delay(300, 700);
    maybeFail();

    const user = db.getUserByEmail(email);
    if (!user || user.password !== password) {
      return makeError(ERROR_CODES.INVALID_CREDENTIALS);
    }
    if (user.status === "SUSPENDED") {
      return makeError(ERROR_CODES.FORBIDDEN, "This account has been suspended.");
    }

    const token = randomString(32);
    db.sessions[token] = user.id;

    return makeSuccess({ user: toPublicUser(user), sessionToken: token });
  },

  async logout() {
    await delay(120, 260);
    return makeSuccess(null, "Signed out.");
  },

  async me(sessionToken) {
    await delay(150, 350);
    if (!sessionToken) return makeError(ERROR_CODES.UNAUTHENTICATED);
    const userId = db.sessions[sessionToken];
    if (!userId) return makeError(ERROR_CODES.UNAUTHENTICATED);
    const user = db.getUserById(userId);
    if (!user) return makeError(ERROR_CODES.UNAUTHENTICATED);
    return makeSuccess({ user: toPublicUser(user) });
  },

  async forgotPassword({ email }) {
    await delay(400, 800);
    // Always succeed (prevents account enumeration).
    const user = db.getUserByEmail(email);
    if (user) {
      // In production: backend generates a reset token and emails a link.
      user.resetToken = randomString(24);
    }
    return makeSuccess(null, "If an account exists, we've sent reset instructions.");
  },

  async resetPassword({ token, password }) {
    await delay(400, 800);
    if (!token) return makeError(ERROR_CODES.TOKEN_INVALID);
    const user = db.users.find((u) => u.resetToken === token);
    if (!user) return makeError(ERROR_CODES.TOKEN_INVALID);
    user.password = password;
    delete user.resetToken;
    return makeSuccess(null, "Password updated. You can now sign in.");
  },

  async verifyEmail({ token }) {
    await delay(300, 700);
    if (!token) return makeError(ERROR_CODES.TOKEN_INVALID);
    // In mock mode, any non-empty token succeeds for the current user.
    return makeSuccess(null, "Email verified.");
  },

  async resendVerification({ email }) {
    await delay(300, 700);
    const user = db.getUserByEmail(email);
    if (user) user.verificationSentAt = new Date().toISOString();
    return makeSuccess(null, "Verification email sent.");
  },
};

export default authHandler;