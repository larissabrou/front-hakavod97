import { useState, useCallback } from 'react';

export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  const handleFilterChange = useCallback((key, value, replace = false) => {
    setFilters((prev) => {
      if (replace || !Array.isArray(prev[key])) {
        return {
          ...prev,
          [key]: value,
        };
      }

      const currentValues = prev[key] || [];
      const updatedValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [key]: updatedValues,
      };
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    filters,
    handleFilterChange,
    resetFilters,
    setFilters,
  };
};

export default useFilters;
