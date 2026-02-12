import type { UserAvatar } from '@/types/user/user-avatar.type';

export type QuartileLabel = 'top_25' | 'second_25' | 'third_25' | 'bottom_25';

/**
 * Usuário no ranking com sua porcentagem média (0-100).
 */
export interface RankingUser {
  user: UserAvatar;
  average_rate_percentage: number;
}

/**
 * Um dos quatro grupos (quartis) do ranking.
 */
export interface RankingQuartileGroup {
  quartile: QuartileLabel;
  users: RankingUser[];
}

export interface RankingByQuartilesResponse {
  data: RankingQuartileGroup[];
}
