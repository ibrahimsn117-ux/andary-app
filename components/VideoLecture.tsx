
import React, { useState, useRef } from 'react';
import { Upload, Video, Play, Download, Loader2, AlertCircle, Trash2, FileText, CheckCircle } from 'lucide-react';
import { Language, AppTranslation, VideoLectureState, Asset } from '../types';
import { GeminiService } from '../services/geminiService';

interface VideoLectureProps {
  lang: Language;
  t: AppTranslation;
  service: GeminiService;
}

const VideoLecture: React.FC<VideoLectureProps> = ({ lang, t, service }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [state, setState] = useState<VideoLectureState>({ status: 'idle' });
  const [videoBlobUrl, setVideoBlobUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (assets.length + files.length > 3) {
      alert(t.maxFilesHint);
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const newAsset: Asset = {
          id: Math.random().toString(36).substr(2, 9),
          data: (reader.result as string).split(',')[1],
          type: file.type,
          name: file.name
        };
        setAssets(prev => [...prev, newAsset]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const handleGenerate = async () => {
    if (assets.length === 0) return;

    setState({ status: 'processing' });
    try {
      const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio?.openSelectKey();
      }

      const { operation, analysis } = await service.generateVideoLecture(assets, lang);
      setState({ status: 'generating', analysis });

      let currentOp = operation;
      while (!currentOp.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        currentOp = await service.checkVideoOperation(currentOp);
      }

      if (currentOp.response?.generatedVideos?.[0]?.video?.uri) {
        const videoUri = currentOp.response.generatedVideos[0].video.uri;
        const blob = await service.fetchVideo(videoUri);
        const blobUrl = URL.createObjectURL(blob);
        setVideoBlobUrl(blobUrl);
        setState({ status: 'completed', videoUri });
      } else {
        throw new Error("فشل إنتاج الفيديو. يرجى المحاولة لاحقاً.");
      }
    } catch (error: any) {
      console.error(error);
      let errorMsg = error.message || "حدث خطأ غير متوقع.";
      if (errorMsg.includes("Requested entity was not found")) {
        await (window as any).aistudio?.openSelectKey();
      }
      setState({ status: 'error', error: errorMsg });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto p-4 md:p-8">
      <div className="max-w-4xl mx-auto w-full">
        <header className="mb-12 text-center">
          <div className="inline-block bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold mb-4">
            {t.universityLectureMode}
          </div>
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            حول ملفاتك إلى محاضرة فيديو
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            ارفع صور السبورة، صفحات الدفتر، أو حتى ملفات PDF وسأقوم بإنتاج فيديو شرح متكامل.
          </p>
        </header>

        {state.status === 'idle' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-4 border-dashed border-slate-200 rounded-[3rem] p-16 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group relative bg-white"
            >
              <div className="bg-blue-600 p-8 rounded-full mb-8 group-hover:scale-110 transition-transform shadow-2xl shadow-blue-200">
                <Upload size={48} className="text-white" />
              </div>
              <p className="text-2xl font-black text-slate-900 mb-2">{t.uploadAssets}</p>
              <p className="text-slate-400 font-medium">{t.maxFilesHint}</p>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" multiple onChange={handleFileSelect} />
            </div>

            {assets.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assets.map((asset) => (
                  <div key={asset.id} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {asset.type.includes('image') ? (
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={`data:${asset.type};base64,${asset.data}`} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FileText size={24} />
                        </div>
                      )}
                      <span className="text-sm font-bold truncate text-slate-700">{asset.name}</span>
                    </div>
                    <button onClick={() => removeAsset(asset.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {assets.length > 0 && (
              <button
                onClick={handleGenerate}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-green-200 flex items-center justify-center gap-4 transition-all"
              >
                <Video size={28} />
                {t.generateVideo}
              </button>
            )}
          </div>
        )}

        {(state.status === 'processing' || state.status === 'generating') && (
          <div className="bg-white border border-slate-200 rounded-[3rem] p-16 flex flex-col items-center text-center shadow-2xl shadow-slate-200 animate-pulse">
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20"></div>
              <Loader2 size={80} className="text-blue-600 animate-spin relative" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-6">
              {state.status === 'processing' ? t.processing : t.generatingVideo}
            </h3>
            <div className="w-full max-w-md bg-slate-100 h-3 rounded-full overflow-hidden">
              <div className="bg-green-600 h-full animate-[progress_30s_linear_infinite]" style={{ width: '40%' }}></div>
            </div>
          </div>
        )}

        {state.status === 'completed' && videoBlobUrl && (
          <div className="space-y-8 animate-in zoom-in duration-500">
            <div className="bg-black rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white aspect-video flex items-center justify-center">
              <video 
                src={videoBlobUrl} 
                controls 
                className="w-full h-full"
                autoPlay
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <a 
                href={videoBlobUrl} 
                download="andary-lecture.mp4"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-200"
              >
                <Download size={24} />
                {t.downloadVideo}
              </a>
              <button 
                onClick={() => { setState({ status: 'idle' }); setAssets([]); }}
                className="px-12 bg-slate-900 text-white hover:bg-black py-5 rounded-[2rem] font-black transition-all"
              >
                إنشاء محاضرة جديدة
              </button>
            </div>
            {state.analysis && (
              <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl">
                <h4 className="font-black text-2xl mb-8 text-slate-900 flex items-center gap-3">
                  <CheckCircle size={28} className="text-green-600" />
                  تحليل المحاضرة والنص الكامل
                </h4>
                <div className="text-slate-600 leading-loose whitespace-pre-wrap text-lg font-medium">
                  {state.analysis}
                </div>
              </div>
            )}
          </div>
        )}

        {state.status === 'error' && (
          <div className="bg-red-50 border-4 border-red-100 rounded-[3rem] p-16 text-center animate-in bounce-in">
            <AlertCircle size={80} className="text-red-500 mx-auto mb-8" />
            <h3 className="text-3xl font-black text-red-900 mb-4 tracking-tight">عذراً، حدث خطأ تقني</h3>
            <p className="text-red-700 text-lg mb-10 max-w-md mx-auto leading-relaxed">{state.error}</p>
            <button 
              onClick={() => setState({ status: 'idle' })}
              className="bg-red-600 hover:bg-red-700 text-white px-12 py-5 rounded-[2rem] font-black shadow-xl shadow-red-200"
            >
              إعادة المحاولة
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoLecture;
