export interface CreateRoomRequestDto {
  name: string; 
}

export interface JoinRoomRequestDto {
  name: string;
}

export interface OutRoomRequestDto {
  name: string;
}

export interface RoomMemberDto {
  id: number;
  name: string;
}

export interface RoomChatMessageDto {
  id: number;
  name: string;     
  to: string;       
  mes: string;      
  createAt: string; 
  type: number;     
}

export interface CreateRoomResponseDataDto {
  id?: number;
  name: string;
  own?: string;
  createTime?: string;
  user?: RoomMemberDto[];
  userList?: RoomMemberDto[];
  chatMess?: RoomChatMessageDto[];
  chatData?: RoomChatMessageDto[];
}

export type JoinRoomResponseDataDto = CreateRoomResponseDataDto;

export interface OutRoomResponseDataDto {
  mes: string; 
}