import { useEffect, useState } from 'react';

export const useFacebookLogin = ({ appId, onResolve, onReject }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (document.getElementById('facebook-jssdk')) {
      setIsLoaded(true);
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: appId || '',
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
      setIsLoaded(true);
    };

    const script = document.createElement('script');
    script.id = 'facebook-jssdk';
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, [appId]);

  const login = () => {
    if (!window.FB) {
      if (onReject) onReject(new Error('Facebook SDK not loaded yet.'));
      return;
    }
    
    if (!appId) {
      if (onReject) onReject(new Error('Facebook App ID is not configured (VITE_FACEBOOK_APP_ID).'));
      return;
    }

    window.FB.login((response) => {
      if (response.authResponse) {
        if (onResolve) onResolve(response.authResponse);
      } else {
        if (onReject) onReject(new Error('User cancelled login or did not fully authorize.'));
      }
    }, { scope: 'public_profile,email' });
  };

  return { login, isLoaded };
};
