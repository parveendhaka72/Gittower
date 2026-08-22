/**
 * Authentication & Security Suite
 * Topics:
 * - JWT issuance & verification (0.2 pts)
 * - Password hashing with salt (0.2 pts)
 * - Role-Based Authorization Checks (RBAC) (0.2 pts)
 */

export type UserRole = 'admin' | 'maintainer' | 'contributor' | 'guest';

export interface JwtPayload {
  userId: string;
  login: string;
  role: UserRole;
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'gittower-interview-secret-key-32-chars-min!';

// Base64URL helpers for standard zero-dependency Web Crypto JWT
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf-8');
}

async function createHmacSha256(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Buffer.from(signature)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * 1. JWT Issuance
 */
export async function signJwt(
  payload: Omit<JwtPayload, 'iat' | 'exp'>,
  expiresInSeconds: number = 3600,
  secret: string = JWT_SECRET
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signature = await createHmacSha256(`${encodedHeader}.${encodedPayload}`, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * 2. JWT Verification
 */
export async function verifyJwt(token: string, secret: string = JWT_SECRET): Promise<JwtPayload> {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = await createHmacSha256(`${encodedHeader}.${encodedPayload}`, secret);

  if (signature !== expectedSignature) {
    throw new Error('Invalid JWT signature');
  }

  const payload: JwtPayload = JSON.parse(base64UrlDecode(encodedPayload));
  const now = Math.floor(Date.now() / 1000);

  if (payload.exp && payload.exp < now) {
    throw new Error('JWT token expired');
  }

  return payload;
}

/**
 * 3. Secure Password Hashing (PBKDF2 with SHA-256 and salt)
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Buffer.from(salt).toString('hex');
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashHex = Buffer.from(derivedBits).toString('hex');
  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [saltHex, originalHash] = storedHash.split(':');
  if (!saltHex || !originalHash) return false;

  const salt = Buffer.from(saltHex, 'hex');
  const encoder = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  const hashHex = Buffer.from(derivedBits).toString('hex');
  return hashHex === originalHash;
}

/**
 * 4. Role-Based Authorization Checks (RBAC)
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  guest: 0,
  contributor: 1,
  maintainer: 2,
  admin: 3,
};

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] ?? -1;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 999;
  return userLevel >= requiredLevel;
}
