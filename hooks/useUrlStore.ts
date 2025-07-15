
import { useState, useEffect, useCallback } from 'react';
import { ShortenedUrl } from '../types';

const STORAGE_KEY = 'shortenedUrls';

export const useUrlStore = () => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedUrls = localStorage.getItem(STORAGE_KEY);
      if (storedUrls) {
        setUrls(JSON.parse(storedUrls));
      }
    } catch (error) {
      console.error("Failed to load URLs from localStorage", error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(urls));
      } catch (error) {
        console.error("Failed to save URLs to localStorage", error);
      }
    }
  }, [urls, isLoaded]);

  const addUrl = useCallback((url: ShortenedUrl) => {
    setUrls(prev => [...prev, url]);
  }, []);

  const findUrl = useCallback((id: string) => {
    return urls.find(url => url.id === id);
  }, [urls]);

  const updateUrl = useCallback((updatedUrl: ShortenedUrl) => {
    setUrls(prev => prev.map(url => url.id === updatedUrl.id ? updatedUrl : url));
  }, []);
  
  const isIdTaken = useCallback((id: string) => {
    return urls.some(url => url.id === id);
  }, [urls]);

  return { urls, addUrl, findUrl, updateUrl, isIdTaken, isLoaded };
};
