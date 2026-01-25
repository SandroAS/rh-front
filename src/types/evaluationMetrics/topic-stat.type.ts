export interface TopicStat {
  sum: number;
  count: number;
  questions: Record<string, { sum: number; count: number }>;
  title?: string;
}
