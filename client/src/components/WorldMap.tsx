import { useState, useCallback } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { navigate } from "wouter/use-hash-location";

// Natural Earth TopoJSON from CDN
const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Map ISO numeric country codes to our country names
const COUNTRY_MAP: Record<string, string> = {
  "250": "France",
  "036": "Australia",
  "620": "Portugal",
  "840": "USA",
  "276": "Germany",
  "554": "New Zealand",
  "410": "Korea",
  "724": "Spain",
  "710": "South Africa",
  "380": "Italy",
};

// Wine counts per country
const WINE_COUNTS: Record<string, number> = {
  "France": 37,
  "Australia": 28,
  "Portugal": 12,
  "USA": 11,
  "Germany": 9,
  "New Zealand": 5,
  "Korea": 4,
  "Spain": 3,
  "South Africa": 1,
  "Italy": 2,
};

// Country labels in Chinese
const COUNTRY_ZH: Record<string, string> = {
  "France": "法國",
  "Australia": "澳洲",
  "Portugal": "葡萄牙",
  "USA": "美國",
  "Germany": "德國",
  "New Zealand": "紐西蘭",
  "Korea": "韓國",
  "Spain": "西班牙",
  "South Africa": "南非",
  "Italy": "意大利",
};

// Colors for active countries
const ACTIVE_COLOR = "hsl(355, 62%, 35%)";
const HOVER_COLOR = "hsl(355, 62%, 50%)";
const DEFAULT_COLOR = "hsl(30, 15%, 82%)";
const INACTIVE_COLOR = "hsl(30, 10%, 88%)";

interface TooltipState {
  country: string;
  count: number;
  x: number;
  y: number;
}

export default function WorldMap() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  const handleMouseEnter = useCallback((geo: any, evt: React.MouseEvent) => {
    const isoNum = geo.id?.toString().padStart(3, "0");
    const country = COUNTRY_MAP[isoNum];
    if (country) {
      setHoveredCountry(country);
      setTooltip({
        country,
        count: WINE_COUNTS[country] || 0,
        x: evt.clientX,
        y: evt.clientY,
      });
    }
  }, []);

  const handleMouseMove = useCallback((geo: any, evt: React.MouseEvent) => {
    const isoNum = geo.id?.toString().padStart(3, "0");
    const country = COUNTRY_MAP[isoNum];
    if (country) {
      setTooltip(prev => prev ? { ...prev, x: evt.clientX, y: evt.clientY } : null);
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredCountry(null);
    setTooltip(null);
  }, []);

  const handleClick = useCallback((geo: any) => {
    const isoNum = geo.id?.toString().padStart(3, "0");
    const country = COUNTRY_MAP[isoNum];
    if (country) {
      navigate(`/wines?country=${encodeURIComponent(country)}`);
    }
  }, []);

  return (
    <div className="relative w-full select-none" style={{ background: "hsl(210, 40%, 96%)", borderRadius: "1rem", overflow: "hidden" }}>
      {/* Legend */}
      <div className="absolute top-3 left-4 z-10 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: ACTIVE_COLOR }} />
          <span className="font-body text-xs text-muted-foreground">Our regions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ background: INACTIVE_COLOR }} />
          <span className="font-body text-xs text-muted-foreground">Other</span>
        </div>
      </div>

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 130, center: [10, 20] }}
        style={{ width: "100%", height: "auto" }}
      >
        <ZoomableGroup zoom={1} minZoom={1} maxZoom={4}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const isoNum = geo.id?.toString().padStart(3, "0");
                const country = COUNTRY_MAP[isoNum];
                const isActive = !!country;
                const isHovered = country === hoveredCountry;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => handleClick(geo)}
                    onMouseEnter={(evt) => handleMouseEnter(geo, evt)}
                    onMouseMove={(evt) => handleMouseMove(geo, evt)}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        fill: isHovered ? HOVER_COLOR : isActive ? ACTIVE_COLOR : INACTIVE_COLOR,
                        stroke: "white",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: isActive ? "pointer" : "default",
                        transition: "fill 0.15s ease",
                      },
                      hover: {
                        fill: isActive ? HOVER_COLOR : INACTIVE_COLOR,
                        stroke: "white",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: isActive ? "pointer" : "default",
                      },
                      pressed: {
                        fill: isActive ? "hsl(355, 62%, 22%)" : INACTIVE_COLOR,
                        outline: "none",
                      },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 48 }}
        >
          <div className="bg-[hsl(355,62%,20%)] text-white rounded-lg px-3 py-2 shadow-xl border border-white/10">
            <p className="font-display text-sm font-semibold leading-none">
              {tooltip.country}
              <span className="font-body text-white/60 text-xs ml-1">
                {COUNTRY_ZH[tooltip.country]}
              </span>
            </p>
            <p className="font-body text-xs text-amber-300 mt-1">
              {tooltip.count} wines · click to explore
            </p>
          </div>
        </div>
      )}

      {/* Bottom hint */}
      <p className="absolute bottom-2 right-4 font-body text-[10px] text-muted-foreground/50">
        Scroll to zoom · drag to pan
      </p>
    </div>
  );
}
