import { createContext, useContext } from 'react';
import type { ApiLogEntry } from '../types';

export interface ApiLogContextType {
  logs: ApiLogEntry[];
  addLog: (entry: ApiLogEntry) => void;
  clearLogs: () => void;
}

export const ApiLogContext = createContext<ApiLogContextType>({
  logs: [],
  addLog: () => {},
  clearLogs: () => {},
});

export const useApiLog = () => useContext(ApiLogContext);

let logCounter = 0;
export function createLogEntry(
  engine: ApiLogEntry['engine'],
  endpoint: string,
  requestPayload: Record<string, unknown>
): ApiLogEntry {
  return {
    id: `log-${++logCounter}`,
    timestamp: Date.now(),
    endpoint,
    method: 'POST',
    requestPayload,
    responsePayload: {},
    latencyMs: 0,
    status: 'pending',
    engine,
  };
}
