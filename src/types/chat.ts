export interface Message{
    id: string;
    conversationId: string ;
    senderName: string;
    senderAvatar?: string;
    content: string;
    createdAt: string;
    isMe: boolean;

}
export interface Conversation {
  id: string;
  name: string;           
  avatar: string;        
  type: "direct" | "group"; 
  lastMessage?: string;   
  lastMessageTime?: string; 
  unreadCount?: number;   
  isOnline?: boolean;     
}

export interface SendChatRequestDto {
  type: "room" | "people";
  to: string;
  mes: string;
}

export interface ReceiveChatMessageDto {
  id: number;
  name: string;
  to: string;
  mes: string;
  createAt?: string;
  type: number;
}

export interface GetChatMessagesRequestDto {
  name: string;
  page: number;
}

export type GetPeopleChatMessagesRequestDto = GetChatMessagesRequestDto;

export interface PeopleChatMessageDto {
  id: number;
  name: string;
  to: string;
  mes: string;
  createAt: string;
  type: 0;
}

export type GetPeopleChatMessagesResponseDto = PeopleChatMessageDto[];

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

export type GetRoomChatMessagesRequestDto = GetChatMessagesRequestDto;

export interface GetRoomChatMessagesResponseDataDto {
  name: string;
  own?: string;
  user?: RoomMemberDto[];
  userList?: RoomMemberDto[];
  chatMess?: RoomChatMessageDto[];
  chatData?: RoomChatMessageDto[];
}

export interface OutRoomResponseDataDto {
  mes: string;
}

export interface GetUserListItemDto {
  name: string;
  type: 0 | 1;
  actionTime: string;
}

export interface CheckUserExistResponseDto {
  status: boolean;
}

export type GetUserListResponseDataDto = GetUserListItemDto[];