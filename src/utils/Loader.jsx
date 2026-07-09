// components/Loader.jsx
import React from 'react';

const Loader = ({ className = '' }) => {
  return (
    <div className={`flex justify-center items-center py-6 ${className}`}>
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-200 opacity-30"></div>
      </div>
    </div>
  );
};

export default Loader;
