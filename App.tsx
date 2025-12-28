
import React, { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import VideoLecture from './components/VideoLecture';
import SettingsModal from './components/SettingsModal';
import { Language, AppTranslation } from './types';
import { TRANSLATIONS } from './constants';
import { GeminiService } from './services/geminiService';
import { Globe, User } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [mode, setMode] = useState<'chat' | 'files' | 'lecture'>('chat');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const t: AppTranslation = TRANSLATIONS[lang];
  const service = useMemo(() => new GeminiService(), []);

  return (
    <div className={`flex h-screen bg-slate-50 text-slate-900 ${lang === 'ar' ? 'rtl' : 'ltr'}`}>
      <Sidebar 
        currentMode={mode} 
        setMode={setMode} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        lang={lang} 
        t={t} 
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-10">
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3 bg-slate-100 px-4 py-2 rounded-2xl">
               <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
               <span className="text-xs font-black text-slate-700 uppercase tracking-widest">
                 {lang === 'ar' ? 'متصل ومستعد للتعليم' : 'Professor Online'}
               </span>
             </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-100 border border-slate-200 hover:border-blue-500 hover:bg-white transition-all text-sm font-black text-slate-700"
            >
              <Globe size={18} className="text-blue-600" />
              <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>
            <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <User size={20} />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          {mode === 'chat' && <ChatWindow lang={lang} t={t} mode="chat" service={service} />}
          {mode === 'files' && <ChatWindow lang={lang} t={t} mode="files" service={service} />}
          {mode === 'lecture' && <VideoLecture lang={lang} t={t} service={service} />}
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        lang={lang} 
        t={t} 
      />

      {/* Modern Background Accents */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[150px] pointer-events-none -z-10"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-100/50 rounded-full blur-[150px] pointer-events-none -z-10"></div>
    </div>
  );
};

export default App;
