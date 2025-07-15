
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUrlStore } from '../hooks/useUrlStore';

const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const { findUrl, updateUrl, isLoaded } = useUrlStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'expired' | 'not_found'>('loading');
  const [destination, setDestination] = useState('');

  useEffect(() => {
    if (!isLoaded || !shortCode) return;

    console.log(`Attempting to redirect for shortCode: ${shortCode}`);
    const urlData = findUrl(shortCode);

    if (!urlData) {
      console.warn(`URL with code "${shortCode}" not found.`);
      setStatus('not_found');
      return;
    }

    const isExpired = urlData.expiresAt && urlData.expiresAt < Date.now();
    if (isExpired) {
      console.warn(`URL with code "${shortCode}" has expired.`);
      setStatus('expired');
      return;
    }
    
    // Update stats
    const updatedUrl = {
        ...urlData,
        clicks: urlData.clicks + 1,
        clickHistory: [...urlData.clickHistory, { timestamp: Date.now(), userAgent: navigator.userAgent }]
    };
    updateUrl(updatedUrl);
    
    console.log(`Redirecting to: ${urlData.longUrl}`);
    setDestination(urlData.longUrl);
    setStatus('success');
    window.location.href = urlData.longUrl;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortCode, isLoaded]);

  if (status === 'loading') {
    return <div className="text-center text-gray-400 p-8">Loading...</div>;
  }
  
  if (status === 'success') {
      return (
          <div className="text-center text-white p-8 bg-brand-gray rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Redirecting...</h2>
            <p className="text-gray-300">If you are not redirected automatically, <a href={destination} className="text-brand-light-purple underline">click here</a>.</p>
          </div>
      );
  }

  const renderError = (title: string, message: string) => (
      <div className="text-center text-white p-8 bg-brand-gray rounded-lg">
          <h2 className="text-2xl font-bold text-red-400 mb-4">{title}</h2>
          <p className="text-gray-300">{message}</p>
          <Link to="/" className="mt-6 inline-block px-6 py-2 bg-brand-purple text-white rounded-md hover:bg-brand-light-purple transition-colors">
              Go to Homepage
          </Link>
      </div>
  );
  
  if (status === 'expired') {
    return renderError("Link Expired", `The link with code "${shortCode}" has expired.`);
  }

  if (status === 'not_found') {
      return renderError("Link Not Found", `The link with code "${shortCode}" could not be found.`);
  }

  return null;
};

export default RedirectHandler;
