import { Board } from '@/domain/models/board';
import { BoardMembership } from '@/domain/models/membership';
import { PaginatedResponse } from '@/domain/models/pagination';
import { Sprint } from '@/domain/models/sprint';
import { BoardStatus } from '@/domain/models/status';
import { Task } from '@/domain/models/task';

/** Builds an unsigned JWT whose payload decodes through `decodeJwtPayload`. */
export function makeJwt(payload: Record<string, unknown>): string {
  const encode = (value: object) =>
    Buffer.from(JSON.stringify(value))
      .toString('base64')
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`;
}

export function paginated<T>(results: T[], next: string | null = null): PaginatedResponse<T> {
  return { count: results.length, next, previous: null, results };
}

export function buildBoard(overrides: Partial<Board> = {}): Board {
  return {
    id: 1,
    name: 'Sprint board',
    description: 'Board for the current sprint',
    userId: 7,
    created: '2026-01-01T00:00:00Z',
    modified: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

export function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 10,
    boardId: 1,
    sprint: null,
    status: null,
    userId: 7,
    assignedToId: null,
    title: 'Write tests',
    description: '',
    created: '2026-01-01T00:00:00Z',
    modified: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

export function buildStatus(overrides: Partial<BoardStatus> = {}): BoardStatus {
  return { id: 3, name: 'In progress', order: 1, color: '#0a7ea4', ...overrides };
}

export function buildSprint(overrides: Partial<Sprint> = {}): Sprint {
  return {
    id: 4,
    name: 'Sprint 1',
    startDate: null,
    endDate: null,
    created: '2026-01-01T00:00:00Z',
    modified: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

export function buildMembership(overrides: Partial<BoardMembership> = {}): BoardMembership {
  return {
    id: 5,
    boardId: 1,
    user: { id: 8, username: 'ana', email: 'ana@example.com' },
    role: 'member',
    created: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}
