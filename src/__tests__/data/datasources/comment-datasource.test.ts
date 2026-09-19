import MockAdapter from 'axios-mock-adapter';

import { CommentDataSource } from '@/data/datasources/comment-datasource';
import { Comment, CommentInput } from '@/domain/models/comment';
import { PaginatedResponse } from '@/domain/models/pagination';
import { apiClient } from '@/shared/api/http-client';
import { storage } from '@/shared/utils/storage';

jest.mock('@/shared/utils/storage', () => ({
  storage: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    deleteItem: jest.fn(),
  },
}));

const apiMock = new MockAdapter(apiClient);

const mockGetItem = storage.getItem as jest.Mock;

const comment: Comment = {
  id: 1,
  taskId: 1,
  userId: 7,
  content: 'Looks good to me.',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('CommentDataSource', () => {
  let dataSource: CommentDataSource;

  beforeEach(() => {
    apiMock.reset();
    jest.clearAllMocks();
    mockGetItem.mockResolvedValue(null);
    dataSource = new CommentDataSource();
  });

  // ── fetchComments ──────────────────────────────────────────────────────────

  describe('fetchComments', () => {
    it('should return the full paginated response', async () => {
      const paginated: PaginatedResponse<Comment> = {
        count: 1,
        next: null,
        previous: null,
        results: [comment],
      };
      apiMock.onAny().reply(200, paginated);

      const result = await dataSource.fetchComments(1, 1);

      expect(result).toEqual(paginated);
    });

    it('should request the comments endpoint with the page query param', async () => {
      apiMock.onAny().reply(200, { count: 0, next: null, previous: null, results: [] });

      await dataSource.fetchComments(1, 2);

      expect(apiMock.history.get[0].url).toContain('/tasks/1/comments/?page=2');
    });

    it('should throw a default message when the request fails', async () => {
      apiMock.onAny().reply(500, {});

      await expect(dataSource.fetchComments(1, 1)).rejects.toThrow(
        'El servidor tuvo un problema. Intentá de nuevo en unos minutos.'
      );
    });
  });

  // ── createComment ──────────────────────────────────────────────────────────

  describe('createComment', () => {
    const input: CommentInput = { content: 'Looks good to me.' };

    it('should return the created comment', async () => {
      apiMock.onAny().reply(201, comment);

      const result = await dataSource.createComment(1, input);

      expect(result).toEqual(comment);
    });

    it('should send a POST request with the comment input', async () => {
      apiMock.onAny().reply(201, comment);

      await dataSource.createComment(1, input);

      const request = apiMock.history.post[0];
      expect(request.url).toContain('/tasks/1/comments/');
      expect(request.headers?.['Content-Type']).toContain('application/json');
      expect(request.data).toBe(JSON.stringify(input));
    });

    it('should throw with the field error message when present', async () => {
      apiMock.onAny().reply(400, { content: ['This field may not be blank.'] });

      await expect(dataSource.createComment(1, input)).rejects.toThrow(
        'This field may not be blank.'
      );
    });
  });

  // ── updateComment ──────────────────────────────────────────────────────────

  describe('updateComment', () => {
    const input: CommentInput = { content: 'Updated comment.' };

    it('should return the updated comment', async () => {
      apiMock.onAny().reply(200, { ...comment, content: 'Updated comment.' });

      const result = await dataSource.updateComment(1, 1, input);

      expect(result).toEqual({ ...comment, content: 'Updated comment.' });
    });

    it('should send a PATCH request to the comment detail endpoint', async () => {
      apiMock.onAny().reply(200, comment);

      await dataSource.updateComment(1, 1, input);

      const request = apiMock.history.patch[0];
      expect(request.url).toContain('/tasks/1/comments/1/');
      expect(request.data).toBe(JSON.stringify(input));
    });

    it('should throw a permission error when the user cannot edit the comment', async () => {
      apiMock.onAny().reply(403, { detail: 'You do not have permission to perform this action.' });

      await expect(dataSource.updateComment(1, 1, input)).rejects.toThrow(
        'You do not have permission to perform this action.'
      );
    });
  });

  // ── deleteComment ──────────────────────────────────────────────────────────

  describe('deleteComment', () => {
    it('should resolve when the deletion succeeds', async () => {
      apiMock.onAny().reply(204);

      await expect(dataSource.deleteComment(1, 1)).resolves.toBeUndefined();
    });

    it('should send a DELETE request to the comment detail endpoint', async () => {
      apiMock.onAny().reply(204);

      await dataSource.deleteComment(1, 1);

      expect(apiMock.history.delete[0].url).toContain('/tasks/1/comments/1/');
    });
  });
});
