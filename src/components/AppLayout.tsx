import React from 'react';
import { Outlet } from 'react-router-dom';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar Placeholder */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-brand-primary">PrepRoute</h2>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <div className="px-4 py-2 text-gray-700 font-semibold rounded">Dashboard</div>
            </li>
            <li>
              <div className="px-4 py-2 text-gray-700 font-semibold rounded">Test Creation</div>
            </li>
            <li>
              <div className="px-4 py-2 text-gray-700 font-semibold rounded">Test Tracking</div>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar Placeholder */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div></div>
          <div className="flex items-center space-x-4">
            <span className="font-semibold text-gray-700">Alex Wando</span>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
