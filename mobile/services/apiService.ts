

import { Config } from '@/constants/config';
import { ApiResponse, Stream, ChatMessage, User } from '@/types';
import { useAuthStore } from '@/store/authStore';


function getHeaders(contentType = 'application/json') {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}



export interface LoginPayload {
  username: string;
  password: string;
  role: 'creator' | 'viewer';
}

export interface LoginResponse {
  user: User;
  token: string;
}


export async function loginApi(payload: LoginPayload): Promise<ApiResponse<LoginResponse>> {
  try {
    const res = await fetch(`${Config.BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
}




export async function fetchStreamsApi(): Promise<ApiResponse<Stream[]>> {
  try {
    const res = await fetch(`${Config.BASE_URL}/streams`, {
      headers: getHeaders(),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
}


export async function fetchStreamByIdApi(id: string): Promise<ApiResponse<Stream>> {
  try {
    const res = await fetch(`${Config.BASE_URL}/streams/${id}`, {
      headers: getHeaders(),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
}


export async function startStreamApi(payload: {
  creatorId: string;
  creatorName: string;
  title: string;
}): Promise<ApiResponse<Stream & { livekitToken: string }>> {
  try {
    const res = await fetch(`${Config.BASE_URL}/streams/start`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
}


export async function endStreamApi(payload: {
  streamId: string;
  creatorId: string;
}): Promise<ApiResponse<{ ended: boolean }>> {
  try {
    const res = await fetch(`${Config.BASE_URL}/streams/end`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
}




export async function fetchChatApi(streamId: string): Promise<ApiResponse<ChatMessage[]>> {
  try {
    const res = await fetch(`${Config.BASE_URL}/chat/${streamId}`, {
      headers: getHeaders(),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
}


export async function sendMessageApi(payload: {
  streamId: string;
  senderId: string;
  senderName: string;
  message: string;
  uuid?: string;
  deviceId?: string;
}): Promise<ApiResponse<ChatMessage>> {
  try {
    const res = await fetch(`${Config.BASE_URL}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Connection error' };
  }
}