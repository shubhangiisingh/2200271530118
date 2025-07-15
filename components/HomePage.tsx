
import React, { useState, useCallback } from 'react';
import { useUrlStore } from '../hooks/useUrlStore';
import { ShortenedUrl } from '../types';
import { useNavigate } from 'react-router-dom';
import { LinkIcon, BarChartIcon, CopyIcon, CheckIcon } from './icons';

const ResultCard: React.FC<{ url: ShortenedUrl }> = ({ url }) => {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    
    const shortUrl = `${window.location.origin}${window.location.pathname}#/${url.id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(shortUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="mt-8 bg-brand-gray p-6 rounded-lg shadow-lg animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-200 mb-4">Link Created Successfully!</h3>
            <div className="space-y-4">
                <div>
                    <label className="text-sm text-gray-400 block">Original URL</label>
                    <p className="text-gray-300 break-all">{url.longUrl}</p>
                </div>
                <div>
                    <label className="text-sm text-gray-400 block">Short Link</label>
                    <div className="flex items-center gap-2 mt-1">
                        <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-brand-light-purple font-medium hover:underline">{shortUrl}</a>
                        <button onClick={handleCopy} className="p-2 rounded-md hover:bg-brand-light-gray transition-colors">
                            {copied ? <CheckIcon className="w-5 h-5 text-green-400" /> : <CopyIcon className="w-5 h-5 text-gray-400" />}
                        </button>
                    </div>
                </div>
                {url.expiresAt && (
                     <div>
                        <label className="text-sm text-gray-400 block">Expires</label>
                        <p className="text-gray-300">{new Date(url.expiresAt).toLocaleString()}</p>
                    </div>
                )}
                <button
                    onClick={() => navigate(`/stats/${url.id}`)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-transparent border border-brand-light-purple text-brand-light-purple rounded-md hover:bg-brand-light-purple hover:text-white transition-all duration-300"
                >
                    <BarChartIcon className="w-5 h-5" />
                    View Stats
                </button>
            </div>
        </div>
    );
};


const HomePage: React.FC = () => {
  const [longUrl, setLongUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [validity, setValidity] = useState<number>(30);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ShortenedUrl | null>(null);

  const { addUrl, isIdTaken } = useUrlStore();

  const generateShortCode = (): string => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!longUrl) {
      setError('Please enter a URL to shorten.');
      return;
    }

    try {
        new URL(longUrl);
    } catch (_) {
        setError('Please enter a valid URL.');
        return;
    }

    let shortCode = customCode.trim();
    if (shortCode) {
        if (!/^[a-zA-Z0-9_-]+$/.test(shortCode)) {
            setError('Custom code can only contain letters, numbers, underscores, and hyphens.');
            return;
        }
        if (isIdTaken(shortCode)) {
            setError('This custom code is already taken. Please choose another one.');
            return;
        }
    } else {
        let newCode;
        do {
            newCode = generateShortCode();
        } while (isIdTaken(newCode));
        shortCode = newCode;
    }

    const now = Date.now();
    const expiresAt = validity > 0 ? now + validity * 60 * 1000 : null;

    const newUrl: ShortenedUrl = {
      id: shortCode,
      longUrl,
      createdAt: now,
      expiresAt,
      clicks: 0,
      clickHistory: [],
    };
    
    console.log(`Creating new link: ${JSON.stringify(newUrl)}`);
    addUrl(newUrl);
    setResult(newUrl);
    setLongUrl('');
    setCustomCode('');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white">Shorten Your Links</h1>
        <p className="mt-4 text-lg text-gray-400">Create simple, powerful, and trackable links.</p>
      </div>
      
      <div className="bg-brand-gray p-8 rounded-xl shadow-2xl">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
            <input
              type="url"
              placeholder="Enter your long URL here..."
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              className="w-full pl-14 pr-4 py-4 bg-brand-dark border-2 border-brand-light-gray rounded-lg text-white focus:ring-2 focus:ring-brand-light-purple focus:border-brand-light-purple outline-none transition-all duration-300"
            />
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label htmlFor="customCode" className="block text-sm font-medium text-gray-300 mb-2">Custom Code (Optional)</label>
                 <input
                  type="text"
                  id="customCode"
                  placeholder="e.g., my-awesome-link"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="w-full px-4 py-2 bg-brand-dark border border-brand-light-gray rounded-lg text-white focus:ring-1 focus:ring-brand-light-purple focus:border-brand-light-purple outline-none"
                />
             </div>
             <div>
                <label htmlFor="validity" className="block text-sm font-medium text-gray-300 mb-2">Validity (minutes, 0 for never)</label>
                <input
                  type="number"
                  id="validity"
                  value={validity}
                  min="0"
                  onChange={(e) => setValidity(parseInt(e.target.value, 10))}
                  className="w-full px-4 py-2 bg-brand-dark border border-brand-light-gray rounded-lg text-white focus:ring-1 focus:ring-brand-light-purple focus:border-brand-light-purple outline-none"
                />
             </div>
          </div>
          
          {error && <p className="mt-4 text-red-400 text-center">{error}</p>}
          
          <div className="mt-8">
            <button type="submit" className="w-full py-4 text-lg font-bold text-white bg-brand-purple rounded-lg hover:bg-brand-light-purple transition-colors duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Shorten
            </button>
          </div>
        </form>
      </div>
      
      {result && <ResultCard url={result} />}
    </div>
  );
};

export default HomePage;
