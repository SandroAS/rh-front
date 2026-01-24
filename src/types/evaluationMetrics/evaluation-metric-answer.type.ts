export default interface EvaluationMetricAnswer {
  uuid: string;
  application_question_uuid: string;
  application_option_uuid: string | null;
  created_at: string;
  text_value: string | null;
  number_value: string | null;
  question: {
    uuid: string;
    base_question_id: number;
    title: string;
    description: string;
    type: 'RATE' | 'TEXT' | 'SHORT_TEXT' | 'LONG_TEXT' | 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'DROPDOWN';
    is_required: boolean;
    order: number;
    options: any[];
  };
}
