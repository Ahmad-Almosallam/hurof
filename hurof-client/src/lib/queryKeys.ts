export const queryKeys = {
  session: (id: string) => ['session', id] as const,
  question: (sessionId: string, cellId: string) => ['question', sessionId, cellId] as const,
};
