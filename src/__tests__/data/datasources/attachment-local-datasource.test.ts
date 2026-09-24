import { AttachmentLocalDataSource } from '@/data/datasources/attachment-local-datasource';

// In-memory file system: path -> contents. Directories are tracked separately.
const mockFiles = new Map<string, string>();
const mockDirs = new Set<string>();

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///documents/',
  getInfoAsync: jest.fn(async (path: string) => ({
    exists: mockFiles.has(path) || mockDirs.has(path),
  })),
  makeDirectoryAsync: jest.fn(async (path: string) => {
    mockDirs.add(path);
  }),
  readAsStringAsync: jest.fn(async (path: string) => {
    if (!mockFiles.has(path)) throw new Error(`ENOENT: ${path}`);
    return mockFiles.get(path);
  }),
  writeAsStringAsync: jest.fn(async (path: string, contents: string) => {
    mockFiles.set(path, contents);
  }),
  copyAsync: jest.fn(async ({ from, to }: { from: string; to: string }) => {
    mockFiles.set(to, mockFiles.get(from) ?? 'binary');
  }),
  deleteAsync: jest.fn(async (path: string) => {
    mockFiles.delete(path);
  }),
}));

const DIR = 'file:///documents/task-attachments/';
const INDEX = `${DIR}index.json`;
const noCoords = { latitude: null, longitude: null };

function readIndex() {
  return JSON.parse(mockFiles.get(INDEX) ?? '[]');
}

describe('AttachmentLocalDataSource', () => {
  let dataSource: AttachmentLocalDataSource;

  beforeEach(() => {
    mockFiles.clear();
    mockDirs.clear();
    jest.clearAllMocks();
    jest.useRealTimers();
    dataSource = new AttachmentLocalDataSource();
  });

  describe('getByTask', () => {
    it('should create the attachments directory and return [] when there is no index yet', async () => {
      const result = await dataSource.getByTask(10);

      expect(result).toEqual([]);
      expect(mockDirs.has(DIR)).toBe(true);
    });

    it('should return only the attachments of the given task, newest first', async () => {
      mockDirs.add(DIR);
      mockFiles.set(
        INDEX,
        JSON.stringify([
          { id: 'old', taskId: 10, createdAt: '2026-01-01T00:00:00.000Z' },
          { id: 'other', taskId: 99, createdAt: '2026-01-03T00:00:00.000Z' },
          { id: 'new', taskId: 10, createdAt: '2026-01-02T00:00:00.000Z' },
        ])
      );

      const result = await dataSource.getByTask(10);

      expect(result.map((a) => a.id)).toEqual(['new', 'old']);
    });

    it('should treat a corrupted index as empty instead of throwing', async () => {
      mockDirs.add(DIR);
      mockFiles.set(INDEX, '{not json');

      await expect(dataSource.getByTask(10)).resolves.toEqual([]);
    });
  });

  describe('add', () => {
    it('should copy the photo into the attachments directory keeping its extension', async () => {
      mockFiles.set('file:///cache/picked.png', 'png-bytes');

      const record = await dataSource.add(10, { photoUri: 'file:///cache/picked.png', ...noCoords });

      expect(record.photoUri.startsWith(DIR)).toBe(true);
      expect(record.photoUri.endsWith('.png')).toBe(true);
      expect(mockFiles.get(record.photoUri)).toBe('png-bytes');
    });

    it('should default to a .jpg extension when the source uri has none', async () => {
      const record = await dataSource.add(10, {
        photoUri: 'content://media/external/images/42',
        ...noCoords,
      });

      expect(record.photoUri.endsWith('.jpg')).toBe(true);
    });

    it('should persist the record with coordinates and timestamp in the index', async () => {
      jest.useFakeTimers({ now: new Date('2026-05-01T12:00:00.000Z') });

      const record = await dataSource.add(10, {
        photoUri: 'file:///cache/photo.jpg',
        latitude: -0.18,
        longitude: -78.47,
      });

      expect(record).toMatchObject({
        taskId: 10,
        latitude: -0.18,
        longitude: -78.47,
        createdAt: '2026-05-01T12:00:00.000Z',
      });
      expect(readIndex()).toEqual([record]);
    });

    it('should append to existing records instead of overwriting them', async () => {
      const first = await dataSource.add(10, { photoUri: 'file:///a.jpg', ...noCoords });
      const second = await dataSource.add(11, { photoUri: 'file:///b.jpg', ...noCoords });

      expect(readIndex().map((r: { id: string }) => r.id)).toEqual([first.id, second.id]);
    });
  });

  describe('remove', () => {
    it('should drop the record from the index and delete its photo', async () => {
      const record = await dataSource.add(10, { photoUri: 'file:///a.jpg', ...noCoords });

      await dataSource.remove(record.id);

      expect(readIndex()).toEqual([]);
      expect(mockFiles.has(record.photoUri)).toBe(false);
    });

    it('should keep the other records untouched', async () => {
      const keep = await dataSource.add(10, { photoUri: 'file:///a.jpg', ...noCoords });
      const drop = await dataSource.add(10, { photoUri: 'file:///b.jpg', ...noCoords });

      await dataSource.remove(drop.id);

      expect(readIndex()).toEqual([keep]);
    });

    it('should be a no-op for an unknown id', async () => {
      const record = await dataSource.add(10, { photoUri: 'file:///a.jpg', ...noCoords });

      await dataSource.remove('does-not-exist');

      expect(readIndex()).toEqual([record]);
    });
  });
});
