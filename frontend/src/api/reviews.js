import api from "./client";

export async function createReview(payload) {
  const { data } = await api.post("/reviews", payload);
  return data?.data?.review;
}

export async function fetchUserReviews(userId, params = {}) {
  const { data } = await api.get(`/reviews/users/${userId}`, { params });
  return data?.data || { items: [], summary: { avgRating: 0, count: 0 } };
}

export async function fetchMyGivenReviews(params = {}) {
  const { data } = await api.get("/reviews/me/given", { params });
  return data?.data || { items: [] };
}
