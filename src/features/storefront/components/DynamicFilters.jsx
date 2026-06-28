import React from 'react';
import { X } from 'lucide-react';
import { useSettings } from '../../../hooks/useSettings';
import { translateColor } from '../../../services/translations';

export const DynamicFilters = ({
  filters,
  onFilterChange,
  onReset,
  availableSizes = [],
  availableColors = [],
  availablePriceRanges = [],
}) => {
  const { t, activeLocale } = useSettings();

  const normalizedColors = availableColors.map((color) => {
    if (!color) return null;
    return typeof color === 'string'
      ? { name: color, code: '#000000' }
      : { name: color.name, code: color.code || color.hex_code || '#000000' };
  }).filter(Boolean);

  return (
    <div className="flex flex-col gap-6 w-full text-left">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <h3 className="text-base font-bold text-neutral-900">{t('filters')}</h3>
        <button
          onClick={onReset}
          className="text-xs text-neutral-400 hover:text-accent flex items-center gap-1 transition-colors"
        >
          <X className="w-3 h-3" />
          {t('reset')}
        </button>
      </div>

      {/* Filtre des Tailles */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-800 mb-3">{t('size')}</h4>
        <div className="grid grid-cols-4 gap-2">
          {availableSizes.length === 0 ? (
            <div className="col-span-4 text-xs text-neutral-500">{t('no_sizes')}</div>
          ) : (
            availableSizes.map((size) => {
              const isSelected = filters.sizes?.includes(size);
              return (
                <button
                  key={size}
                  onClick={() => onFilterChange('sizes', size)}
                  className={`py-2 text-xs font-medium border text-center transition-colors rounded-sm ${
                    isSelected
                      ? 'border-primary bg-primary text-white'
                      : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
                  }`}
                >
                  {size}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Filtre des Couleurs */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-800 mb-3">{t('color')}</h4>
        <div className="flex flex-wrap gap-2.5">
          {normalizedColors.length === 0 ? (
            <div className="text-xs text-neutral-500">{t('no_colors')}</div>
          ) : (
            normalizedColors.map((color) => {
              const isSelected = filters.colors?.includes(color.name);
              return (
                <button
                  key={color.name}
                  onClick={() => onFilterChange('colors', color.name)}
                  className={`w-7 h-7 rounded-full border border-neutral-200 relative flex items-center justify-center transition-all ${
                    isSelected ? 'ring-2 ring-accent ring-offset-2 scale-105' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.code }}
                  title={translateColor(color.name, activeLocale)}
                >
                  {(color.name === 'Blanc' || color.name === 'white' || color.name === 'White') && (
                    <span className="w-1 h-1 bg-neutral-400 rounded-full" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Filtre des Prix (Tranches) */}
      <div>
        <h4 className="text-sm font-semibold text-neutral-800 mb-3">{t('price_range')}</h4>
        <div className="flex flex-col gap-2">
          {availablePriceRanges.length === 0 ? (
            <div className="text-xs text-neutral-500">{t('no_prices')}</div>
          ) : (
            availablePriceRanges.map((priceRange) => {
              const isSelected = filters.priceRange === priceRange.value;
              return (
                <label
                  key={priceRange.value}
                  className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="priceRange"
                    checked={isSelected}
                    onChange={() => onFilterChange('priceRange', priceRange.value, true)}
                    className="rounded-full border-neutral-300 text-accent focus:ring-accent"
                  />
                  {priceRange.label}
                </label>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default DynamicFilters;
