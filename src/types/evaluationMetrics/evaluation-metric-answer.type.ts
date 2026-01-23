export default interface EvaluationMetricAnswer {
  uuid: string;
  text_value: string | null;
  number_value: string | null;
  question: {
    uuid: string;
    title: string;
    description: string;
    type: 'RATE' | 'TEXT' | 'MULTIPLE_CHOICE';
    order: number;
  };
}
