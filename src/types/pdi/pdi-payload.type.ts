export default interface PdiPayload {
  name: string;
  description?: string | null;
  due_date?: string | null;
  user_uuid?: string;
  pdi_category_uuid?: string;
}
