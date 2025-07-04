import type { OdontogramaCategoryType } from '@/stores/odontograma-category.store';

export default interface OdontogramaCategory {
  uuid: string;
  name: string;
  color: string;
  type: OdontogramaCategoryType;
}
