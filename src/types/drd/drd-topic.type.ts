import type DRDTopicItemPayload from './drd-topic-item-payload.type';

export default interface DRDTopic {
  uuid?: string;
  name: string;
  order: number;
  drdTopicItems: DRDTopicItemPayload[];
}
