import type PdiCategory from './pdi-category.type';

export default interface PdiGoal {
  uuid?: string;
  pdi_uuid?: string | null;
  pdi_category_uuid?: string | null;
  title: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status?: string;
  /** Categoria expandida (quando a API faz include) */
  pdi_category?: PdiCategory | null;
}
