/** The found ids in the order they were asked for; ids that were not asked for keep their place after them. */
export const inRequestedOrder = (found: readonly string[], requested: readonly string[]): string[] => {
  const position = new Map(requested.map((id, index) => [id, index]));
  return [...found].sort((a, b) => (position.get(a) ?? Number.MAX_SAFE_INTEGER) - (position.get(b) ?? Number.MAX_SAFE_INTEGER));
};
