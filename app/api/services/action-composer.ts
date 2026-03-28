/**
 * Action Composer — enriches AI output with deterministic action mappings.
 *
 * Adds supplementary actions, do-not-do warnings, and safe disclaimers
 * based on incident type and severity. Ensures every response
 * has actionable, clear guidance.
 */

import type { AnalyzeResponse, Severity } from "./types";

/* ── Supplementary actions by severity ── */

const SEVERITY_ACTIONS: Record<Severity, string[]> = {
  critical: [
    "Call emergency services IMMEDIATELY (911/112/108)",
    "Do not leave the affected person alone",
    "Clear the area of bystanders if hazardous",
    "Prepare to provide CPR if trained and the person is unresponsive",
  ],
  high: [
    "Call emergency services or go to the nearest emergency room",
    "Keep the affected person comfortable and still",
    "Monitor for any changes in condition",
    "Gather information about what happened for responders",
  ],
  medium: [
    "Seek professional medical or safety assessment soon",
    "Monitor the situation for any escalation",
    "Document what you observe (photos, notes, timestamps)",
    "Contact relevant local authorities if the situation persists",
  ],
  low: [
    "Monitor the situation and note any changes",
    "Seek non-emergency professional advice if symptoms persist",
    "Keep emergency numbers accessible",
  ],
};

/* ── Universal avoid actions by incident type ── */

const INCIDENT_AVOIDS: Record<string, string[]> = {
  "Medical Emergency": [
    "Do not attempt to diagnose the condition yourself",
    "Do not administer medication unless prescribed and you are certain",
    "Do not move the person if a spinal injury is suspected",
    "Do not offer food or water if the person is unconscious",
  ],
  "Civic Hazard": [
    "Do not touch exposed wires or conductive materials",
    "Do not use water on electrical hazards",
    "Do not allow children or pets near the hazard zone",
    "Do not try to repair infrastructure yourself",
  ],
  "Public Safety": [
    "Do not approach the source of chemical smells or smoke",
    "Do not enter enclosed spaces with unknown substances",
    "Do not ignore evacuation orders",
  ],
  "Fire Hazard": [
    "Do not attempt to fight large fires yourself",
    "Do not re-enter a building after evacuating",
    "Do not use elevators during a fire",
    "Do not open doors that are hot to the touch",
  ],
  "Natural Disaster": [
    "Do not cross flooded roads or bridges",
    "Do not return to damaged structures without clearance",
    "Do not ignore official warnings or evacuation orders",
  ],
};

/**
 * Enrich the analysis with supplementary actions and avoid actions.
 * Merges AI-generated actions with deterministic mappings.
 */
export function composeActions(analysis: AnalyzeResponse): AnalyzeResponse {
  const result = { ...analysis };

  // Merge supplementary actions (avoid duplicates)
  const severityActions = SEVERITY_ACTIONS[result.severity] ?? [];
  const existingActions = new Set(result.immediateActions.map((a) => a.toLowerCase()));

  for (const action of severityActions) {
    if (!existingActions.has(action.toLowerCase())) {
      result.immediateActions.push(action);
    }
  }

  // Merge incident-specific avoid actions
  const incidentAvoids = findBestMatch(result.incidentType);
  const existingAvoids = new Set(result.avoidActions.map((a) => a.toLowerCase()));

  for (const avoid of incidentAvoids) {
    if (!existingAvoids.has(avoid.toLowerCase())) {
      result.avoidActions.push(avoid);
    }
  }

  // Ensure at least one avoid action
  if (result.avoidActions.length === 0) {
    result.avoidActions.push(
      "Do not panic — stay calm and follow the immediate actions above",
      "Do not spread unverified information about the situation",
    );
  }

  return result;
}

/**
 * Fuzzy-match incident type to our known categories.
 */
function findBestMatch(incidentType: string): string[] {
  const normalised = incidentType.toLowerCase();

  for (const [key, avoids] of Object.entries(INCIDENT_AVOIDS)) {
    if (normalised.includes(key.toLowerCase()) || key.toLowerCase().includes(normalised)) {
      return avoids;
    }
  }

  // Keyword fallback
  if (normalised.includes("medical") || normalised.includes("health")) {
    return INCIDENT_AVOIDS["Medical Emergency"];
  }
  if (normalised.includes("fire") || normalised.includes("burn")) {
    return INCIDENT_AVOIDS["Fire Hazard"];
  }
  if (normalised.includes("electric") || normalised.includes("wire") || normalised.includes("hazard")) {
    return INCIDENT_AVOIDS["Civic Hazard"];
  }
  if (normalised.includes("flood") || normalised.includes("earthquake") || normalised.includes("storm")) {
    return INCIDENT_AVOIDS["Natural Disaster"];
  }

  return [
    "Do not attempt to handle the situation alone if it appears dangerous",
    "Do not ignore professional advice from emergency responders",
  ];
}
