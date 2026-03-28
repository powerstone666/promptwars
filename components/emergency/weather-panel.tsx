"use client";

import { useEffect, useState } from "react";
import { Cloud, Thermometer, Droplets, Wind, Loader2 } from "lucide-react";
import type { WeatherData } from "@/app/api/weather/route";

interface WeatherPanelProps {
  lat: number;
  lng: number;
}

export function WeatherPanel({ lat, lng }: WeatherPanelProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
        const data = await res.json();
        if (res.ok && data.weather) {
          setWeather(data.weather);
        }
      } catch {
        // Silently fail — weather is supplementary
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-(--mr-text-dim) text-sm">
        <Loader2 className="size-3 animate-spin" />
        Loading weather...
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="space-y-3">
      <h4
        className="flex items-center gap-2 text-(--mr-gold) font-bold italic text-sm uppercase tracking-wider"
        style={{ fontFamily: "var(--font-headline)" }}
      >
        <Cloud className="size-4" aria-hidden="true" />
        Current Conditions
      </h4>

      <div className="flex flex-wrap gap-4 p-4 bg-(--mr-surface) border border-white/5">
        <div className="flex items-center gap-2">
          <Thermometer className="size-4 text-red-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-white">{weather.temperature}°C</p>
            <p className="text-[10px] text-(--mr-text-dim)">
              Feels like {weather.feelsLike}°C
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Cloud className="size-4 text-blue-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-white">{weather.weatherDescription}</p>
            <p className="text-[10px] text-(--mr-text-dim)">
              {weather.isDay ? "Daytime" : "Nighttime"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Droplets className="size-4 text-cyan-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-white">{weather.humidity}%</p>
            <p className="text-[10px] text-(--mr-text-dim)">Humidity</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Wind className="size-4 text-slate-400" aria-hidden="true" />
          <div>
            <p className="text-sm font-bold text-white">{weather.windSpeed} km/h</p>
            <p className="text-[10px] text-(--mr-text-dim)">Wind</p>
          </div>
        </div>
      </div>
    </div>
  );
}
