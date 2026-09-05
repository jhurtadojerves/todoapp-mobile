import { CommentDataSource } from '@/data/datasources/comment-datasource';
import { Comment, CommentInput } from '@/domain/models/comment';
import { PaginatedResponse } from '@/domain/models/pagination';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function mockResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

const comment: Comment = {
  id: 1,
  task_id: 1,
  user_id: 7,
  content: 'Looks good to me.',
  created: '2026-01-01T00:00:00Z',
  modified: '2026-01-01T00:00:00Z',
};

describe('CommentDataSource', () => {
  let dataSource: CommentDataSource;

  beforeEach(() => {
    jest.clearAllMocks();
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
      mockFetch.mockResolvedValue(mockResponse(200, paginated));

      const result = await dataSource.fetchComments('valid-token', 1, 1);

      expect(result).toEqual(paginated);
    });

    it('should request the comments endpoint with the page query param', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, { count: 0, next: null, previous: null, results: [] }));

      await dataSource.fetchComments('valid-token', 1, 2);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1/comments/?page=2'),
        expect.objectContaining({ headers: { Authorization: 'Bearer valid-token' } })
      );
    });

    it('should throw a default message when the request fails', async () => {
      mockFetch.mockResolvedValue(mockResponse(500, {}));

      await expect(dataSource.fetchComments('valid-token', 1, 1)).rejects.toThrow(
        'Ocurrió un error inesperado. Intentá de nuevo.'
      );
    });
  });

  // ── createComment ──────────────────────────────────────────────────────────

  describe('createComment', () => {
    const input: CommentInput = { content: 'Looks good to me.' };

    it('should return the created comment', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, comment));

      const result = await dataSource.createComment('valid-token', 1, input);

      expect(result).toEqual(comment);
    });

    it('should send a POST request with the comment input', async () => {
      mockFetch.mockResolvedValue(mockResponse(201, comment));

      await dataSource.createComment('valid-token', 1, input);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1/comments/'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'Bearer valid-token' },
          body: JSON.stringify(input),
        })
      );
    });

    it('should throw with the field error message when present', async () => {
      mockFetch.mockResolvedValue(mockResponse(400, { content: ['This field may not be blank.'] }));

      await expect(dataSource.createComment('valid-token', 1, input)).rejects.toThrow(
        'This field may not be blank.'
      );
    });
  });

  // ── updateComment ──────────────────────────────────────────────────────────

  describe('updateComment', () => {
    const input: CommentInput = { content: 'Updated comment.' };

    it('should return the updated comment', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, { ...comment, content: 'Updated comment.' }));

      const result = await dataSource.updateComment('valid-token', 1, 1, input);

      expect(result).toEqual({ ...comment, content: 'Updated comment.' });
    });

    it('should send a PATCH request to the comment detail endpoint', async () => {
      mockFetch.mockResolvedValue(mockResponse(200, comment));

      await dataSource.updateComment('valid-token', 1, 1, input);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1/comments/1/'),
        expect.objectContaining({ method: 'PATCH', body: JSON.stringify(input) })
      );
    });

    it('should throw a permission error when the user cannot edit the comment', async () => {
      mockFetch.mockResolvedValue(
        mockResponse(403, { detail: 'You do not have permission to perform this action.' })
      );

      await expect(dataSource.updateComment('valid-token', 1, 1, input)).rejects.toThrow(
        'You do not have permission to perform this action.'
      );
    });
  });

  // ── deleteComment ──────────────────────────────────────────────────────────

  describe('deleteComment', () => {
    it('should resolve when the deletion succeeds', async () => {
      mockFetch.mockResolvedValue(mockResponse(204, null));

      await expect(dataSource.deleteComment('valid-token', 1, 1)).resolves.toBeUndefined();
    });

    it('should send a DELETE request to the comment detail endpoint', async () => {
      mockFetch.mockResolvedValue(mockResponse(204, null));

      await dataSource.deleteComment('valid-token', 1, 1);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/tasks/1/comments/1/'),
        expect.objectContaining({ method: 'DELETE', headers: { Authorization: 'Bearer valid-token' } })
      );
    });
  });
});
