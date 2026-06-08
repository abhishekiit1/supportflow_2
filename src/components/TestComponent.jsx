import React from 'react';
import { ShieldCheck, ArrowRight, Activity } from 'lucide-react';

const TestComponent = () => {
  return (
    <div className="p-8 max-w-md mx-auto my-12 bg-white rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center justify-between">
        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
          <ShieldCheck className="w-8 h-8 animate-bounce" />
        </div>
        <span className="px-3 py-1 text-xs font-semibold tracking-wide uppercase rounded-full bg-blue-50 text-blue-600">
          Tailwind v3 Active
        </span>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-bold text-gray-900">Environment Diagnostic</h3>
        <p className="mt-2 text-sm text-gray-500 leading-relaxed">
          If you can see a clean white card, a bouncing green shield icon, rounded pill badges, and a crisp layout, your Tailwind CSS compilation and icon sets are working flawlessly.
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between text-sm font-medium text-emerald-600">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span>All systems stable</span>
        </div>
        <ArrowRight className="w-4 h-4" />
      </div>
    </div>
  );
};

export default TestComponent;