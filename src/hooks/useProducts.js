import { useState, useEffect, useCallback } from 'react';
import productService from '../services/api/productService';
import { useSettings } from './useSettings';

export const useProducts = (initialParams = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);
  const { activeLocale } = useSettings();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProducts(params);
      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.items)
        ? data.items
        : [];
      setProducts(normalized);
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la récupération des produits.');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, activeLocale]);

  const updateParams = useCallback((newParams) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  return { products, loading, error, params, updateParams, refetch: fetchProducts };
};

export default useProducts;
