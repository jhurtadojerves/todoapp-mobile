/**
 * Shared expo-router stand-in for screen tests: screens are rendered directly
 * (outside a navigator), so navigation is asserted through `mockRouter`.
 * Use with: jest.mock('expo-router', () => require('@/test-utils/expo-router-mock'));
 */
export const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  canGoBack: jest.fn(() => false),
};

export const router = mockRouter;

export const useRouter = () => mockRouter;

export function resetMockRouter(): void {
  mockRouter.push.mockReset();
  mockRouter.replace.mockReset();
  mockRouter.back.mockReset();
  mockRouter.canGoBack.mockReset().mockReturnValue(false);
}
