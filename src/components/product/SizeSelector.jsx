import React from 'react';

/**
 * SizeSelector – displays available shoe sizes and lets the user pick one.
 * Props:
 *   - sizes: array of size strings (e.g., ['38','39','40'])
 *   - selected: currently selected size
 *   - onSelect: callback(size) when user picks a size
 */
export const SizeSelector = ({ sizes = [], selected = null, onSelect }) => {
  return (
    <div className="flex gap-2">
      {sizes.map((size) => (
        <button
          key={size}
          type="button"
          className={`px-3 py-1 border rounded ${selected === size ? 'bg-primary text-white' : 'bg-white text-neutral-900 hover:bg-neutral-100'}`}
          onClick={() => onSelect && onSelect(size)}
        >
          {size}
        </button>
      ))}
    </div>
  );
};

export default SizeSelector;
