export default interface EvaluationQuestion {
  uuid?: string;
  title: string;
  description: string;
  type: 'text' | 'select' | 'number' | 'options';
  options?: string[];
}
