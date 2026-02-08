import api from "./client";

export async function fetchMeProfile() {
  const { data } = await api.get("/users/me");
  return data?.data?.user;
}

export async function updateMeProfile(payload) {
  const { data } = await api.patch("/users/me", payload);
  return data?.data?.user;
}

export async function updateMyPassword(payload) {
  const { data } = await api.patch("/users/me/password", payload);
  return data;
}

export async function deleteMe() {
  await api.delete("/users/me");
}

export async function fetchPublicUser(userId) {
  const { data } = await api.get(`/users/${userId}`);
  return data?.data?.user;
}

export async function fetchPublicUserHouses(userId) {
  const { data } = await api.get(`/users/${userId}/houses`);
  return data?.data?.houses || [];
}
