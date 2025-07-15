
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUrlStore } from '../hooks/useUrlStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatsPage: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const { findUrl, isLoaded } = useUrlStore();

  const urlData = useMemo(() => {
    if (!shortCode || !isLoaded) return null;
    return findUrl(shortCode);
  }, [shortCode, findUrl, isLoaded]);

  const chartData = useMemo(() => {
    if (!urlData) return [];
    
    const clicksByDay: { [key: string]: number } = {};
    urlData.clickHistory.forEach(click => {
      const date = new Date(click.timestamp).toLocaleDateString();
      clicksByDay[date] = (clicksByDay[date] || 0) + 1;
    });

    return Object.entries(clicksByDay).map(([date, clicks]) => ({ date, clicks })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [urlData]);

  if (!isLoaded) {
    return <div className="text-center text-gray-400">Loading stats...</div>;
  }

  if (!urlData) {
    return (
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Link Not Found</h2>
        <p className="text-gray-400">The link with code "{shortCode}" does not exist.</p>
        <Link to="/" className="mt-6 inline-block px-6 py-2 bg-brand-purple text-white rounded-md hover:bg-brand-light-purple transition-colors">
          Create a new link
        </Link>
      </div>
    );
  }

  const shortUrl = `${window.location.origin}${window.location.pathname}#/${urlData.id}`;
  const isExpired = urlData.expiresAt && urlData.expiresAt < Date.now();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-brand-gray p-8 rounded-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">Link Analytics</h1>
        <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="text-brand-light-purple hover:underline break-all">{shortUrl}</a>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="bg-brand-dark p-4 rounded-lg">
                <p className="text-4xl font-bold text-white">{urlData.clicks}</p>
                <p className="text-gray-400">Total Clicks</p>
            </div>
             <div className="bg-brand-dark p-4 rounded-lg">
                <p className="text-sm font-bold text-white">{new Date(urlData.createdAt).toLocaleString()}</p>
                <p className="text-gray-400">Created On</p>
            </div>
             <div className="bg-brand-dark p-4 rounded-lg">
                <p className={`text-sm font-bold ${isExpired ? 'text-red-400' : 'text-green-400'}`}>{urlData.expiresAt ? new Date(urlData.expiresAt).toLocaleString() : 'Never'}</p>
                <p className="text-gray-400">Expires On</p>
            </div>
             <div className="bg-brand-dark p-4 rounded-lg">
                <p className={`text-sm font-bold ${isExpired ? 'text-red-400' : 'text-green-400'}`}>{isExpired ? 'Expired' : 'Active'}</p>
                <p className="text-gray-400">Status</p>
            </div>
        </div>

        <div className="mt-8">
            <h3 className="text-xl font-semibold text-white mb-2">Original URL</h3>
            <p className="text-gray-300 bg-brand-dark p-4 rounded-lg break-all">{urlData.longUrl}</p>
        </div>
        
        <div className="mt-8">
            <h3 className="text-xl font-semibold text-white mb-4">Click History</h3>
            {urlData.clicks > 0 ? (
                <div className="h-80 bg-brand-dark p-4 rounded-lg">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                            <XAxis dataKey="date" stroke="#9ca3af" />
                            <YAxis allowDecimals={false} stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
                            <Legend />
                            <Line type="monotone" dataKey="clicks" stroke="#a855f7" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p className="text-gray-400 text-center py-8 bg-brand-dark rounded-lg">No clicks recorded yet.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
