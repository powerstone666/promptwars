export interface FacilityContext {
  incidentType?: string | null;
  severity?: string | null;
  facilityType?: string | null;
  recommendedService?: string | null;
}

export interface FacilityCandidate {
  name: string;
  address: string;
  types?: string[];
  rating?: number | null;
  isOpen?: boolean | null;
  distanceKm?: number | null;
}

interface RankedFacility extends FacilityCandidate {
  score: number;
}

const HOSPITAL_TYPE_HINTS = new Set(["hospital"]);

const SPECIALTY_EXCLUSION_KEYWORDS = [
  "dental",
  "dentist",
  "tooth",
  "ortho",
  "orthopaedic",
  "orthopedic",
  "eye hospital",
  "ophthalm",
  "dialysis",
  "implant",
  "ivf",
  "fertility",
  "surgicals",
  "surgicals",
  "skin clinic",
  "cosmetic",
];

const EMERGENCY_PRIORITY_KEYWORDS = [
  "emergency",
  "emergency room",
  "er",
  "casualty",
  "trauma",
  "24/7",
  "24x7",
];

const GENERAL_HOSPITAL_KEYWORDS = [
  "general hospital",
  "multi specialty",
  "multispeciality",
  "multispecialty",
  "medical college",
  "medical center",
  "mediclinic",
];

const CARDIAC_PRIORITY_KEYWORDS = ["cardiac", "heart", "cardio"];

function normalise(value: string | null | undefined): string {
  return (value ?? "").toLowerCase();
}

function isMedicalIncident(context: FacilityContext): boolean {
  const combined = [
    context.incidentType,
    context.facilityType,
    context.recommendedService,
  ]
    .map(normalise)
    .join(" ");

  return (
    combined.includes("medical") ||
    combined.includes("hospital") ||
    combined.includes("ambulance") ||
    combined.includes("emergency room") ||
    combined.includes("triage")
  );
}

export function requiresEmergencyHospitalRanking(context: FacilityContext): boolean {
  const severity = normalise(context.severity);
  return isMedicalIncident(context) && (severity === "high" || severity === "critical");
}

function hasKeyword(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

function scoreFacility(
  facility: FacilityCandidate,
  context: FacilityContext,
): RankedFacility {
  const searchableText = `${normalise(facility.name)} ${normalise(facility.address)}`;
  const types = facility.types ?? [];
  const hasHospitalType = types.some((type) => HOSPITAL_TYPE_HINTS.has(type));
  const isEmergencyRanked = requiresEmergencyHospitalRanking(context);

  let score = 0;

  if (hasHospitalType) {
    score += 100;
  }

  if (hasKeyword(searchableText, EMERGENCY_PRIORITY_KEYWORDS)) {
    score += 140;
  }

  if (hasKeyword(searchableText, GENERAL_HOSPITAL_KEYWORDS)) {
    score += 60;
  }

  if (hasKeyword(searchableText, CARDIAC_PRIORITY_KEYWORDS)) {
    score += 50;
  }

  if (facility.isOpen) {
    score += 20;
  }

  if (facility.rating) {
    score += Math.min(facility.rating, 5) * 4;
  }

  if (facility.distanceKm !== null && facility.distanceKm !== undefined) {
    score -= facility.distanceKm * 8;
  }

  if (isEmergencyRanked && hasKeyword(searchableText, SPECIALTY_EXCLUSION_KEYWORDS)) {
    score -= 220;
  }

  if (isEmergencyRanked && !hasHospitalType && !hasKeyword(searchableText, EMERGENCY_PRIORITY_KEYWORDS)) {
    score -= 120;
  }

  return {
    ...facility,
    score,
  };
}

export function rankNearbyFacilities<T extends FacilityCandidate>(
  facilities: T[],
  context: FacilityContext,
): T[] {
  const ranked = facilities.map((facility) => scoreFacility(facility, context));

  if (!requiresEmergencyHospitalRanking(context)) {
    return [...ranked]
      .sort((a, b) => b.score - a.score)
      .map(({ score: _score, ...facility }) => facility as T);
  }

  const filtered = ranked.filter((facility) => facility.score > 0);
  const source = filtered.length > 0 ? filtered : ranked;

  return [...source]
    .sort((a, b) => b.score - a.score)
    .map(({ score: _score, ...facility }) => facility as T);
}
