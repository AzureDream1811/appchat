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

export interface ReceivedChatMessage {
  id: number;
  name: string;
  to: string;
  mes: string;
  createAt?: string;
  type: number;
}

export interface PeopleChatMessage {
  id: number;
  name: string;
  to: string;
  mes: string;
  createAt: string;
  type: 0;
}

export type PeopleChatMessages = PeopleChatMessage[];

export interface RoomMember {
  id: number;
  name: string;
}

export interface RoomChatMessage {
  id: number;
  name: string;
  to: string;
  mes: string;
  createAt: string;
  type: number;
}

export interface RoomResponse {
  id?: number;
  name: string;
  own?: string;
  createTime?: string;
  user?: RoomMember[];
  userList?: RoomMember[];
  chatMess?: RoomChatMessage[];
  chatData?: RoomChatMessage[];
}

export interface RoomChatHistory {
  name: string;
  own?: string;
  user?: RoomMember[];
  userList?: RoomMember[];
  chatMess?: RoomChatMessage[];
  chatData?: RoomChatMessage[];
}

export interface OutRoomResponse {
  mes: string;
}

export interface UserListItem {
  name: string;
  type: 0 | 1;
  actionTime: string;
}

export type UserList = UserListItem[];