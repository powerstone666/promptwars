/**
 * Centralized prompt templates for the emergency interpreter.
 *
 * All LLM instructions live here so prompt engineering is
 * auditable and never scattered across services.
 */

export const SYSTEM_PROMPT = `You are a Universal Emergency Interpreter — an AI triage system designed to convert messy, panicked, multilingual real-world inputs into structured, verified, actionable emergency guidance.

CRITICAL RULES:
1. You are a TRIAGE system, NOT a medical or diagnostic system. Never claim to diagnose.
2. Use phrases like "possible emergency", "seek urgent care", "immediate next steps", "not a diagnosis".
3. NEVER say "you definitely have", "confirmed condition", or "guaranteed safe".
4. Always include a safety disclaimer.
5. If unsure, err on the side of higher severity with lower confidence.
6. Support multilingual inputs — detect language and respond in English.
7. Extract concrete signals from the text (symptoms, hazard types, locations, affected persons).

OUTPUT FORMAT:
You must respond with ONLY a valid JSON object matching this exact structure — no markdown, no explanation, no wrapping:

{
  "incidentType": "string — e.g. Medical Emergency, Civic Hazard, Public Safety, Natural Disaster, Fire Hazard",
  "severity": "low | medium | high | critical",
  "confidence": 0.0 to 1.0,
  "language": "detected ISO 639-1 language code",
  "summary": "2-3 sentence plain-language summary of the situation",
  "extractedSignals": ["signal1", "signal2", ...],
  "immediateActions": ["action1", "action2", ...],
  "avoidActions": ["avoid1", "avoid2", ...],
  "escalation": {
    "shouldCallEmergency": true/false,
    "recommendedService": "e.g. Ambulance (108/112), Fire Service, Police, or null"
  },
  "routing": {
    "facilityType": "e.g. Hospital Emergency Room, Fire Station, Police Station, or null",
    "rationale": "why this facility type is recommended"
  },
  "verification": {
    "status": "verified | partially_verified | needs_confirmation",
    "notes": ["what signals support this assessment", "what still needs human confirmation"]
  },
  "disclaimer": "This is an AI-generated triage assessment, not a medical or professional diagnosis. Always contact local emergency services for confirmed emergencies."
}`;

export function buildUserPrompt(
  text: string,
  languageHint?: string,
  hasImage?: boolean,
): string {
  const parts: string[] = [];

  parts.push("Analyze the following real-world input and provide structured emergency triage:");
  parts.push("");
  parts.push(`INPUT: "${text}"`);

  if (languageHint) {
    parts.push(`LANGUAGE HINT: ${languageHint}`);
  }

  if (hasImage) {
    parts.push("");
    parts.push("An image has been attached. Analyze the visual content alongside the text description. Extract visual signals (injuries, hazards, environmental conditions, signage, etc.) and incorporate them into your assessment.");
  }

  parts.push("");
  parts.push("Respond with ONLY the JSON object. No other text.");

  return parts.join("\n");
}

/**
 * Safe fallback response when AI fails completely.
 * This ensures the user always gets actionable output.
 */
export const SAFE_FALLBACK = {
  incidentType: "Unclassified Emergency",
  severity: "high" as const,
  confidence: 0.1,
  language: "en",
  summary:
    "The system could not fully analyze your input. Based on the emergency context, we recommend seeking immediate professional help.",
  extractedSignals: ["Emergency input detected", "Analysis incomplete"],
  immediateActions: [
    "Call your local emergency number immediately (e.g. 911, 112, 108)",
    "Stay calm and move to a safe location",
    "Provide your location to emergency services",
    "Do not attempt to handle the situation alone if it appears dangerous",
  ],
  avoidActions: [
    "Do not ignore the situation",
    "Do not delay calling emergency services",
  ],
  escalation: {
    shouldCallEmergency: true,
    recommendedService: "Local Emergency Services (911/112/108)",
  },
  routing: {
    facilityType: null,
    rationale:
      "Unable to determine specific facility — contact general emergency services",
  },
  verification: {
    status: "needs_confirmation" as const,
    notes: [
      "AI analysis was incomplete — results require human verification",
      "Contact emergency services to confirm the situation",
    ],
  },
  disclaimer:
    "This is an AI-generated triage assessment, not a medical or professional diagnosis. The system encountered an issue processing your input. Always contact local emergency services for confirmed emergencies.",
};
