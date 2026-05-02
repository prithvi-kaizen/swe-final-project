import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useData } from '../../contexts/DataContext';
import { LoadingScreen } from './LoadingScreen';
import { Chatbot } from '../Chatbot/Chatbot';

const ROUTES = [
  { path: '/', label: 'Dashboard', icon: 'square' },
  { path: '/goals', label: 'Minute Heatmap', icon: 'square' },
  { path: '/clubs', label: 'Club Dominance', icon: 'square' },
  { path: '/penalties', label: 'Shootout Graveyard', icon: 'square' },
  { path: '/h2h', label: 'Head-to-Head', icon: 'square' },
  { path: '/squads', label: 'Age vs Performance', icon: 'square' },
  { path: '/referees', label: 'Referee Audit', icon: 'square' },
  { path: '/groups', label: 'Group of Death', icon: 'square' },
  { path: '/wonders', label: 'Wonder Wall', icon: 'square' },
];

const SidebarItem = ({ path, label, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      className={clsx(
        "flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-r-lg transition-all duration-200 ease-spring",
        "border-l-4",
        isActive
          ? "bg-accentLight/30 border-accentPrimary text-accentPrimary font-bold"
          : "border-transparent text-inkSecondary hover:bg-card hover:border-borderLight"
      )}
    >
      <span className="w-6 flex justify-center">
        <div className={clsx(
          "w-2 h-2 rotate-45 transition-all duration-300",
          isActive ? "bg-accentPrimary scale-125" : "bg-inkMuted opacity-40 group-hover:opacity-100"
        )} />
      </span>
      {!isCollapsed && <span className="text-sm font-semibold whitespace-nowrap">{label}</span>}
    </Link>
  );
};

export const Layout = ({ children }) => {
  const { isLoading } = useData();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-inkPrimary">
      {/* Sidebar */}
      <aside
        className={clsx(
          "bg-cardSecondary border-r border-borderLight flex flex-col transition-all duration-300 ease-spring z-20",
          isCollapsed ? "w-[64px]" : "w-[220px]"
        )}
      >
        <div className="p-4 py-6 border-b border-borderLight">
          <div className="w-8 h-8 bg-accentPrimary rounded-lg mb-2" />
          {!isCollapsed && <h1 className="font-bold text-sm tracking-tight leading-4">FIFA World Cup<br/><span className="text-inkMuted font-mono text-[10px]">ANALYTICS</span></h1>}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {ROUTES.map(route => (
            <SidebarItem key={route.path} {...route} isCollapsed={isCollapsed} />
          ))}
        </nav>

        <div className="p-4 border-t border-borderLight flex justify-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 bg-card rounded-md border border-borderLight hover:bg-white transition-colors"
          >
            {isCollapsed ? "❯" : "❮ Collapse"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto no-scrollbar scroll-smooth">
        <div className="min-h-full flex flex-col p-8 max-w-[1400px] mx-auto">
          <div className="flex-1">
            {children}
          </div>
        </div>
      </main>

      {/* Universal Chatbot Overlay */}
      <Chatbot />
    </div>
  );
};
