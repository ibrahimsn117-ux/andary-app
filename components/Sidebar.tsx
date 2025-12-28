
import React from 'react';
import { MessageSquare, FileText, Video, Settings, GraduationCap } from 'lucide-react';
import { Language, AppTranslation } from '../types';

interface SidebarProps {
  currentMode: 'chat' | 'files' | 'lecture';
  setMode: (mode: 'chat' | 'files' | 'lecture') => void;
  onOpenSettings: () => void;
  lang: Language;
  t: AppTranslation;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode, onOpenSettings, lang, t }) => {
  const isAr = lang === 'ar';

  return (
    <div className={`w-20 md:w-64 bg-white h-full flex flex-col items-center py-8 border-slate-200 ${isAr ? 'border-l shadow-xl' : 'border-r shadow-xl'}`}>
      <div className="flex items-center gap-3 mb-12 px-4">
        <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-200">
          <GraduationCap className="text-white w-6 h-6 md:w-8 md:h-8" />
        </div>
        <h1 className="hidden md:block text-2xl font-black text-slate-900 tracking-tight">
          انداري
        </h1>
      </div>

      <nav className="flex-1 w-full space-y-3 px-4">
        <SidebarItem 
          active={currentMode === 'chat'} 
          onClick={() => setMode('chat')} 
          icon={<MessageSquare size={22} />} 
          label={t.askAnything} 
        />
        <SidebarItem 
          active={currentMode === 'files'} 
          onClick={() => setMode('files')} 
          icon={<FileText size={22} />} 
          label={t.explainFiles} 
        />
        <SidebarItem 
          active={currentMode === 'lecture'} 
          onClick={() => setMode('lecture')} 
          icon={<Video size={22} />} 
          label={t.videoLecture} 
        />
      </nav>

      <div className="mt-auto w-full px-4 border-t border-slate-100 pt-6">
        <SidebarItem 
          active={false} 
          onClick={onOpenSettings} 
          icon={<Settings size={22} />} 
          label={t.settings} 
        />
      </div>
    </div>
  );
};

const SidebarItem = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center md:justify-start gap-4 p-4 rounded-2xl transition-all group ${
      active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
    }`}
  >
    <span className={`${active ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>{icon}</span>
    <span className="hidden md:block font-bold text-sm tracking-wide">{label}</span>
  </button>
);

export default Sidebar;
