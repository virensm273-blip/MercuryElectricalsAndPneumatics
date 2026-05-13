import { safeGet, safeSet, STORAGE_KEYS } from './storage';

export const logActivity = (action, details) => {
  const logs = safeGet(STORAGE_KEYS.LOGS);
  const newLog = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    action, // 'ADD', 'EDIT', 'DELETE', 'LOGIN'
    details,
    user: 'Admin'
  };
  
  // Keep only last 50 logs
  const updatedLogs = [newLog, ...logs].slice(0, 50);
  safeSet(STORAGE_KEYS.LOGS, updatedLogs);
  
  // Dispatch event for real-time updates
  window.dispatchEvent(new Event('activity_updated'));
};

export const getLogs = () => {
  return safeGet(STORAGE_KEYS.LOGS);
};
