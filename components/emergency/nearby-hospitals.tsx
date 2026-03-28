"use client";

import { useEffect, useState } from "react";
import { MapPin, Phone, Star, ExternalLink, Loader2 } from "lucide-react";
import type { NearbyHospital } from "@/app/api/nearby-hospitals/route";

interface NearbyHospitalsPanelProps {
  lat: number;
  lng: number;
}

export function NearbyHospitalsPanel({ lat, lng }: NearbyHospitalsPanelProps) {
  const [hospitals, setHospitals] = useState<NearbyHospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHospitals() {
      try {
        const res = await fetch(`/api/nearby-hospitals?lat=${lat}&lng=${lng}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error ?? "Failed to fetch");
        setHospitals(data.hospitals ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load nearby hospitals");
      } finally {
        setLoading(false);
      }
    }

    fetchHospitals();
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-[var(--mr-text-dim)] text-sm py-4">
        <Loader2 className="size-4 animate-spin" />
        Finding nearby hospitals...
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-xs text-[var(--mr-text-dim)] py-2">
        Could not load nearby hospitals: {error}
      </p>
    );
  }

  if (hospitals.length === 0) {
    return (
      <p className="text-xs text-[var(--mr-text-dim)] py-2">
        No hospitals found nearby.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <h4
        className="flex items-center gap-2 text-[var(--mr-cyan)] font-bold italic text-sm uppercase tracking-wider"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        <MapPin className="size-4" aria-hidden="true" />
        Nearby Hospitals
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {hospitals.slice(0, 6).map((h) => (
          <div
            key={h.placeId}
            className="p-4 bg-[var(--mr-surface)] border border-white/5 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <h5 className="text-sm font-bold text-white leading-tight">{h.name}</h5>
              {h.isOpen !== null && (
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 shrink-0 ${
                    h.isOpen
                      ? "text-emerald-400 bg-emerald-400/10"
                      : "text-red-400 bg-red-400/10"
                  }`}
                >
                  {h.isOpen ? "Open" : "Closed"}
                </span>
              )}
            </div>

            <p className="text-xs text-[var(--mr-text-muted)] leading-relaxed">{h.address}</p>

            <div className="flex items-center gap-4 flex-wrap">
              {h.distance && (
                <span className="text-xs text-[var(--mr-text-dim)]">
                  📍 {h.distance}
                </span>
              )}
              {h.rating && (
                <span className="flex items-center gap-1 text-xs text-[var(--mr-gold)]">
                  <Star className="size-3 fill-current" /> {h.rating}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              {h.phone && (
                <a
                  href={`tel:${h.phone}`}
                  className="flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                  aria-label={`Call ${h.name}: ${h.phone}`}
                >
                  <Phone className="size-3" />
                  {h.phone}
                </a>
              )}
              <a
                href={h.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[var(--mr-cyan)] hover:text-white transition-colors"
                aria-label={`Open ${h.name} in Google Maps`}
              >
                <ExternalLink className="size-3" />
                Directions
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
