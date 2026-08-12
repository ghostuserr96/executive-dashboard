import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { Outlet } from 'react-router-dom';
import { Bot } from 'lucide-react';


export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background relative">
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="flex flex-1 flex-col min-w-0 h-screen overflow-hidden">
        <Header onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)} />
        <Outlet />
      </div>

      {/* Global Floating AI Assistant Button (Bottom Right)
      <button
        onClick={() => setIsAiModalOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 bg-primary text-primary-foreground rounded-full shadow-[0_4px_25px_rgba(59,130,246,0.6)] flex items-center justify-center hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all z-50 cursor-pointer border border-primary-foreground/20"
        title="Open AI HR Assistant"
      >
        <Bot className="h-6 w-6" />
      </button>
      */}

      {/* Global Interactive AI Assistant Modal */}

    </div>
  );
}
