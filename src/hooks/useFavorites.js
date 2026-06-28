import { useContext } from 'react';
import { FavoritesContext } from '../context/FavoritesContext';

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites doit être utilisé au sein d\'un FavoritesProvider');
  }
  return context;
};

export default useFavorites;
