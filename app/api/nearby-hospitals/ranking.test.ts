import { rankNearbyFacilities, requiresEmergencyHospitalRanking } from "./ranking";

describe("nearby hospital ranking", () => {
  it("enables stricter ranking for high-severity medical incidents", () => {
    expect(
      requiresEmergencyHospitalRanking({
        incidentType: "Medical Emergency",
        severity: "critical",
        facilityType: "Hospital Emergency Room",
      }),
    ).toBe(true);
  });

  it("demotes unrelated specialty clinics for critical medical incidents", () => {
    const ranked = rankNearbyFacilities(
      [
        {
          name: "Oro Care Dental Clinic",
          address: "Commercial complex, Mahadevapura, Bengaluru",
          types: ["dentist", "health", "point_of_interest"],
          distanceKm: 1.2,
          rating: 4.8,
          isOpen: true,
        },
        {
          name: "City General Hospital Emergency",
          address: "Whitefield Main Road, Bengaluru",
          types: ["hospital", "health", "point_of_interest"],
          distanceKm: 2.4,
          rating: 4.1,
          isOpen: true,
        },
      ],
      {
        incidentType: "Medical Emergency",
        severity: "critical",
        facilityType: "Hospital Emergency Room",
      },
    );

    expect(ranked[0]?.name).toBe("City General Hospital Emergency");
  });

  it("keeps distance-first style results when the incident is not emergency medical", () => {
    const ranked = rankNearbyFacilities(
      [
        {
          name: "Community Hospital",
          address: "1 Health Ave",
          types: ["hospital"],
          distanceKm: 1.2,
          rating: 3.5,
          isOpen: true,
        },
        {
          name: "Regional Hospital",
          address: "2 Health Ave",
          types: ["hospital"],
          distanceKm: 1.5,
          rating: 4.7,
          isOpen: true,
        },
      ],
      {
        incidentType: "General Assistance",
        severity: "low",
        facilityType: null,
      },
    );

    expect(ranked[0]?.name).toBe("Regional Hospital");
  });
});
