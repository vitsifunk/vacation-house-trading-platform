import api from "./client";

export async function fetchNotifications(params = {}) {
  const { data } = await api.get("/notifications", { params });
  return data?.data || { items: [], page: 1, limit: 20, total: 0, pages: 0 };
}

export async function fetchUnreadCount() {
  const { data } = await api.get("/notifications/unread-count");
  return data?.data?.count || 0;
}

export async function markNotificationRead(id) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data?.data?.notification;
}

export async function markAllNotificationsRead() {
  const { data } = await api.patch("/notifications/read-all");
  return data?.data?.modified || 0;
}
