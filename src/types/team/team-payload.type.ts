export default interface TeamPayload {
  uuid?: string;
  name: string;
  lead: string;
  sector_uuid?: string;
  member_uuids: string[];
}
