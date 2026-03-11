import type PdiCategory from './pdi-category.type';

export default interface PdiGoal {
  uuid?: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  pdi_category?: PdiCategory | null;
}
