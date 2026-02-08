import api from "./client";

export async function createSwap(payload) {
  const { data } = await api.post("/swaps", payload);
  return data?.data?.swap;
}

export async function fetchMySwaps() {
  const { data } = await api.get("/swaps/my");
  return data?.data || { sent: [], received: [] };
}

export async function acceptSwap(id) {
  const { data } = await api.patch(`/swaps/${id}/accept`);
  return data?.data?.swap;
}

export async function rejectSwap(id) {
  const { data } = await api.patch(`/swaps/${id}/reject`);
  return data?.data?.swap;
}

export async function cancelSwap(id) {
  const { data } = await api.patch(`/swaps/${id}/cancel`);
  return data?.data?.swap;
}
