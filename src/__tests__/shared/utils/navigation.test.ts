import { goBackOr } from '@/shared/utils/navigation';

const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockCanGoBack = jest.fn();

jest.mock('expo-router', () => ({
  router: {
    back: (...args: unknown[]) => mockBack(...args),
    replace: (...args: unknown[]) => mockReplace(...args),
    canGoBack: (...args: unknown[]) => mockCanGoBack(...args),
  },
}));

describe('goBackOr', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should go back when there is history', () => {
    mockCanGoBack.mockReturnValue(true);

    goBackOr('/boards');

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('should replace with the fallback when there is no history', () => {
    mockCanGoBack.mockReturnValue(false);

    goBackOr('/boards');

    expect(mockReplace).toHaveBeenCalledWith('/boards');
    expect(mockBack).not.toHaveBeenCalled();
  });
});
