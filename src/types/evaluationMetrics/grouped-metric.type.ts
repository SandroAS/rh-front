import type EvaluationMetricApplication from './evaluation-metric-application.type';
import type { TopicStat } from './topic-stat.type';

export default interface GroupedMetric {
  name: string;
  applications: EvaluationMetricApplication[];
  stats: Record<string, TopicStat>;
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      borderColor: string;
      backgroundColor: string;
      data: (number | null)[];
      fill: boolean;
      tension: number;
    }[];
  };
  topicsChartData: {
    labels: string[];
    datasets: {
      label: string;
      borderColor: string;
      backgroundColor: string;
      data: (number | null)[];
      fill: boolean;
      tension: number;
    }[];
  };
}