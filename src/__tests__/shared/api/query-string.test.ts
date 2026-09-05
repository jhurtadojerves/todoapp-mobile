import { buildQueryString } from '@/shared/api/query-string';

describe('buildQueryString', () => {
  it('should return an empty string when there are no defined params', () => {
    expect(buildQueryString({})).toBe('');
    expect(buildQueryString({ page: undefined })).toBe('');
  });

  it('should build a query string from defined params', () => {
    expect(buildQueryString({ page: 2 })).toBe('?page=2');
  });

  it('should join multiple params with &', () => {
    expect(buildQueryString({ page: 2, status: 5 })).toBe('?page=2&status=5');
  });

  it('should omit undefined values while keeping defined ones', () => {
    expect(buildQueryString({ page: 1, status: undefined, sprint: 3 })).toBe('?page=1&sprint=3');
  });

  it('should URL-encode keys and values', () => {
    expect(buildQueryString({ 'a b': 'c d' })).toBe('?a%20b=c%20d');
  });
});
