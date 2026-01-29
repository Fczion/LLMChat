import { supabase } from '../lib/supabase';

export interface ChatMessage {
  id: string;
  user_google_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

/**
 * Saves a message to the chat_messages table in Supabase.
 */
export async function saveMessage(
  userGoogleId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .insert({
      user_google_id: userGoogleId,
      role,
      content,
    });

  if (error) {
    console.error('Failed to save message:', error);
    throw error;
  }
}

/**
 * Retrieves the chat history for a user, ordered by creation time.
 */
export async function getMessageHistory(userGoogleId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_google_id', userGoogleId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch messages:', error);
    throw error;
  }

  return data || [];
}

/**
 * Clears all chat messages for a user.
 */
export async function clearChatHistory(userGoogleId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('user_google_id', userGoogleId);

  if (error) {
    console.error('Failed to clear chat history:', error);
    throw error;
  }
}
