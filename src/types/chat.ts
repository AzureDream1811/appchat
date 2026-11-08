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