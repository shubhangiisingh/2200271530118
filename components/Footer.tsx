
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-brand-gray">
      <div className="container mx-auto px-4 py-4 text-center text-gray-400">
        <p>&copy; {currentYear} QuickLink. All rights reserved. A client-side demonstration app.</p>
      </div>
    </footer>
  );
};

export default Footer;
