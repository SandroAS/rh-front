export default interface TeamPayload {
  uuid?: string;
  name: string;
  leader: string;
  sector_uuid?: string;
  member_uuids: string[];
}
