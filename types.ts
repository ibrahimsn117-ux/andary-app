
export type Language = 'ar' | 'en';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  attachment?: string;
  attachmentType?: string;
}

export interface AppTranslation {
  welcome: string;
  askAnything: string;
  explainFiles: string;
  videoLecture: string;
  settings: string;
  placeholder: string;
  uploadAssets: string;
  generateVideo: string;
  language: string;
  selectKey: string;
  billingInfo: string;
  universityLectureMode: string;
  processing: string;
  generatingVideo: string;
  downloadVideo: string;
  teacherName: string;
  apiKeyStatus: string;
  updateKey: string;
  maxFilesHint: string;
}

export interface Asset {
  id: string;
  data: string;
  type: string;
  name: string;
}

export interface VideoLectureState {
  status: 'idle' | 'processing' | 'generating' | 'completed' | 'error';
  videoUri?: string;
  error?: string;
  analysis?: string;
}
