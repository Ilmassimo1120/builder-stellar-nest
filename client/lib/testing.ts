export const mockLocalStorage = (initial: Record<string, string> = {}) => {
  const { mock } = createMockLocalStorage(initial);
  return mock;
};
