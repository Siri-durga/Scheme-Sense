'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { schemesApi } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import { Lang, t } from '@/lib/i18n';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { ChatMessage } from '@/types';

const SUGGESTIONS = {
  en: ['Which schemes am I eligible for?', 'What farmer schemes are available?', 'How do I apply for scholarships?', 'What documents do I need?', 'Show me schemes closing soon'],
  te: ['నేను దేనికి అర్హుడిని?', 'రైతులకు పథకాలు ఏమిటి?', 'స్కాలర్‌షిప్‌లకు ఎలా దరఖాస్తు చేయాలి?', 'అవసరమైన పత్రాలు ఏవి?'],
};

export default function ChatPage() {
  const { user, loadFromStorage, isLoading } = useAuthStore();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadFromStorage(); }, []);
  useEffect(() => {
    if (!isLoading && !user) router.push('/login');
    if (user) {
      setLang(user.preferred_language as Lang);
      setMessages([{
        role: 'assistant',
        content: user.preferred_language === 'te'
          ? `నమస్కారం ${user.full_name.split(' ')[0]}! 👋 నేను Scheme Sense AI. మీకు అర్హమైన ప్రభుత్వ పథకాల గురించి అడగండి.`
          : `Hello ${user.full_name.split(' ')[0]}! 👋 I'm Scheme Sense AI. Ask me about government schemes you qualify for, required documents, or how to apply.`,
        timestamp: new Date(),
      }]);
    }
  }, [user, isLoading]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');
    setSending(true);

    const userMsg: ChatMessage = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await schemesApi.chat(msg, lang);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date() }]);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar lang={lang} onLangChange={setLang} />

      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-4">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className={`font-bold text-gray-900 ${lang === 'te' ? 'telugu' : ''}`}>
              {lang === 'te' ? 'Scheme Sense AI సహాయకుడు' : 'Scheme Sense AI Assistant'}
            </h1>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" /> Online • Scheme data grounded
            </p>
          </div>
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="mb-4">
            <p className={`text-xs text-gray-500 mb-2 ${lang === 'te' ? 'telugu' : ''}`}>
              {lang === 'te' ? 'సూచించిన ప్రశ్నలు:' : 'Try asking:'}
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS[lang].map(s => (
                <button key={s} onClick={() => sendMessage(s)}
                  className={`text-xs bg-white border border-gray-300 hover:border-green-400 hover:bg-green-50 text-gray-600 hover:text-green-700 px-3 py-1.5 rounded-full transition ${lang === 'te' ? 'telugu' : ''}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 mb-4 overflow-y-auto space-y-4 min-h-64 max-h-96">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-green-600' : 'bg-gray-100'}`}>
                {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-gray-600" />}
              </div>
              <div className={`max-w-xs sm:max-w-md px-4 py-3 text-sm leading-relaxed ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'} ${lang === 'te' ? 'telugu' : ''}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                <Bot size={14} className="text-gray-600" />
              </div>
              <div className="chat-bubble-ai px-4 py-3 text-sm text-gray-400">
                <span className="loading">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-white rounded-xl border border-gray-300 flex items-end gap-2 p-3 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-100 transition">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder={t('chatPlaceholder', lang)}
            className={`flex-1 resize-none text-sm text-gray-800 placeholder-gray-400 border-none outline-none bg-transparent ${lang === 'te' ? 'telugu' : ''}`}
          />
          <button onClick={() => sendMessage()} disabled={!input.trim() || sending}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white rounded-lg p-2 transition flex-shrink-0">
            <Send size={16} />
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">
          {lang === 'te' ? 'AI పథక డేటా ఆధారంగా సమాధానాలు ఇస్తుంది' : 'Answers grounded in scheme data only'}
        </p>
      </div>
    </div>
  );
}
