export interface Conversation {
  id: string
  participantName: string
  participantAvatar?: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  channel: 'email' | 'whatsapp' | 'portal'
}

export interface Message {
  id: string
  conversationId: string
  content: string
  sender: 'user' | 'contact'
  sentAt: string
  read: boolean
}
