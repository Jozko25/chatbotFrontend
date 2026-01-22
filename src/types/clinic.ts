export interface Service {
  name: string;
  price: string;
  description?: string;
}

export interface Doctor {
  name: string;
  specialization?: string;
}

export interface ChatTheme {
  name: string;
  tagline: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  userBubbleColor: string;
  assistantBubbleColor: string;
}

export interface ClinicData {
  clinic_name: string;
  address: string;
  opening_hours: string;
  phone: string;
  email: string;
  services: Service[];
  doctors: Doctor[];
  faq: { question: string; answer: string }[];
  source_pages: string[];
  raw_content: string;
  welcomeMessage?: string;
  theme?: ChatTheme;
  sourceUrl?: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatState {
  clinicData: ClinicData | null;
  messages: Message[];
  theme: ChatTheme;
}
