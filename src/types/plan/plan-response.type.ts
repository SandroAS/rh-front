export type PlanInterval = 'monthly' | 'yearly';

export interface PlanResponse {
  uuid: string;
  slug: string | null;
  name: string;
  description: string | null;
  is_dynamic: boolean;
  base_price: number;
  price_per_professional: number | null;
  interval: PlanInterval;
  user_limit: number | null;
}
