import { useContext } from 'react';
import { SettingsContext } from '../context/SettingsContext';

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings doit être utilisé à l\'intérieur de SettingsProvider');
  }
  return context;
};

export default useSettings;
