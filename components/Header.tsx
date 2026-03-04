import React, { useState } from 'react';
import { Search, Bell, Menu } from 'lucide-react';

interface HeaderProps {
  onSearch: (query: string) => void;
  searchValue: string;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, searchValue, onMenuClick }) => {
  const [hasNotifications, setHasNotifications] = useState(true);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex items-center px-4 md:px-8 gap-4 md:gap-6 shrink-0 sticky top-0 z-20 backdrop-blur-sm">
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Menu size={24} />
      </button>

      <div className="flex-1 max-w-2xl relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search items..."
          className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-slate-100 placeholder-slate-500 transition-all shadow-sm focus:bg-white dark:focus:bg-slate-900"
        />
      </div>
      
      <div className="flex items-center gap-3 md:gap-4 ml-auto">
        <button 
          onClick={() => setHasNotifications(false)}
          className="size-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary transition-colors relative"
        >
          <Bell size={20} />
          {hasNotifications && (
            <span className="absolute top-2.5 right-3 size-2 bg-safety-orange rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
          )}
        </button>
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 font-mono hidden md:block">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    </header>
  );
};

export default Header;