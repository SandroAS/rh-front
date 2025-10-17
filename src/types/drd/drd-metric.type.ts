export default interface DRDMetric {
  uuid?: string;
  name: string;
  classification: string;
  type: string;
  min_score: number;
  order: number;
}
