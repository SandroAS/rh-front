export default interface PdiGoalPayload {
  title: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  pdi_category_uuid?: string | null;
  status?: string | null;
}
