import { safeGet, safeSet, STORAGE_KEYS } from './storage';

export const NOTIFICATION_TYPES = {
  LOW_STOCK: 'LOW_STOCK',
  PRODUCT_ADDED: 'PRODUCT_ADDED',
  PRODUCT_UPDATED: 'PRODUCT_UPDATED',
  PRODUCT_DELETED: 'PRODUCT_DELETED',
  INQUIRY: 'INQUIRY',
  SYSTEM: 'SYSTEM'
};

export const getNotifications = () => {
  return safeGet(STORAGE_KEYS.NOTIFICATIONS, []);
};

export const addNotification = (notification) => {
  const notifications = getNotifications();
  const newNotification = {
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    read: false,
    ...notification
  };
  
  const updated = [newNotification, ...notifications].slice(0, 50); // Keep last 50
  safeSet(STORAGE_KEYS.NOTIFICATIONS, updated);
  window.dispatchEvent(new CustomEvent('notifications_updated'));
  return newNotification;
};

export const markAsRead = (id) => {
  const notifications = getNotifications();
  const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
  safeSet(STORAGE_KEYS.NOTIFICATIONS, updated);
  window.dispatchEvent(new CustomEvent('notifications_updated'));
};

export const markAllAsRead = () => {
  const notifications = getNotifications();
  const updated = notifications.map(n => ({ ...n, read: true }));
  safeSet(STORAGE_KEYS.NOTIFICATIONS, updated);
  window.dispatchEvent(new CustomEvent('notifications_updated'));
};

export const clearNotifications = () => {
  safeSet(STORAGE_KEYS.NOTIFICATIONS, []);
  window.dispatchEvent(new CustomEvent('notifications_updated'));
};
