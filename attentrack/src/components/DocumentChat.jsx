import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Loader2, FileText, Database, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';

export default function DocumentChat({ isOpen, onClose, document }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isIngesting]);

  useEffect(() => {
    if (isOpen && document) {
      setMessages([]); 
      
      // Only trigger ingest if we haven't successfully indexed this document before
      const indexedDocs = JSON.parse(localStorage.getItem('indexed_docs') || '[]');
      if (!indexedDocs.includes(document.id)) {
        handleIngest(true);
      }
    }
  }, [isOpen, document]);

  const handleIngest = async (isAuto = false) => {
    if (!document) return;
    setIsIngesting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/v1/rag/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document.id,
          url: document.url,
          name: document.name,
          folder: document.folder
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to index document');
      
      // Save to localStorage so we never auto-index this document again
      const indexedDocs = JSON.parse(localStorage.getItem('indexed_docs') || '[]');
      if (!indexedDocs.includes(document.id)) {
        indexedDocs.push(document.id);
        localStorage.setItem('indexed_docs', JSON.stringify(indexedDocs));
      }
    } catch (error) {
      console.error("Ingest error:", error);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleSend = async (e, customMessage = null) => {
    if (e) e.preventDefault();
    const messageToSend = customMessage || input;
    if (!messageToSend.trim() || !document) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: messageToSend }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/v1/rag/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: messageToSend,
          documentId: document.id,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to get answer');
      }
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Oops! I hit an error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#313338] shadow-2xl z-50 flex flex-col transform transition-transform duration-300 animate-in slide-in-from-right rounded-l-3xl overflow-hidden border-l border-[#1e1f22]">
        
        {/* Header - Discord Style */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#2b2d31] border-b border-[#1e1f22] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center text-white shadow-lg shadow-[#5865F2]/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-[#f2f3f5] text-base">DocuBot</h2>
              <p className="text-xs font-semibold text-[#949ba4] truncate max-w-[180px] flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#23a559]"></div>
                Analyzing {document?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-[#b5bac1] hover:text-[#da373c] hover:bg-[#3f4147] rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Area - Vibrant Bubbles */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 bg-[#313338] scrollbar-thin scrollbar-thumb-[#1a1b1e] scrollbar-track-transparent">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500 pb-10">
              <div className="w-20 h-20 bg-[#2b2d31] rounded-full flex items-center justify-center mb-6 shadow-xl border border-[#1e1f22]">
                <FileText className="w-10 h-10 text-[#5865F2]" />
              </div>
              <h3 className="text-2xl font-black text-[#f2f3f5] mb-2 tracking-tight">Ready to Chat!</h3>
              <p className="text-[15px] text-[#b5bac1] max-w-[280px] font-medium">
                I've read <span className="text-[#f2f3f5] font-bold">{document?.name}</span>. What do you want to know?
              </p>
            </div>
          )}

          {messages.map((msg, index) => {
            const timeString = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            return msg.role === 'user' ? (
              <div key={index} className="flex w-full justify-end hover:bg-[#2b2d31]/50 py-2 px-3 rounded-lg transition-colors group">
                <div className="flex flex-col items-end mr-3 mt-0.5">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-xs font-medium text-[#949ba4] opacity-0 group-hover:opacity-100 transition-opacity">{timeString}</span>
                    <span className="text-[15px] font-semibold text-[#f2f3f5]">{user?.name || user?.displayName || 'User'}</span>
                  </div>
                  <div className="text-[15px] text-[#dbdee1] leading-relaxed text-right whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#e3e5e8] flex items-center justify-center shrink-0 shadow-sm overflow-hidden mt-0.5 text-[#313338] font-bold text-[15px]">
                  {user?.avatar || user?.photoURL ? (
                    <img src={user.avatar || user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (user?.name || user?.displayName || 'US').substring(0, 2).toUpperCase()
                  )}
                </div>
              </div>
            ) : (
              <div key={index} className="flex w-full justify-start hover:bg-[#2b2d31]/50 py-2 px-3 rounded-lg transition-colors group">
                <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center shrink-0 shadow-sm mr-3 mt-0.5">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col items-start w-full max-w-[85%]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[15px] font-semibold text-[#f2f3f5]">DocuBot</span>
                    <span className="text-xs font-medium text-[#949ba4] opacity-0 group-hover:opacity-100 transition-opacity ml-1">{timeString}</span>
                  </div>
                  <div className="text-[15px] text-[#dbdee1] leading-relaxed w-full">
                    <ReactMarkdown 
                      components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li {...props} />,
                        code: ({inline, ...props}) => inline ? <code className="bg-[#1e1f22] px-1.5 py-0.5 rounded-md text-[#f2f3f5]" {...props} /> : <pre className="bg-[#1e1f22] p-3 rounded-xl overflow-x-auto my-2 text-sm"><code {...props} /></pre>
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex w-full justify-start animate-in fade-in">
              <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center shrink-0 mt-auto mr-3 shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="px-5 py-4 bg-[#2b2d31] rounded-3xl rounded-bl-sm border border-[#1e1f22] flex items-center gap-2 shadow-lg">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-[#5865F2] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-[#5865F2] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-[#5865F2] rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Pill shaped */}
        <div className="p-5 bg-[#2b2d31] border-t border-[#1e1f22]">
          <form onSubmit={(e) => {
            if (isIngesting) {
              e.preventDefault();
              setMessages(prev => [...prev, { role: 'assistant', content: "Just a second! I'm still scanning the document. Give me one moment! 📖" }]);
              return;
            }
            handleSend(e);
          }} className="relative flex items-center bg-[#383a40] rounded-full p-1 shadow-inner">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? "DocuBot is thinking..." : "Message DocuBot..."}
              className="w-full bg-transparent pl-5 pr-4 py-3 text-[15px] font-medium focus:outline-none text-[#f2f3f5] placeholder:text-[#949ba4] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 flex shrink-0 items-center justify-center bg-[#5865F2] text-white rounded-full hover:bg-[#4752c4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md mr-1"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
