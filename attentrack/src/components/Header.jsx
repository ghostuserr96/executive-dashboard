import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Bell, CircleHelp, Moon, Sun } from 'lucide-react';
import { AnimatedThemeToggler } from './ui/animated-theme-toggler';

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check initial theme
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
    
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 lg:px-8 backdrop-blur-md">
      <div className="relative flex-1 max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input 
          className="flex border px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-10 w-full rounded-xl pl-9 pr-16 bg-muted/60 border-transparent focus-visible:bg-card" 
          placeholder="Search employees, tasks, policies…"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">⌘K</kbd>
      </div>
      
      <div className="ml-auto flex items-center gap-1.5">
        <AnimatedThemeToggler variant="hexagon" duration={600} fromCenter className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring hover:bg-accent hover:text-accent-foreground h-9 w-9 rounded-xl" />
        <button className="items-center justify-center whitespace-nowrap font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs hidden md:inline-flex gap-1.5 rounded-xl">
          <Plus className="h-4 w-4" /> Quick add
        </button>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground h-9 w-9 rounded-xl relative">
          <Bell className="h-4.5 w-4.5" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-destructive"></span>
        </button>
        <button className="items-center justify-center gap-2 whitespace-nowrap text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent hover:text-accent-foreground h-9 w-9 rounded-xl hidden md:inline-flex">
          <CircleHelp className="h-4.5 w-4.5" />
        </button>
        
        <div className="relative ml-1" ref={dropdownRef}>
          <button 
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-2 py-1.5 hover-lift" 
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="relative flex shrink-0 overflow-hidden rounded-full h-7 w-7">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-muted">EL</span>
            </span>
            <div className="hidden md:block text-left leading-tight">
              <div className="text-xs font-semibold">Ellen Larsen</div>
              <div className="text-[10px] text-muted-foreground">Owner</div>
            </div>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-card shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-border/60">
                <p className="text-sm font-semibold text-foreground">My account</p>
              </div>
              <div className="p-1.5 flex flex-col gap-0.5">
                <button className="w-full text-left px-2.5 py-2 text-sm text-foreground/90 font-medium rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors">Profile</button>
                <button className="w-full text-left px-2.5 py-2 text-sm text-foreground/90 font-medium rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors">Preferences</button>
                <button className="w-full text-left px-2.5 py-2 text-sm text-foreground/90 font-medium rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors">Switch role...</button>
              </div>
              <div className="h-px bg-border/60"></div>
              <div className="p-1.5">
                <button className="w-full text-left px-2.5 py-2 text-sm text-foreground/90 font-medium rounded-xl hover:bg-accent hover:text-accent-foreground transition-colors">Sign out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
