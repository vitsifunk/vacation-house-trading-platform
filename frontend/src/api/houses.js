import api from "./client";

export async function fetchHouses(params = {}) {
  const res = await api.get("/houses", { params });
  return res.data.data;
}

export async function fetchHouseById(id) {
  const res = await api.get(`/houses/${id}`);
  return res.data.data.house;
}

export async function fetchUserHouses(userId) {
  const res = await api.get(`/users/${userId}/houses`);
  return res.data.data.houses || [];
}

export async function fetchMyHouses() {
  const res = await api.get("/houses/mine");
  return res.data.data.houses || [];
}

export async function createHouse(payload) {
  const res = await api.post("/houses", payload);
  return res.data.data.house;
}

export async function updateHouse(id, payload) {
  const res = await api.patch(`/houses/${id}`, payload);
  return res.data.data.house;
}

export async function deleteHouse(id) {
  await api.delete(`/houses/${id}`);
}
