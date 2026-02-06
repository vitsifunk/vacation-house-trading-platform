const { __private } = require("../modules/swaps/swap.service");

describe("swap date-range logic", () => {
  test("rangeIsCoveredByAvailability returns true when fully covered", () => {
    const house = {
      availability: [
        {
          startDate: new Date("2026-01-01T00:00:00.000Z"),
          endDate: new Date("2026-01-10T00:00:00.000Z"),
        },
      ],
    };

    const covered = __private.rangeIsCoveredByAvailability(
      house,
      new Date("2026-01-03T00:00:00.000Z"),
      new Date("2026-01-07T00:00:00.000Z"),
    );

    expect(covered).toBe(true);
  });

  test("rangeIsCoveredByAvailability returns false when not fully covered", () => {
    const house = {
      availability: [
        {
          startDate: new Date("2026-01-01T00:00:00.000Z"),
          endDate: new Date("2026-01-10T00:00:00.000Z"),
        },
      ],
    };

    const covered = __private.rangeIsCoveredByAvailability(
      house,
      new Date("2026-01-09T00:00:00.000Z"),
      new Date("2026-01-12T00:00:00.000Z"),
    );

    expect(covered).toBe(false);
  });

  test("subtractRange splits a range correctly", () => {
    const availability = [
      {
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2026-01-10T00:00:00.000Z"),
      },
    ];

    const updated = __private.subtractRange(
      availability,
      new Date("2026-01-03T00:00:00.000Z"),
      new Date("2026-01-07T00:00:00.000Z"),
    );

    expect(updated).toHaveLength(2);
    expect(updated[0].startDate.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(updated[0].endDate.toISOString()).toBe("2026-01-03T00:00:00.000Z");
    expect(updated[1].startDate.toISOString()).toBe("2026-01-07T00:00:00.000Z");
    expect(updated[1].endDate.toISOString()).toBe("2026-01-10T00:00:00.000Z");
  });
});
