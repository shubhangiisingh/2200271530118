
import React from 'react';
import { Link } from 'react-router-dom';
import { LinkIcon } from './icons';

const Header: React.FC = () => {
  return (
    <header className="bg-brand-gray/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3">
        <Link to="/" className="flex items-center gap-3 text-white">
          <LinkIcon className="w-8 h-8 text-brand-light-purple" />
          <span className="text-2xl font-bold tracking-tight">QuickLink</span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
