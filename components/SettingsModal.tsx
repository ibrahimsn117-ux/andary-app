
import React from 'react';
import { X, Key, CreditCard, ShieldCheck } from 'lucide-react';
import { Language, AppTranslation } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  t: AppTranslation;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, lang, t }) => {
  if (!isOpen) return null;

  const handleUpdateKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
        <header className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">{t.settings}</h2>
          <button onClick={onClose} className="p-3 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors">
            <X size={24} />
          </button>
        </header>

        <div className="p-8 space-y-8">
          <section className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Key size={14} />
              {t.selectKey}
            </h3>
            <div className="bg-blue-50 border border-blue-100 p-6 rounded-3xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl">
                  <ShieldCheck className="text-white" size={24} />
                </div>
                <div>
                  <p className="font-black text-blue-900">{t.apiKeyStatus}</p>
                  <p className="text-xs text-blue-700 font-bold opacity-75 italic">Personal AI Instance</p>
                </div>
              </div>
              <button 
                onClick={handleUpdateKey}
                className="bg-white text-blue-600 border border-blue-200 px-6 py-2.5 rounded-2xl text-sm font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                {t.updateKey}
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <CreditCard size={14} />
              {t.billingInfo}
            </h3>
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              className="block bg-slate-50 border border-slate-100 p-6 rounded-3xl hover:border-blue-500 transition-colors group"
            >
              <p className="font-black text-slate-900 mb-1 group-hover:text-blue-600">إدارة تفاصيل الدفع</p>
              <p className="text-xs text-slate-500 font-medium">اضغط هنا للانتقال إلى لوحة تحكم Google Cloud وإدارة الفوترة لمشروعك.</p>
            </a>
          </section>

          <div className="bg-green-50 border border-green-100 p-6 rounded-3xl">
            <p className="text-xs text-green-800 leading-relaxed font-medium">
              تطبيق <strong>انداري</strong> يستخدم نماذج Gemini 3 و Veo 3.1 الأكثر تطوراً لضمان أفضل تجربة تعليمية. تأكد من أن مشروعك في وضع الدفع لضمان عمل كافة الميزات.
            </p>
          </div>
        </div>

        <footer className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-slate-900 text-white px-10 py-4 rounded-[1.5rem] font-black hover:bg-black transition-all shadow-lg"
          >
            حفظ وإغلاق
          </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;
