// Utility to compute onboarding metrics consistently across components
// Keep logic centralized to ensure DRY and consistent numbers everywhere

export type OnboardingClientLike = {
  percentageComplete?: number | null;
};

export type OnboardingMetrics = {
  totalClients: number;
  completed: number;
  inProgress: number;
  avgCompletion: number; // 0-100 rounded integer
};

export function getOnboardingMetrics(clients: OnboardingClientLike[] = []): OnboardingMetrics {
  const totalClients = clients.length;
  const pct = (c: OnboardingClientLike) => (c.percentageComplete ?? 0);

  const completed = clients.filter(c => pct(c) === 100).length;
  const inProgress = clients.filter(c => pct(c) > 0 && pct(c) < 100).length;
  const avgCompletion = totalClients > 0
    ? Math.round(clients.reduce((sum, c) => sum + pct(c), 0) / totalClients)
    : 0;

  return { totalClients, completed, inProgress, avgCompletion };
}
