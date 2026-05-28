"use client"

import React, { useState } from 'react';
import { Home, Bookmark, PlusCircle, User, Settings, LucideIcon } from 'lucide-react';

interface NavItemProps {
  icon: LucideIcon;
  isActive?: boolean;
  onClick?: () => void;
  indicatorPosition: number;
  position: number;
}

const NavItem: React.FC<NavItemProps> = ({ 
  icon: Icon, 
  isActive = false, 
  onClick,
  indicatorPosition,
  position
}) => {
  const distance = Math.abs(indicatorPosition - position);
  const spotlightOpacity = isActive ? 1 : Math.max(0, 1 - distance * 0.6);

  return (
    <button
      className="relative flex items-center justify-center w-12 h-12 mx-2 transition-all duration-400"
      onClick={onClick}
    >
      <div 
        className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-24 bg-gradient-to-b from-gray-900/10 dark:from-white/40 to-transparent blur-lg rounded-full transition-opacity duration-400"
        style={{
          opacity: spotlightOpacity,
          transitionDelay: isActive ? '0.1s' : '0s',
        }}
      />
      <Icon
        className={`w-6 h-6 transition-colors duration-200 ${
          isActive 
            ? 'text-black dark:text-white' 
            : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
        }`}
        strokeWidth={isActive ? 2.5 : 2}
      />
    </button>
  );
};

export const SpotlightButton = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const navItems = [
    { icon: Home, label: 'Home' },
    { icon: Bookmark, label: 'Bookmarks' },
    { icon: PlusCircle, label: 'Add' },
    { icon: User, label: 'Profile' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="relative flex items-center px-2 py-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-md shadow-lg border border-black/10 dark:border-white/10">
      <div 
        className="absolute top-0 h-[2px] bg-black dark:bg-white transition-all duration-400 ease-in-out"
        style={{
          left: `${activeIndex * 64 + 16}px`,
          width: '48px',
          transform: 'translateY(-1px)',
        }}
      />
      {navItems.map((item, index) => (
        <NavItem
          key={item.label}
          icon={item.icon}
          isActive={activeIndex === index}
          onClick={() => setActiveIndex(index)}
          indicatorPosition={activeIndex}
          position={index}
        />
      ))}
    </nav>
  );
};

export { SpotlightButton as Component };
