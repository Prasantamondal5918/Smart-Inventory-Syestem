import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';
import { ChevronRight, Home } from 'lucide-react';

const DashboardLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const pathNames = location.pathname.split('/').filter(Boolean);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* Breadcrumbs */}
          {pathNames.length > 0 && (
            <nav className="flex items-center space-x-2 text-xs text-slate-400 mb-6 capitalize">
              <Link to="/dashboard" className="flex items-center hover:text-indigo-400 transition-colors">
                <Home className="w-3.5 h-3.5 mr-1" />
                Home
              </Link>
              {pathNames.map((name, index) => {
                const routeTo = `/${pathNames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathNames.length - 1;
                return (
                  <React.Fragment key={routeTo}>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                    {isLast ? (
                      <span className="font-semibold text-slate-200">{name.replace('-', ' ')}</span>
                    ) : (
                      <Link to={routeTo} className="hover:text-indigo-400 transition-colors">
                        {name.replace('-', ' ')}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          )}

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
