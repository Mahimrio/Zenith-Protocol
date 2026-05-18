/**
 * @file VolumeControl.tsx
 * @description Styled volume slider with glass design, neon-cyan accent,
 * label and percentage readout. Used inside SettingsModal.
 */
import React from 'react';

interface VolumeControlProps {
  /** Descriptive label shown to the left of the slider. */
  label: string;
  /** Current value in the 0–1 range. */
  value: number;
  /** Callback when the user drags the slider. */
  onChange: (v: number) => void;
}

/**
 * GlassCard-style row: label + custom range input + percentage badge.
 * The track fill and thumb use neon-cyan theming.
 */
export const VolumeControl: React.FC<VolumeControlProps> = ({ label, value, onChange }) => {
  const pct = Math.round(value * 100);

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-text-muted text-sm w-24 shrink-0 select-none">{label}</span>

      <div className="relative flex-1 h-6 flex items-center">
        {/* Filled track underlay */}
        <div className="absolute inset-y-0 left-0 flex items-center w-full pointer-events-none">
          <div className="h-1.5 rounded-full bg-white/10 w-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neon-cyan/80 to-neon-cyan shadow-[0_0_6px_#00f5ff80] transition-all duration-150"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={pct}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          className="zenith-range-slider relative z-10 w-full appearance-none bg-transparent cursor-pointer"
        />
      </div>

      <span className="text-neon-cyan text-xs font-mono w-10 text-right tabular-nums select-none">
        {pct}%
      </span>
    </div>
  );
};
