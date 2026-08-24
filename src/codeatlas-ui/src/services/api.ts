import axios from 'axios';
import * as signalR from '@microsoft/signalr';
import type { StartTaskRequest, TaskStatusResponse, CodeDiffModel } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';
const SIGNALR_HUB_URL = 'http://localhost:5000/hubs/execution';

export const api = {
  startTask: async (request: StartTaskRequest): Promise<TaskStatusResponse> => {
    const response = await axios.post<TaskStatusResponse>(`${API_BASE_URL}/agenttask/start`, request);
    return response.data;
  },

  getTaskStatus: async (taskId: string): Promise<TaskStatusResponse> => {
    const response = await axios.get<TaskStatusResponse>(`${API_BASE_URL}/agenttask/${taskId}`);
    return response.data;
  },

  getGitDiffs: async (taskId: string): Promise<CodeDiffModel[]> => {
    const response = await axios.get<CodeDiffModel[]>(`${API_BASE_URL}/agenttask/${taskId}/diffs`);
    return response.data;
  }
};

export const createSignalRConnection = () => {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl(SIGNALR_HUB_URL)
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

  return connection;
};
