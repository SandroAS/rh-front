import type DRDTopicItem from './drd-topic-item.type';

export default interface DRDTopic {
  uuid?: string;
  name: string;
  order: number;
  drdTopicItems: DRDTopicItem[];
}
