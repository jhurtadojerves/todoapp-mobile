import { deepKeysToCamel, deepKeysToSnake } from '@/shared/utils/case-convert';

describe('deepKeysToCamel', () => {
  it('converts snake_case keys to camelCase', () => {
    expect(deepKeysToCamel({ board_id: 1, first_name: 'Ada' })).toEqual({
      boardId: 1,
      firstName: 'Ada',
    });
  });

  it('recurses into nested objects and arrays', () => {
    const input = {
      results: [{ task_id: 1, assigned_to_id: null }, { task_id: 2, assigned_to_id: 3 }],
      next_page: null,
    };

    expect(deepKeysToCamel(input)).toEqual({
      results: [{ taskId: 1, assignedToId: null }, { taskId: 2, assignedToId: 3 }],
      nextPage: null,
    });
  });

  it('leaves keys without underscores unchanged', () => {
    expect(deepKeysToCamel({ id: 1, name: 'X', email: 'a@b.com' })).toEqual({
      id: 1,
      name: 'X',
      email: 'a@b.com',
    });
  });

  it('leaves non-object values (arrays of primitives, null, primitives) untouched', () => {
    expect(deepKeysToCamel(['a', 'b'])).toEqual(['a', 'b']);
    expect(deepKeysToCamel(null)).toBeNull();
    expect(deepKeysToCamel(42)).toBe(42);
  });
});

describe('deepKeysToSnake', () => {
  it('converts camelCase keys to snake_case', () => {
    expect(deepKeysToSnake({ boardId: 1, firstName: 'Ada' })).toEqual({
      board_id: 1,
      first_name: 'Ada',
    });
  });

  it('recurses into nested objects and arrays', () => {
    const input = { statusId: 1, sprintId: null, assignedToId: 2 };

    expect(deepKeysToSnake(input)).toEqual({
      status_id: 1,
      sprint_id: null,
      assigned_to_id: 2,
    });
  });

  it('round-trips with deepKeysToCamel', () => {
    const original = { boardId: 1, startDate: '2024-01-01', isValid: true };

    expect(deepKeysToCamel(deepKeysToSnake(original))).toEqual(original);
  });
});
