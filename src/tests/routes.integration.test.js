const request = require("supertest");

const TEST_USER_ID = "507f1f77bcf86cd799439011";
const TARGET_USER_ID = "507f1f77bcf86cd799439012";
const HOUSE_A_ID = "507f1f77bcf86cd799439013";
const HOUSE_B_ID = "507f1f77bcf86cd799439014";
const SWAP_ID = "507f1f77bcf86cd799439015";

describe("route integration", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("POST /api/v1/auth/login returns 200 and sets access cookie", async () => {
    const loginMock = jest.fn().mockResolvedValue({
      user: {
        id: TEST_USER_ID,
        name: "Tester",
        email: "tester@example.com",
        role: "user",
      },
      token: "mock.jwt.token",
    });

    jest.doMock("../modules/auth/auth.service", () => ({
      register: jest.fn(),
      login: loginMock,
    }));

    const app = require("../app");

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "tester@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.user.email).toBe("tester@example.com");
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(loginMock).toHaveBeenCalledWith({
      email: "tester@example.com",
      password: "password123",
    });
  });

  test("POST /api/v1/swaps creates swap for authenticated user", async () => {
    const createSwapMock = jest.fn().mockResolvedValue({
      _id: SWAP_ID,
      requester: TEST_USER_ID,
      requesterHouse: HOUSE_A_ID,
      targetHouse: HOUSE_B_ID,
      targetOwner: TARGET_USER_ID,
      status: "pending",
    });

    jest.doMock("../shared/middlewares/auth", () => ({
      protect: (req, _res, next) => {
        req.user = { _id: TEST_USER_ID, role: "user" };
        next();
      },
      restrictTo: () => (_req, _res, next) => next(),
    }));

    jest.doMock("../modules/swaps/swap.service", () => ({
      createSwap: createSwapMock,
      listMySwaps: jest.fn(),
      acceptSwap: jest.fn(),
      rejectSwap: jest.fn(),
      cancelSwap: jest.fn(),
    }));

    const app = require("../app");

    const res = await request(app).post("/api/v1/swaps").send({
      requesterHouseId: HOUSE_A_ID,
      targetHouseId: HOUSE_B_ID,
      startDate: "2026-06-01T00:00:00.000Z",
      endDate: "2026-06-07T00:00:00.000Z",
      message: "Interested in swapping for this week.",
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(createSwapMock).toHaveBeenCalledWith(TEST_USER_ID, {
      requesterHouseId: HOUSE_A_ID,
      targetHouseId: HOUSE_B_ID,
      startDate: "2026-06-01T00:00:00.000Z",
      endDate: "2026-06-07T00:00:00.000Z",
      message: "Interested in swapping for this week.",
    });
  });

  test("PATCH /api/v1/swaps/:id/accept accepts swap for authenticated owner", async () => {
    const acceptSwapMock = jest.fn().mockResolvedValue({
      _id: SWAP_ID,
      status: "accepted",
    });

    jest.doMock("../shared/middlewares/auth", () => ({
      protect: (req, _res, next) => {
        req.user = { _id: TARGET_USER_ID, role: "user" };
        next();
      },
      restrictTo: () => (_req, _res, next) => next(),
    }));

    jest.doMock("../modules/swaps/swap.service", () => ({
      createSwap: jest.fn(),
      listMySwaps: jest.fn(),
      acceptSwap: acceptSwapMock,
      rejectSwap: jest.fn(),
      cancelSwap: jest.fn(),
    }));

    const app = require("../app");

    const res = await request(app).patch(`/api/v1/swaps/${SWAP_ID}/accept`).send();

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(acceptSwapMock).toHaveBeenCalledWith(TARGET_USER_ID, SWAP_ID);
  });
});
