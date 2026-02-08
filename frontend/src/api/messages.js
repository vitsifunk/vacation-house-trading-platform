import api from "./client";

export async function fetchSwapMessages(swapId, params = {}) {
  const { data } = await api.get(`/messages/swaps/${swapId}`, { params });
  return data?.data?.items || [];
}

export async function sendSwapMessage(swapId, text) {
  const { data } = await api.post(`/messages/swaps/${swapId}`, { text });
  return data?.data?.message;
}
