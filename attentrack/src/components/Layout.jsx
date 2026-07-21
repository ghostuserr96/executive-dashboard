import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Layout() {
  return (
    <div className="flex min-h-screen w-full bg-background relative">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <Header />
        <Outlet />
      </div>
      
      {/* Floating Chatbot Button */}
      <button className="fixed bottom-6 right-6 h-14 w-14 bg-primary rounded-full text-primary-foreground shadow-[0_4px_20px_rgba(59,130,246,0.5)] flex items-center justify-center hover:bg-primary/90 hover:scale-105 transition-all z-50">
        <Sparkles className="h-6 w-6" />
      </button>
    </div>
  );
}
