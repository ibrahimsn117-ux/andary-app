
import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Loader2, User, Bot, FileText, Image as ImageIcon, GraduationCap } from 'lucide-react';
import { Message, Language, AppTranslation } from '../types';
import { GeminiService } from '../services/geminiService';

interface ChatWindowProps {
  lang: Language;
  t: AppTranslation;
  mode: 'chat' | 'files';
  service: GeminiService;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ lang, t, mode, service }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachment, setAttachment] = useState<{data: string, type: string, name: string} | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAttachment({
          data: (reader.result as string).split(',')[1],
          type: file.type,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachment) || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      attachment: attachment?.data,
      attachmentType: attachment?.type
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      let responseText = '';
      if (attachment) {
        responseText = await service.analyzeFile(attachment.data, attachment.type, input || "Explain this in detail.", lang);
        setAttachment(null);
      } else {
        // Fix: Changed map to provide 'content' instead of 'parts' to match updated GeminiService.chat signature
        const history = messages.map(m => ({ role: m.role, content: m.content }));
        const system = mode === 'chat' 
          ? "You are Andary, an expert AI university professor. Answer with academic precision and clarity." 
          : "You are Andary, specialized in analyzing educational documents. Break down complex topics.";
        responseText = await service.chat(input, history, system);
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText || "No response generated.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "عذراً، حدث خطأ أثناء معالجة طلبك.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-2xl mx-auto">
            <div className="bg-blue-600 p-6 rounded-3xl mb-8 shadow-2xl shadow-blue-200">
              <GraduationCap className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
              {mode === 'chat' ? t.welcome : t.explainFiles}
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              {mode === 'chat' 
                ? "أنا معلمك الشخصي المدعم بالذكاء الاصطناعي. اسألني عن أي معضلة علمية أو أدبية وسأشرحها لك ببساطة."
                : "ارفع ملفاتك الدراسية وسأقوم بتفكيك محتواها وشرح كل تفصيلة فيها بأدق صورة."
              }
            </p>
          </div>
        )}
        
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] md:max-w-[70%] gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-900 border border-slate-200'}`}>
                {m.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div className={`p-5 rounded-3xl shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-100 text-slate-800'}`}>
                {m.attachment && (
                  <div className="mb-3 p-3 bg-black/5 rounded-xl flex items-center gap-3 border border-black/5">
                    {m.attachmentType?.includes('image') ? <ImageIcon size={20} className="text-blue-500" /> : <FileText size={20} className="text-blue-500" />}
                    <span className="text-xs font-bold truncate max-w-[200px] opacity-75">Document Uploaded</span>
                  </div>
                )}
                <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
                  {m.content}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 md:p-6 bg-white border-t border-slate-100 shadow-2xl">
        <div className="max-w-4xl mx-auto">
          {attachment && (
            <div className="mb-4 p-3 bg-blue-50 rounded-2xl flex items-center justify-between border border-blue-100 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-blue-600" />
                <span className="text-sm font-bold text-blue-900">{attachment.name}</span>
              </div>
              <button onClick={() => setAttachment(null)} className="w-8 h-8 rounded-full hover:bg-blue-100 flex items-center justify-center text-blue-900 transition-colors">&times;</button>
            </div>
          )}
          
          <div className="flex items-center gap-3 bg-slate-100 rounded-[2rem] p-2 pr-4 border border-slate-200 focus-within:border-blue-500 focus-within:bg-white transition-all">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <Paperclip size={22} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload}
            />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t.placeholder}
              className="flex-1 bg-transparent border-none focus:outline-none text-slate-900 px-2 py-2 text-lg"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className={`p-4 rounded-full transition-all ${
                loading ? 'text-slate-300' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={22} /> : <Send size={22} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
