import api from "./client";

export async function login(payload) {
  const res = await api.post("/auth/login", payload);
  return res.data;
}

export async function register(payload) {
  const res = await api.post("/auth/register", payload);
  return res.data;
}

export async function getMe() {
  const res = await api.get("/auth/me");
  return res.data.data.user;
}

export async function logout() {
  await api.post("/auth/logout");
}
