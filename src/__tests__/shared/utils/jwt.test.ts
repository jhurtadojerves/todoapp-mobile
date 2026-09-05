import { decodeJwtPayload } from '@/shared/utils/jwt';

function toBase64Url(value: unknown): string {
  const json = JSON.stringify(value);
  return Buffer.from(json, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function buildToken(payload: unknown): string {
  const header = toBase64Url({ alg: 'HS256', typ: 'JWT' });
  const body = toBase64Url(payload);
  return `${header}.${body}.fake-signature`;
}

describe('decodeJwtPayload', () => {
  it('should decode the user_id from a valid token', () => {
    const token = buildToken({ user_id: 42, exp: 9999999999 });

    const result = decodeJwtPayload(token);

    expect(result?.user_id).toBe(42);
  });

  it('should decode non-ASCII characters correctly', () => {
    const token = buildToken({ user_id: 1, username: 'José Ñáñez' });

    const result = decodeJwtPayload(token);

    expect(result?.username).toBe('José Ñáñez');
  });

  it('should return null for a token without three segments', () => {
    expect(decodeJwtPayload('not-a-jwt')).toBeNull();
  });

  it('should return null when the payload segment is not valid base64 JSON', () => {
    expect(decodeJwtPayload('header.###invalid###.signature')).toBeNull();
  });
});
