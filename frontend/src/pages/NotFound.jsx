import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="bg-indigo-50 p-6 rounded-full mb-6">
        <FileQuestion className="w-16 h-16 text-indigo-600" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-2">
        404 - Page Not Found
      </h1>
      <p className="text-gray-500 mb-8 max-w-md mx-auto text-lg">
        Oops! It looks like the page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
      </p>
      <Link 
        to="/" 
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
      >
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;