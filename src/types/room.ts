export interface Room {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  memberIds: string[];
}