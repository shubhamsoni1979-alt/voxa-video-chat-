import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageSquare, X, Sparkles } from 'lucide-react';

export interface ChatMessage {
  id: string;
  sender: 'self' | 'peer' | 'system';
  text: string;
  timestamp: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isConnected: boolean;
  onCloseMobile?: () => void;
}

const QUICK_EMOJIS = ['👋', '😂', '🔥', '❤️', '👏', '😍', '🕸️'];

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  onSendMessage,
  isConnected,
  onCloseMobile
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !isConnected) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleEmojiClick = (emoji: string) => {
    if (!isConnected) return;
    onSendMessage(emoji);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden font-sans select-text">
      
      {/* Chat Header */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#B8001C] flex items-center justify-center text-white shadow-md shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black font-heading text-white flex items-center gap-1.5 truncate">
              Live Text Chat
            </h3>
            <div className="flex items-center space-x-1.5 text-[11px] font-medium truncate">
              <span className={`w-2 h-2 rounded-full shrink-0 ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className={`truncate ${isConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isConnected ? 'Peer Connected' : 'Waiting for Match...'}
              </span>
            </div>
          </div>
        </div>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            aria-label="Close chat"
            className="md:hidden p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3 sm:p-3.5 overflow-y-auto space-y-3 custom-scrollbar min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 text-slate-400 p-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-300">
              <Sparkles className="w-6 h-6 text-[#FFC72C]" />
            </div>
            <p className="text-xs font-medium">
              {isConnected
                ? 'You are connected! Type a message below to start chatting. 👋'
                : 'Searching for a stranger... Messages will appear here.'}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.sender === 'system') {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-slate-300 break-words">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isSelf = msg.sender === 'self';

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs font-medium shadow-md leading-relaxed break-words whitespace-pre-wrap overflow-hidden ${
                    isSelf
                      ? 'bg-gradient-to-r from-[#E60023] to-[#B8001C] text-white rounded-br-none'
                      : 'bg-slate-800 border border-white/10 text-slate-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">
                  {msg.timestamp}
                </span>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Emoji Bar */}
      <div className="px-3 py-2 bg-slate-950/60 border-t border-white/5 flex items-center space-x-1.5 overflow-x-auto no-scrollbar shrink-0">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            disabled={!isConnected}
            aria-label={`Send emoji ${emoji}`}
            className="min-w-[36px] min-h-[36px] px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-sm sm:text-base transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center justify-center"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Chat Input Form */}
      <form onSubmit={handleSubmit} className="p-2.5 sm:p-3 bg-slate-950 border-t border-white/10 flex items-center space-x-2 shrink-0">
        <input
          type="text"
          placeholder={isConnected ? 'Type a message...' : 'Connect with stranger to chat...'}
          disabled={!isConnected}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 min-w-0 min-h-[44px] bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#B8001C] disabled:opacity-50"
        />
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          aria-label="Send message"
          disabled={!isConnected || !inputText.trim()}
          className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-[#B8001C] hover:bg-[#8B0014] text-white flex items-center justify-center shrink-0 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-colors"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </form>

    </div>
  );
};
