import { useContext } from 'react';
import { CustomerAuthContext } from '../context/CustomerAuthContext';

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth doit être utilisé au sein d\'un CustomerAuthProvider');
  }
  return context;
};

export default useCustomerAuth;
