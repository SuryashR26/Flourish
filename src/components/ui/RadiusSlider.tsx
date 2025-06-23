"use client";

import React from 'react';
import '@/styles/Slider.css';

interface RadiusSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

const RadiusSlider: React.FC<RadiusSliderProps> = ({
  value,
  onChange,
  min = 1,
  max = 100,
  step = 1
}) => {
  const getBackgroundSize = () => {
    return {
      backgroundSize: `${((value - min) * 100) / (max - min)}% 100%`,
    };
  };

  return (
    <div className="radius-slider-container">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="radius-slider" className="text-white font-medium text-base">
          Search radius for locations: {value} miles
        </label>
      </div>
      <input
        id="radius-slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={getBackgroundSize()}
      />
      <div className="flex justify-between text-sm text-gray-400 mt-2">
        <span>{min} mile</span>
        <span>{max} miles</span>
      </div>
    </div>
  );
};

export default RadiusSlider; 