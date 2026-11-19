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
export interface GetRoomChatMessagesRequestDto {
  name: string; 
  page: number; 
}

export interface GetPeopleChatMessagesRequestDto {
  name: string; 
  page: number;
}

export interface PeopleChatMessageDto {
  id: number;
  name: string;
  to: string;
  mes: string;
  createAt: string;
  type: 0;
}

export type GetPeopleChatMessagesResponseDto = PeopleChatMessageDto[];