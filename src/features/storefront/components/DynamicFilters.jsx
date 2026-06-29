import React, { useState, useEffect } from 'react';
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
  const { t, activeLocale, activeCurrency, currencies } = useSettings();
  const [minInput, setMinInput] = useState('');
  const [maxInput, setMaxInput] = useState('');

  const activeCurConfig = currencies?.find(c => c.code === activeCurrency);
  const currencySymbol = activeCurConfig?.symbol || activeCurrency;

  useEffect(() => {
    if (filters.priceRange) {
      const [minVal, maxVal] = filters.priceRange.split('-');
      setMinInput(minVal && minVal !== '0' ? minVal : '');
      setMaxInput(maxVal && maxVal !== '999999999' && maxVal !== '16777215' && maxVal !== '9007199254740991' ? maxVal : '');
    } else {
      setMinInput('');
      setMaxInput('');
    }
  }, [filters.priceRange]);

  const handleApplyCustomPrice = () => {
    const min = minInput.trim() === '' ? '0' : minInput.trim();
    const max = maxInput.trim() === '' ? '999999999' : maxInput.trim();
    
    if (min === '0' && max === '999999999') {
      onFilterChange('priceRange', '', true);
    } else {
      onFilterChange('priceRange', `${min}-${max}`, true);
    }
  };

  const normalizedColors = availableColors.map((color) => {
    if (!color) return null;
    return typeof color === 'string'
      ? { name: color, code: '#000000' }
      : { name: color.name, code: color.code || color.hex_code || '#000000' };
  }).filter(Boolean);

  return (
    <div className="flex flex-col gap-7 w-full text-left">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <h3 className="text-sm font-black uppercase tracking-wider text-neutral-900">{t('filters')}</h3>
        <button
          onClick={onReset}
          className="text-[10px] font-bold text-neutral-400 hover:text-neutral-900 flex items-center gap-1 transition-colors uppercase tracking-wider cursor-pointer"
        >
          <X className="w-3 h-3 stroke-[2.5]" />
          {t('reset')}
        </button>
      </div>

      {/* Filtre des Tailles */}
      <div>
        <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 pb-1 border-b border-neutral-50">
          {t('size')}
        </h4>
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
                  className={`py-2.5 text-xs font-bold border text-center transition-all rounded-none uppercase select-none cursor-pointer ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 text-neutral-800 bg-white hover:border-neutral-800 hover:bg-neutral-50'
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
        <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 pb-1 border-b border-neutral-50">
          {t('color')}
        </h4>
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
                  className={`w-8 h-8 border relative flex items-center justify-center transition-all cursor-pointer select-none rounded-none ${
                    isSelected
                      ? 'border-neutral-900 ring-2 ring-neutral-900 ring-offset-2 scale-105 z-10'
                      : 'border-neutral-200 hover:border-neutral-400 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.code }}
                  title={translateColor(color.name, activeLocale)}
                >
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-white mix-blend-difference stroke-[3.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  {/* Subtle marker for white/very light background when not selected */}
                  {!isSelected && (color.name === 'Blanc' || color.name === 'white' || color.name === 'White' || color.code.toLowerCase() === '#ffffff') && (
                    <span className="absolute inset-0 border border-neutral-100 rounded-none pointer-events-none" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Filtre des Prix (Tranches) - Style Trendyol Pro */}
      <div>
        <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3.5 pb-1 border-b border-neutral-100">
          {t('price_range')}
        </h4>
        
        {/* Inputs de prix Min / Max personnalisés */}
        <div className="flex items-center gap-2 mb-4.5">
          <div className="flex-1">
            <input
              type="number"
              placeholder={`Min (${currencySymbol})`}
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCustomPrice()}
              className="w-full h-9 text-xs font-semibold px-2.5 border border-neutral-200 bg-white placeholder-neutral-300 focus:border-neutral-950 focus:outline-none transition-colors"
            />
          </div>
          <span className="text-neutral-300 text-xs font-semibold shrink-0">-</span>
          <div className="flex-1">
            <input
              type="number"
              placeholder={`Max (${currencySymbol})`}
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleApplyCustomPrice()}
              className="w-full h-9 text-xs font-semibold px-2.5 border border-neutral-200 bg-white placeholder-neutral-300 focus:border-neutral-950 focus:outline-none transition-colors"
            />
          </div>
          <button
            type="button"
            onClick={handleApplyCustomPrice}
            className="h-9 px-4 bg-neutral-950 hover:bg-neutral-900 border border-neutral-950 text-white text-[10px] font-black uppercase tracking-widest transition-colors shrink-0 cursor-pointer select-none"
          >
            OK
          </button>
        </div>

        {/* Tranches prédéfinies sous forme de checkboxes */}
        <div className="flex flex-col gap-2">
          {availablePriceRanges.length === 0 ? (
            <div className="text-xs text-neutral-500">{t('no_prices')}</div>
          ) : (
            availablePriceRanges.map((priceRange) => {
              const isSelected = filters.priceRange === priceRange.value;
              return (
                <label
                  key={priceRange.value}
                  className="flex items-center gap-3 text-xs font-semibold text-neutral-700 hover:text-neutral-950 cursor-pointer group select-none py-1"
                  onClick={() => onFilterChange('priceRange', isSelected ? '' : priceRange.value, true)}
                >
                  <span className={`w-3.5 h-3.5 border flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs' : 'border-neutral-300 group-hover:border-neutral-400 bg-white'
                  }`}>
                    {isSelected && (
                      <svg className="w-2.5 h-2.5 stroke-[3.5] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span>{priceRange.label}</span>
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
