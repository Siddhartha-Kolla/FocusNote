'use server';

import { cookies } from 'next/headers';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:4000';

export async function getLatestReview() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/api/chats/latest/review`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return { 
        success: false, 
        error: `Failed to fetch review data: ${response.status} ${errorData}` 
      };
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error('Error fetching latest review:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function sendChatMessage(chatId: string, message: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}/ai-response`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return { 
        success: false, 
        error: `Failed to send message: ${response.status} ${errorData}` 
      };
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error('Error sending chat message:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

export async function createNewChat(title?: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return { success: false, error: 'No authentication token found' };
    }

    const response = await fetch(`${API_BASE_URL}/api/chats`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        title: title || 'Document Review Chat',
        messages: []
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return { 
        success: false, 
        error: `Failed to create chat: ${response.status} ${errorData}` 
      };
    }

    const data = await response.json();
    return { success: true, data };

  } catch (error) {
    console.error('Error creating new chat:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}