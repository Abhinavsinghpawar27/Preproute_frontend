import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, SquarePen, ClipboardCheck, Bell, ChevronDown, LogOut, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/useAuthStore';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  // Helper to generate dynamic breadcrumbs based on the active path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) {
      return (
        <span className="text-gray-500 font-medium text-sm">Dashboard</span>
      );
    }
    if (path.startsWith('/test')) {
      return (
        <div className="flex items-center space-x-2 text-sm font-medium">
          <span className="text-gray-500">Test Creation</span>
          <span className="text-gray-300">/</span>
          {path.includes('/questions') ? (
            <>
              <span className="text-gray-500 hover:text-brand-primary cursor-pointer" onClick={() => navigate(-1)}>Create Test</span>
              <span className="text-gray-300">/</span>
              <span className="text-[#374151] font-semibold">Add Questions</span>
            </>
          ) : path.includes('/preview') ? (
            <>
              <span className="text-gray-500 hover:text-brand-primary cursor-pointer" onClick={() => navigate(-2)}>Create Test</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-500 hover:text-brand-primary cursor-pointer" onClick={() => navigate(-1)}>Add Questions</span>
              <span className="text-gray-300">/</span>
              <span className="text-[#374151] font-semibold">Preview & Publish</span>
            </>
          ) : (
            <span className="text-[#374151] font-semibold">Create Test</span>
          )}
        </div>
      );
    }
    return null;
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: TrendingUp,
    },
    {
      name: 'Test Creation',
      path: '/test/create',
      icon: SquarePen,
      // Matches subpaths like /test/:id/questions and /test/:id/preview
      isActive: (currentPath: string) => currentPath.startsWith('/test'),
    },
    {
      name: 'Test Tracking',
      path: '#',
      icon: ClipboardCheck,
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        toast('Test Tracking is coming soon!', { icon: '🚀' });
      },
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-150">
        <div className="flex items-center space-x-2">
          <div className="relative">
            {/* Squiggle above "p" */}
            <svg
              className="absolute -top-3 left-0.5 text-[#5B7FEC] w-6 h-3"
              viewBox="0 0 30 15"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M2 10 Q 8 2, 15 10 T 28 5" />
            </svg>
            <span className="text-2xl font-extrabold text-[#5B7FEC]">P</span>
          </div>
          <span className="text-2xl font-extrabold text-[#374151]">repRoute</span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item) => {
          const active = item.isActive ? item.isActive(location.pathname) : location.pathname === item.path;
          const Icon = item.icon;
          
          if (item.path === '#') {
            return (
              <a
                key={item.name}
                href="#"
                onClick={item.onClick}
                className="flex items-center px-4 py-3 text-sm font-semibold rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
              >
                <Icon className="w-5 h-5 mr-3 stroke-[2.25]" />
                {item.name}
              </a>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => {
                const currentActive = item.isActive ? item.isActive(location.pathname) : isActive;
                return `flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-150 ${
                  currentActive
                    ? 'bg-[#F0F4FE] text-[#5B7FEC]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`;
              }}
            >
              <Icon className={`w-5 h-5 mr-3 stroke-[2.25] ${active ? 'text-[#5B7FEC]' : 'text-gray-500'}`} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FAFAFC] overflow-hidden font-sans">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:block md:w-64 border-r border-gray-200 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          ></div>
          <div className="relative flex flex-col flex-1 w-full max-w-xs bg-white">
            <div className="absolute top-0 right-0 p-4">
              <button
                type="button"
                className="flex items-center justify-center w-8 h-8 rounded-full focus:outline-none focus:ring-2 focus:ring-[#5B7FEC]"
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="h-full">{sidebarContent}</div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-gray-150 flex items-center justify-between px-6 shrink-0 relative z-10">
          
          {/* Breadcrumb or Mobile menu toggle */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="p-2 -ml-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 md:hidden focus:outline-none focus:ring-2 focus:ring-[#5B7FEC]"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              {getBreadcrumbs()}
            </div>
          </div>

          {/* Right Area: Profile info, Notification */}
          <div className="flex items-center space-x-6">
            
            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5B7FEC]"
              onClick={() => toast('No new notifications')}
            >
              <Bell className="w-[22px] h-[22px] stroke-[2]" />
              {/* Green badge dot */}
              <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-[#10B981] ring-2 ring-white"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="flex items-center space-x-3 focus:outline-none group"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {/* Avatar Image */}
                <div className="w-9 h-9 rounded-full bg-[#F5E2C8] overflow-hidden border border-gray-200 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full text-[#A16207]" viewBox="0 0 32 32" fill="currentColor">
                    {/* Simplified avatar icon vector */}
                    <path d="M16 8a5 5 0 100 10 5 5 0 000-10z" />
                    <path d="M16 20c-5.3 0-10 3.2-10 6.5v1.5h20v-1.5c0-3.3-4.7-6.5-10-6.5z" />
                  </svg>
                </div>
                
                {/* User labels */}
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-bold text-gray-800 group-hover:text-gray-600 transition-colors leading-none">
                    {user?.name || user?.username || 'Alex Wando'}
                  </p>
                  <p className="text-[11px] font-semibold text-gray-400 mt-1 leading-none">
                    {user?.role || 'Admin'}
                  </p>
                </div>

                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 focus:outline-none">
                  <div className="px-4 py-3">
                    <p className="text-xs text-gray-400 font-semibold">Signed in as</p>
                    <p className="text-sm font-bold text-gray-700 truncate">{user?.userId || 'Alex Wando'}</p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2.5" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto bg-[#FAFAFC]">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};
