'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getChatbot, deleteChatbot, createApiKey, getApiKeys, updateChatbotSettings, updateNotificationSettings, getChatbotInsights, Chatbot, ApiKey, ChatbotInsights, getChatbotIntegrations, connectGoogleCalendar, getGoogleCalendarStatus, updateGoogleCalendarSettings, disconnectGoogleCalendar, GoogleCalendarStatus, IntegrationsStatus } from '@/lib/api';
import styles from '../../dashboard.module.css';

// Icons as simple SVG components
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);

const ChevronIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const CodeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);

const KeyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

const BrainIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54"/>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54"/>
  </svg>
);

const MessageIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const DatabaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
);

const LayoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
  </svg>
);

const LinkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const SearchEmptyIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);

// Section configuration with search keywords
const SECTIONS = [
  { id: 'preview', title: 'Chat Preview', description: 'Test your chatbot live', icon: PlayIcon, keywords: ['preview', 'test', 'chat', 'try', 'demo', 'live'] },
  { id: 'insights', title: 'Insights', description: 'Anonymized chat trends', icon: MessageIcon, keywords: ['insights', 'trends', 'messages', 'monitor', 'feedback', 'history', 'chat', 'services', 'pricing', 'location'] },
  { id: 'embed', title: 'Embed Code', description: 'Add chatbot to your website', icon: CodeIcon, keywords: ['embed', 'code', 'script', 'website', 'install', 'widget'] },
  { id: 'apikeys', title: 'API Keys', description: 'Manage access keys', icon: KeyIcon, keywords: ['api', 'key', 'keys', 'access', 'token', 'authentication'] },
  { id: 'ai', title: 'AI Settings', description: 'Configure AI behavior', icon: BrainIcon, keywords: ['ai', 'prompt', 'system', 'welcome', 'message', 'knowledge', 'behavior'] },
  { id: 'communication', title: 'Communication Style', description: 'Tone and language settings', icon: MessageIcon, keywords: ['communication', 'style', 'tone', 'language', 'greeting', 'professional', 'friendly'] },
  { id: 'pages', title: 'Page Restrictions', description: 'Control where widget appears', icon: LayoutIcon, keywords: ['page', 'pages', 'restriction', 'display', 'show', 'hide', 'url', 'path', 'exclude', 'include'] },
  { id: 'booking', title: 'Booking & Appointments', description: 'Customer booking settings', icon: CalendarIcon, keywords: ['booking', 'appointment', 'schedule', 'calendar', 'reservation', 'date', 'time'] },
  { id: 'integrations', title: 'Integrations', description: 'Connect Google Calendar and more', icon: LinkIcon, keywords: ['integration', 'integrations', 'google', 'calendar', 'connect', 'sync', 'oauth'] },
  { id: 'notifications', title: 'Notifications', description: 'Email and webhook alerts', icon: BellIcon, keywords: ['notification', 'email', 'webhook', 'alert', 'notify'] },
  { id: 'knowledge', title: 'Knowledge Base', description: 'Business information', icon: DatabaseIcon, keywords: ['knowledge', 'base', 'data', 'business', 'clinic', 'services', 'hours', 'address', 'phone'] },
];

export default function ChatbotDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatbotId = params.id as string;

  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Insights state
  const [insights, setInsights] = useState<ChatbotInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // Search and section state
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(['embed']));
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);

  // Handle section navigation from URL params or assistant
  const navigateToSection = useCallback((sectionId: string, highlight: boolean = false) => {
    // Open the section
    setOpenSections(prev => {
      const next = new Set(prev);
      next.add(sectionId);
      return next;
    });
    // Scroll to the section after a small delay
    setTimeout(() => {
      const element = document.getElementById(`section-${sectionId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Apply highlight effect if requested
      if (highlight) {
        setHighlightedSection(sectionId);
        // Remove highlight after animation
        setTimeout(() => setHighlightedSection(null), 2500);
      }
    }, 100);
  }, []);

  // Check URL for section param and integrations callback
  useEffect(() => {
    const section = searchParams.get('section');
    const tab = searchParams.get('tab');
    const shouldHighlight = searchParams.get('highlight') === 'true';
    const successParam = searchParams.get('success');
    const errorParam = searchParams.get('error');

    // Handle integrations OAuth callback
    if (successParam === 'google_calendar_connected') {
      setIntegrationsSuccess('Google Calendar connected successfully!');
      navigateToSection('integrations', true);
      loadIntegrations();
      router.replace(`/dashboard/chatbots/${chatbotId}`, { scroll: false });
    } else if (errorParam) {
      setIntegrationsError(`Connection failed: ${errorParam}`);
      navigateToSection('integrations', true);
      router.replace(`/dashboard/chatbots/${chatbotId}`, { scroll: false });
    } else if (tab === 'integrations') {
      navigateToSection('integrations', shouldHighlight);
      router.replace(`/dashboard/chatbots/${chatbotId}`, { scroll: false });
    } else if (section && SECTIONS.some(s => s.id === section)) {
      navigateToSection(section, shouldHighlight);
      router.replace(`/dashboard/chatbots/${chatbotId}`, { scroll: false });
    }
  }, [searchParams, chatbotId, router, navigateToSection]);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDomains, setNewKeyDomains] = useState('');
  const [creatingKey, setCreatingKey] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI Settings state
  const [systemPrompt, setSystemPrompt] = useState('');
  const [customKnowledge, setCustomKnowledge] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Editable clinic data state
  const [editClinicName, setEditClinicName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editOpeningHours, setEditOpeningHours] = useState('');
  const [editServices, setEditServices] = useState('');
  const [savingClinicData, setSavingClinicData] = useState(false);
  const [clinicDataSuccess, setClinicDataSuccess] = useState(false);

  // Notification & Communication settings state
  const [notificationEmail, setNotificationEmail] = useState('');
  const [notificationWebhook, setNotificationWebhook] = useState('');
  const [notifyOnBooking, setNotifyOnBooking] = useState(true);
  const [bookingEnabled, setBookingEnabled] = useState(true);
  const [bookingFields, setBookingFields] = useState<string[]>(['name', 'email', 'phone', 'service', 'preferredDate', 'notes']);
  const [bookingPromptMessage, setBookingPromptMessage] = useState('');
  const [pageDisplayMode, setPageDisplayMode] = useState<'ALL' | 'INCLUDE' | 'EXCLUDE'>('ALL');
  const [allowedPages, setAllowedPages] = useState<string[]>([]);
  const [communicationStyle, setCommunicationStyle] = useState<'PROFESSIONAL' | 'FRIENDLY' | 'CASUAL' | 'CONCISE'>('PROFESSIONAL');
  const [language, setLanguage] = useState('auto');
  const [customGreeting, setCustomGreeting] = useState('');
  const [savingCommunication, setSavingCommunication] = useState(false);
  const [communicationSuccess, setCommunicationSuccess] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [notificationsSuccess, setNotificationsSuccess] = useState(false);

  // Available booking fields with labels
  const availableBookingFields = [
    { id: 'name', label: 'Customer Name', required: true },
    { id: 'email', label: 'Email Address', required: false },
    { id: 'phone', label: 'Phone Number', required: false },
    { id: 'service', label: 'Service/Product', required: false },
    { id: 'preferredDate', label: 'Preferred Date', required: false },
    { id: 'preferredTime', label: 'Preferred Time', required: false },
    { id: 'notes', label: 'Additional Notes', required: false },
  ];

  // Filter sections based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return SECTIONS;
    const query = searchQuery.toLowerCase();
    return SECTIONS.filter(section =>
      section.title.toLowerCase().includes(query) ||
      section.description.toLowerCase().includes(query) ||
      section.keywords.some(kw => kw.includes(query))
    );
  }, [searchQuery]);

  const hasInsights =
    insights &&
    (insights.totalMessages > 0 ||
      insights.pricingQuestions > 0 ||
      insights.locationQuestions > 0 ||
      insights.bookingCount > 0 ||
      insights.topServices.length > 0 ||
      insights.notProvidedServices.length > 0 ||
      insights.couldntFindServices.length > 0);

  // Auto-open sections when searching
  useEffect(() => {
    if (searchQuery.trim()) {
      setOpenSections(new Set(filteredSections.map(s => s.id)));
    }
  }, [searchQuery, filteredSections]);

  const toggleSection = (id: string) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const loadInsights = useCallback(async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const data = await getChatbotInsights(chatbotId, 30);
      setInsights(data);
    } catch (err) {
      setInsightsError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setInsightsLoading(false);
    }
  }, [chatbotId]);

  useEffect(() => {
    loadData();
  }, [chatbotId]);



  async function loadIntegrations() {
    try {
      const [integrations, googleCal] = await Promise.all([
        getChatbotIntegrations(chatbotId),
        getGoogleCalendarStatus(chatbotId).catch(() => ({ connected: false, configured: false }))
      ]);
      setIntegrationsStatus(integrations);
      setGoogleStatus(googleCal);
    } catch (err) {
      console.error('Failed to load integrations:', err);
    }
  }

  async function handleConnectGoogle() {
    setConnectingGoogle(true);
    setIntegrationsError(null);
    try {
      const { authUrl } = await connectGoogleCalendar(chatbotId);
      window.location.href = authUrl;
    } catch (err) {
      setIntegrationsError(err instanceof Error ? err.message : 'Failed to start connection');
      setConnectingGoogle(false);
    }
  }

  async function handleDisconnectGoogle() {
    if (!confirm('Are you sure you want to disconnect Google Calendar?')) return;

    setDisconnectingGoogle(true);
    setIntegrationsError(null);
    try {
      await disconnectGoogleCalendar(chatbotId);
      setGoogleStatus({ connected: false, configured: true });
      setIntegrationsSuccess('Google Calendar disconnected');
      await loadIntegrations();
    } catch (err) {
      setIntegrationsError(err instanceof Error ? err.message : 'Failed to disconnect');
    } finally {
      setDisconnectingGoogle(false);
    }
  }

  async function handleCalendarChange(calendarId: string) {
    try {
      await updateGoogleCalendarSettings(chatbotId, calendarId);
      setGoogleStatus(prev => prev ? { ...prev, calendarId } : null);
      setIntegrationsSuccess('Calendar updated');
      setTimeout(() => setIntegrationsSuccess(null), 3000);
    } catch (err) {
      setIntegrationsError(err instanceof Error ? err.message : 'Failed to update calendar');
    }
  }

  async function loadData() {
    try {
      setInsights(null);
      setInsightsError(null);

      const [chatbotData, keysData] = await Promise.all([
        getChatbot(chatbotId),
        getApiKeys()
      ]);
      setChatbot(chatbotData);
      setApiKeys(keysData.filter(k => k.chatbotId === chatbotId || k.chatbotId === null));

      // Load integrations
      loadIntegrations();

      // Initialize AI settings
      setSystemPrompt(chatbotData.systemPrompt || '');
      setCustomKnowledge(chatbotData.customKnowledge || '');
      setWelcomeMessage(chatbotData.welcomeMessage || '');

      // Initialize editable clinic data
      const cd = chatbotData.clinicData;
      setEditClinicName(cd.clinic_name || '');
      setEditPhone(cd.phone || '');
      setEditEmail(cd.email || '');
      setEditAddress(cd.address || '');
      setEditOpeningHours(cd.opening_hours || '');
      setEditServices((cd.services || []).map((s: { name: string; price: string }) => `${s.name}: ${s.price}`).join('\n'));

      // Initialize notification & communication settings
      setNotificationEmail(chatbotData.notificationEmail || '');
      setNotificationWebhook(chatbotData.notificationWebhook || '');
      setNotifyOnBooking(chatbotData.notifyOnBooking ?? true);
      setBookingEnabled(chatbotData.bookingEnabled ?? true);
      setBookingFields(chatbotData.bookingFields || ['name', 'email', 'phone', 'service', 'preferredDate', 'notes']);
      setBookingPromptMessage(chatbotData.bookingPromptMessage || '');
      setPageDisplayMode(chatbotData.pageDisplayMode || 'ALL');
      setAllowedPages(chatbotData.allowedPages || []);
      setCommunicationStyle(chatbotData.communicationStyle || 'PROFESSIONAL');
      setLanguage(chatbotData.language || 'auto');
      setCustomGreeting(chatbotData.customGreeting || '');

      await loadInsights();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chatbot');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteChatbot(chatbotId);
      router.push('/dashboard/chatbots');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chatbot');
      setDeleting(false);
    }
  }

  async function handleCreateApiKey(e: React.FormEvent) {
    e.preventDefault();
    setCreatingKey(true);

    try {
      const domains = newKeyDomains
        .split(',')
        .map(d => d.trim())
        .filter(d => d.length > 0);

      const result = await createApiKey({
        name: newKeyName || 'API Key',
        chatbotId,
        allowedDomains: domains
      });

      setNewlyCreatedKey(result.key);
      setApiKeys([...apiKeys, result]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create API key');
    } finally {
      setCreatingKey(false);
    }
  }

  function generateEmbedCode(apiKey: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    return `<script
  src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed.js"
  data-chatbot-id="${chatbotId}"
  data-api-key="${apiKey}"
  data-api-url="${apiUrl}"
  defer
></script>`;
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSaveAISettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      await updateChatbotSettings(chatbotId, {
        systemPrompt: systemPrompt || null,
        customKnowledge: customKnowledge || null,
        welcomeMessage: welcomeMessage || null
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleSaveCommunication(e: React.FormEvent) {
    e.preventDefault();
    setSavingCommunication(true);
    setCommunicationSuccess(false);

    try {
      await updateNotificationSettings(chatbotId, {
        communicationStyle,
        language,
        customGreeting: customGreeting || null
      });
      setCommunicationSuccess(true);
      setTimeout(() => setCommunicationSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save communication settings');
    } finally {
      setSavingCommunication(false);
    }
  }

  async function handleSaveBooking(e: React.FormEvent) {
    e.preventDefault();
    setSavingBooking(true);
    setBookingSuccess(false);

    try {
      await updateNotificationSettings(chatbotId, {
        bookingEnabled,
        bookingFields,
        bookingPromptMessage: bookingPromptMessage || null
      });
      setBookingSuccess(true);
      setTimeout(() => setBookingSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save booking settings');
    } finally {
      setSavingBooking(false);
    }
  }

  const [savingPages, setSavingPages] = useState(false);
  const [pagesSuccess, setPagesSuccess] = useState(false);

  // Integrations state
  const [integrationsStatus, setIntegrationsStatus] = useState<IntegrationsStatus | null>(null);
  const [googleStatus, setGoogleStatus] = useState<GoogleCalendarStatus | null>(null);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [disconnectingGoogle, setDisconnectingGoogle] = useState(false);
  const [integrationsError, setIntegrationsError] = useState<string | null>(null);
  const [integrationsSuccess, setIntegrationsSuccess] = useState<string | null>(null);

  // Chat preview state
  const [previewMessages, setPreviewMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [previewInput, setPreviewInput] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewSessionId] = useState(() => 'preview_' + Math.random().toString(36).substring(2) + Date.now().toString(36));

  async function handleSavePages(e: React.FormEvent) {
    e.preventDefault();
    setSavingPages(true);
    setPagesSuccess(false);

    try {
      await updateNotificationSettings(chatbotId, {
        pageDisplayMode,
        allowedPages
      });
      setPagesSuccess(true);
      setTimeout(() => setPagesSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save page restrictions');
    } finally {
      setSavingPages(false);
    }
  }

  async function handleSaveNotifications(e: React.FormEvent) {
    e.preventDefault();
    setSavingNotifications(true);
    setNotificationsSuccess(false);

    try {
      await updateNotificationSettings(chatbotId, {
        notificationEmail: notificationEmail || null,
        notificationWebhook: notificationWebhook || null,
        notifyOnBooking
      });
      setNotificationsSuccess(true);
      setTimeout(() => setNotificationsSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save notification settings');
    } finally {
      setSavingNotifications(false);
    }
  }

  async function handleSaveClinicData(e: React.FormEvent) {
    e.preventDefault();
    setSavingClinicData(true);
    setClinicDataSuccess(false);

    try {
      const servicesArray = editServices
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
          const colonIndex = line.indexOf(':');
          if (colonIndex > -1) {
            return {
              name: line.substring(0, colonIndex).trim(),
              price: line.substring(colonIndex + 1).trim()
            };
          }
          return { name: line.trim(), price: '' };
        });

      await updateChatbotSettings(chatbotId, {
        clinicData: {
          clinic_name: editClinicName,
          phone: editPhone,
          email: editEmail,
          address: editAddress,
          opening_hours: editOpeningHours,
          services: servicesArray
        }
      });
      setClinicDataSuccess(true);
      setTimeout(() => setClinicDataSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save knowledge base');
    } finally {
      setSavingClinicData(false);
    }
  }

  // Chat preview functions
  async function handlePreviewSend(e?: React.FormEvent) {
    e?.preventDefault();
    if (!previewInput.trim() || previewLoading) return;

    const userMessage = previewInput.trim();
    setPreviewInput('');
    setPreviewMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setPreviewLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/chatbots/${chatbotId}/preview/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          sessionId: previewSessionId,
          conversationHistory: previewMessages.slice(-10),
          message: userMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              assistantText += data.content;
              // Update message in real-time
              setPreviewMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg?.role === 'assistant') {
                  lastMsg.content = assistantText;
                } else {
                  newMessages.push({ role: 'assistant', content: assistantText });
                }
                return newMessages;
              });
            }
          } catch {
            // Ignore parse errors
          }
        }
      }

      if (assistantText && previewMessages[previewMessages.length - 1]?.role !== 'assistant') {
        setPreviewMessages(prev => [...prev, { role: 'assistant', content: assistantText }]);
      }
    } catch (err) {
      setPreviewMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }]);
      console.error('Preview chat error:', err);
    } finally {
      setPreviewLoading(false);
    }
  }

  function clearPreviewChat() {
    setPreviewMessages([]);
    setPreviewInput('');
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading chatbot...</p>
      </div>
    );
  }

  if (error || !chatbot) {
    return (
      <div className={styles.emptyState}>
        <p>{error || 'Chatbot not found'}</p>
        <Link href="/dashboard/chatbots" className={styles.primaryBtn}>
          Back to Chatbots
        </Link>
      </div>
    );
  }

  const clinicData = chatbot.clinicData;

  const renderSectionContent = (sectionId: string) => {
    switch (sectionId) {
      case 'preview':
        return (
          <div className={styles.sectionContentInner}>
            <div className={styles.chatPreviewContainer}>
              {chatbot.status !== 'ACTIVE' ? (
                <div className={styles.chatPreviewEmpty}>
                  <p>Chatbot must be active to test. Current status: {chatbot.status}</p>
                </div>
              ) : (
                <>
                  <div className={styles.chatPreviewMessages}>
                    {previewMessages.length === 0 ? (
                      <div className={styles.chatPreviewWelcome}>
                        <div className={styles.chatPreviewWelcomeIcon}>
                          <MessageIcon />
                        </div>
                        <h4>Test Your Chatbot</h4>
                        <p>Send a message to see how your chatbot responds to customers</p>
                        <div className={styles.chatPreviewSuggestions}>
                          <button onClick={() => { setPreviewInput('What services do you offer?'); }}>
                            What services do you offer?
                          </button>
                          <button onClick={() => { setPreviewInput('What are your opening hours?'); }}>
                            What are your opening hours?
                          </button>
                          <button onClick={() => { setPreviewInput('I want to book an appointment'); }}>
                            I want to book an appointment
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {previewMessages.map((msg, i) => (
                          <div key={i} className={`${styles.chatPreviewMsg} ${styles[msg.role]}`}>
                            {msg.content}
                          </div>
                        ))}
                        {previewLoading && (
                          <div className={`${styles.chatPreviewMsg} ${styles.assistant}`}>
                            <span className={styles.typingDots}>
                              <span></span><span></span><span></span>
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <form onSubmit={handlePreviewSend} className={styles.chatPreviewInputBar}>
                    <input
                      type="text"
                      value={previewInput}
                      onChange={(e) => setPreviewInput(e.target.value)}
                      placeholder="Type a message..."
                      disabled={previewLoading}
                    />
                    <button type="submit" disabled={previewLoading || !previewInput.trim()}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                      </svg>
                    </button>
                  </form>
                  {previewMessages.length > 0 && (
                    <div className={styles.chatPreviewActions}>
                      <button onClick={clearPreviewChat} className={styles.secondaryBtn}>
                        Clear Chat
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );

      case 'insights':
        return (
          <div className={styles.sectionContentInner}>
            <div className={styles.insightsHeader}>
              <div>
                <h4>Last {insights?.rangeDays || 30} days</h4>
                <p>Only anonymized trends are shown. Raw messages are not exposed.</p>
              </div>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={loadInsights}
                disabled={insightsLoading}
              >
                {insightsLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {insightsError && (
              <div className={styles.insightsEmpty}>
                <p>{insightsError}</p>
                <button type="button" className={styles.secondaryBtn} onClick={loadInsights}>
                  Retry
                </button>
              </div>
            )}

            {!insightsError && (!insights || !hasInsights) && !insightsLoading && (
              <div className={styles.insightsEmpty}>
                <p>No insights yet.</p>
                <span>Once visitors start chatting, trends will appear here.</span>
              </div>
            )}

            {insights && (
              <div className={styles.insightsGrid}>
                <div className={styles.insightsCard}>
                  <span>Total user messages</span>
                  <strong>{insights.totalMessages}</strong>
                </div>
                <div className={styles.insightsCard}>
                  <span>Pricing questions</span>
                  <strong>{insights.pricingQuestions}</strong>
                </div>
                <div className={styles.insightsCard}>
                  <span>Location questions</span>
                  <strong>{insights.locationQuestions}</strong>
                </div>
                <div className={styles.insightsCard}>
                  <span>Bookings created</span>
                  <strong>{insights.bookingCount}</strong>
                </div>
              </div>
            )}

            {insights && (
              <div className={styles.insightsLists}>
                <div className={styles.insightsList}>
                  <h5>Most asked services</h5>
                  {insights.topServices.length === 0 ? (
                    <p>No service mentions yet.</p>
                  ) : (
                    <ul>
                      {insights.topServices.map((item) => (
                        <li key={item.service}>
                          <span>{item.service}</span>
                          <strong>{item.count}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className={styles.insightsList}>
                  <h5>Services people asked for (not offered)</h5>
                  {insights.notProvidedServices.length === 0 ? (
                    <p>No off-menu requests yet.</p>
                  ) : (
                    <ul>
                      {insights.notProvidedServices.map((item) => (
                        <li key={item.service}>
                          <span>{item.service}</span>
                          <strong>{item.count}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className={styles.insightsList}>
                  <h5>Couldn’t find on the website</h5>
                  {insights.couldntFindServices.length === 0 ? (
                    <p>No “can’t find” signals yet.</p>
                  ) : (
                    <ul>
                      {insights.couldntFindServices.map((item) => (
                        <li key={item.service}>
                          <span>{item.service}</span>
                          <strong>{item.count}</strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 'embed':
        return (
          <div className={styles.sectionContentInner}>
            {apiKeys.length === 0 ? (
              <div style={{ padding: '1rem 0' }}>
                <p style={{ color: '#64748b', marginBottom: '1rem' }}>
                  Create an API key to get your embed code.
                </p>
                <button onClick={() => setShowApiKeyModal(true)} className={styles.primaryBtn}>
                  Create API Key
                </button>
              </div>
            ) : (
              <div style={{ paddingTop: '1rem' }}>
                <p style={{ color: '#64748b', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  Add this code to your website to embed the chatbot widget.
                </p>
                <div className={styles.snippetCode}>
                  {generateEmbedCode(apiKeys[0].keyPrefix.replace('...', '••••••••'))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button
                    onClick={() => copyToClipboard(generateEmbedCode('YOUR_API_KEY'))}
                    className={styles.secondaryBtn}
                  >
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                  <button onClick={() => setShowApiKeyModal(true)} className={styles.secondaryBtn}>
                    Create New API Key
                  </button>
                </div>
              </div>
            )}
          </div>
        );

      case 'apikeys':
        return (
          <div className={styles.sectionContentInner}>
            {apiKeys.length > 0 ? (
              <div style={{ paddingTop: '1rem' }}>
                <div className={styles.table}>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Key</th>
                        <th>Allowed Domains</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.map((key) => (
                        <tr key={key.id}>
                          <td>{key.name}</td>
                          <td><code className={styles.keyPrefix}>{key.keyPrefix}</code></td>
                          <td>
                            <div className={styles.domainsList}>
                              {key.allowedDomains.length === 0 ? (
                                <span style={{ color: '#94a3b8' }}>All domains</span>
                              ) : (
                                key.allowedDomains.map((d, i) => (
                                  <span key={i} className={styles.domainTag}>{d}</span>
                                ))
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`${styles.cardBadge} ${key.isActive ? styles.active : styles.paused}`}>
                              {key.isActive ? 'Active' : 'Revoked'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className={styles.saveButtonContainer}>
                  <button onClick={() => setShowApiKeyModal(true)} className={styles.primaryBtn}>
                    Create New API Key
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '1rem 0', textAlign: 'center', color: '#64748b' }}>
                <p>No API keys yet.</p>
                <button onClick={() => setShowApiKeyModal(true)} className={styles.primaryBtn} style={{ marginTop: '1rem' }}>
                  Create First API Key
                </button>
              </div>
            )}
          </div>
        );

      case 'ai':
        return (
          <div className={styles.sectionContentInner}>
            <form onSubmit={handleSaveAISettings}>
              <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                <label htmlFor="welcomeMessage">Welcome Message</label>
                <input
                  type="text"
                  id="welcomeMessage"
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Welcome! How can I help you today?"
                />
                <small>The first message shown to users when they open the chat.</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="systemPrompt">Custom System Prompt (Advanced)</label>
                <textarea
                  id="systemPrompt"
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="Override the default AI behavior. Leave empty to use the default prompt."
                  rows={5}
                  style={{ fontFamily: 'inherit', resize: 'vertical' }}
                />
                <small>Customize how the AI responds. This replaces the default system prompt.</small>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="customKnowledge">Additional Knowledge Base</label>
                <textarea
                  id="customKnowledge"
                  value={customKnowledge}
                  onChange={(e) => setCustomKnowledge(e.target.value)}
                  placeholder="Add information not captured by the scraper: promotions, FAQs, policies..."
                  rows={6}
                  style={{ fontFamily: 'inherit', resize: 'vertical' }}
                />
                <small>Extra information the chatbot should know, supplementing scraped data.</small>
              </div>

              <div className={styles.saveButtonContainer}>
                <button type="submit" className={styles.primaryBtn} disabled={savingSettings}>
                  {savingSettings ? 'Saving...' : 'Save AI Settings'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'communication':
        return (
          <div className={styles.sectionContentInner}>
            <form onSubmit={handleSaveCommunication}>
              <div className={styles.formGrid} style={{ marginTop: '1rem' }}>
                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                  <label htmlFor="communicationStyle">Tone</label>
                  <select
                    id="communicationStyle"
                    value={communicationStyle}
                    onChange={(e) => setCommunicationStyle(e.target.value as typeof communicationStyle)}
                  >
                    <option value="PROFESSIONAL">Professional - Formal, business-like</option>
                    <option value="FRIENDLY">Friendly - Warm, conversational</option>
                    <option value="CASUAL">Casual - Relaxed, informal</option>
                    <option value="CONCISE">Concise - Brief, to-the-point</option>
                  </select>
                </div>
                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                  <label htmlFor="language">Response Language</label>
                  <select
                    id="language"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="auto">Auto-detect (match user)</option>
                    <option value="sk">Slovak</option>
                    <option value="cs">Czech</option>
                    <option value="en">English</option>
                    <option value="de">German</option>
                    <option value="hu">Hungarian</option>
                    <option value="pl">Polish</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                <label htmlFor="customGreeting">Custom Greeting (optional)</label>
                <input
                  type="text"
                  id="customGreeting"
                  value={customGreeting}
                  onChange={(e) => setCustomGreeting(e.target.value)}
                  placeholder="e.g., Ahoj! Ako ti mozem pomoct?"
                />
                <small>Custom greeting the AI will use when starting conversations.</small>
              </div>

              <div className={styles.saveButtonContainer}>
                <button type="submit" className={styles.primaryBtn} disabled={savingCommunication}>
                  {savingCommunication ? 'Saving...' : 'Save Communication Settings'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'booking':
        return (
          <div className={styles.sectionContentInner}>
            <form onSubmit={handleSaveBooking}>
              <label
                className={`${styles.checkboxField} ${bookingEnabled ? styles.checked : ''}`}
                style={{ marginTop: '1rem' }}
              >
                <input
                  type="checkbox"
                  checked={bookingEnabled}
                  onChange={(e) => setBookingEnabled(e.target.checked)}
                />
                <div className={styles.checkboxContent}>
                  <span className={styles.checkboxLabel}>Enable booking requests</span>
                  <p className={styles.checkboxDescription}>
                    Allow customers to request appointments through the chatbot
                  </p>
                </div>
              </label>

              {bookingEnabled && (
                <div className={styles.formSection}>
                  <div className={styles.formSectionTitle}>Information to Collect</div>
                  <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
                    Select which information the chatbot should ask for when booking
                  </p>
                  <div className={styles.bookingFieldsGrid}>
                    {availableBookingFields.map((field) => (
                      <label
                        key={field.id}
                        className={`${styles.bookingFieldItem} ${bookingFields.includes(field.id) ? styles.selected : ''} ${field.required ? styles.disabled : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={bookingFields.includes(field.id)}
                          disabled={field.required}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBookingFields([...bookingFields, field.id]);
                            } else {
                              setBookingFields(bookingFields.filter(f => f !== field.id));
                            }
                          }}
                        />
                        <span>{field.label}</span>
                        {field.required && <span className={styles.requiredTag}>Required</span>}
                      </label>
                    ))}
                  </div>

                  <div className={styles.formGroup} style={{ marginTop: '1rem', marginBottom: 0 }}>
                    <label htmlFor="bookingPromptMessage">Booking Prompt Message</label>
                    <textarea
                      id="bookingPromptMessage"
                      value={bookingPromptMessage}
                      onChange={(e) => setBookingPromptMessage(e.target.value)}
                      placeholder="e.g., To book an appointment, I'll need a few details from you..."
                      rows={2}
                      style={{ fontFamily: 'inherit', resize: 'vertical' }}
                    />
                    <small>The message the chatbot uses when asking for booking information.</small>
                  </div>
                </div>
              )}

              <div className={styles.saveButtonContainer}>
                <button type="submit" className={styles.primaryBtn} disabled={savingBooking}>
                  {savingBooking ? 'Saving...' : 'Save Booking Settings'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'pages':
        return (
          <div className={styles.sectionContentInner}>
            <form onSubmit={handleSavePages}>
              <div className={styles.formGroup}>
                <label htmlFor="pageDisplayMode">Display Mode</label>
                <select
                  id="pageDisplayMode"
                  value={pageDisplayMode}
                  onChange={(e) => setPageDisplayMode(e.target.value as 'ALL' | 'INCLUDE' | 'EXCLUDE')}
                >
                  <option value="ALL">Show on all pages</option>
                  <option value="INCLUDE">Only show on specific pages</option>
                  <option value="EXCLUDE">Hide on specific pages</option>
                </select>
                <small>Control which pages display the chatbot widget</small>
              </div>

              {pageDisplayMode !== 'ALL' && (
                <div className={styles.formGroup}>
                  <label htmlFor="allowedPages">
                    {pageDisplayMode === 'INCLUDE' ? 'Pages to show widget' : 'Pages to hide widget'}
                  </label>
                  <textarea
                    id="allowedPages"
                    value={allowedPages.join('\n')}
                    onChange={(e) => setAllowedPages(e.target.value.split('\n').map(p => p.trim()).filter(Boolean))}
                    placeholder={`/contact\n/pricing/*\n/about`}
                    rows={4}
                    style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
                  />
                  <small>One URL pattern per line. Use * as wildcard (e.g., /blog/* matches /blog/post-1)</small>
                </div>
              )}

              <div className={styles.saveButtonContainer}>
                <button type="submit" className={styles.primaryBtn} disabled={savingPages}>
                  {savingPages ? 'Saving...' : 'Save Page Restrictions'}
                </button>
                {pagesSuccess && <span className={styles.successMessage}><CheckIcon /> Saved</span>}
              </div>
            </form>
          </div>
        );

      case 'integrations':
        return (
          <div className={styles.sectionContentInner}>
            <div style={{ paddingTop: '1rem' }}>
              {integrationsError && (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'hsl(0 84% 95%)',
                  color: 'hsl(0 72% 45%)',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  {integrationsError}
                  <button
                    onClick={() => setIntegrationsError(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                  >
                    Dismiss
                  </button>
                </div>
              )}
              {integrationsSuccess && (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'hsl(142 76% 95%)',
                  color: 'hsl(142 72% 30%)',
                  borderRadius: '0.5rem',
                  marginBottom: '1rem',
                  fontSize: '0.875rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  {integrationsSuccess}
                  <button
                    onClick={() => setIntegrationsSuccess(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Google Calendar Integration */}
              <div style={{
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                padding: '1.25rem',
                background: 'hsl(var(--background))'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'hsl(var(--blue-50))',
                    borderRadius: '0.75rem',
                    flexShrink: 0
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="4" width="18" height="18" rx="2" stroke="#4285F4" strokeWidth="2"/>
                      <path d="M3 10h18" stroke="#4285F4" strokeWidth="2"/>
                      <path d="M9 4v6" stroke="#4285F4" strokeWidth="2"/>
                      <path d="M15 4v6" stroke="#4285F4" strokeWidth="2"/>
                      <rect x="7" y="14" width="4" height="4" fill="#34A853"/>
                      <rect x="13" y="14" width="4" height="4" fill="#FBBC05"/>
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1rem', fontWeight: 600 }}>Google Calendar</h4>
                    <span style={{
                      display: 'inline-flex',
                      padding: '0.25rem 0.625rem',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      borderRadius: '999px',
                      background: googleStatus?.connected ? 'hsl(142 76% 92%)' : 'hsl(var(--muted))',
                      color: googleStatus?.connected ? 'hsl(142 72% 30%)' : 'hsl(var(--muted-foreground))'
                    }}>
                      {googleStatus?.connected ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                </div>

                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.875rem', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                  Automatically create calendar events when customers book appointments through this chatbot.
                </p>

                {googleStatus?.connected ? (
                  <>
                    {googleStatus.calendars && googleStatus.calendars.length > 0 && (
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                          Save bookings to:
                        </label>
                        <select
                          value={googleStatus.calendarId || ''}
                          onChange={(e) => handleCalendarChange(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '0.625rem 0.875rem',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '0.5rem',
                            background: 'hsl(var(--background))',
                            fontSize: '0.9rem'
                          }}
                        >
                          {googleStatus.calendars.map(cal => (
                            <option key={cal.id} value={cal.id}>
                              {cal.summary} {cal.primary ? '(Primary)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {googleStatus.lastSyncAt && (
                      <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', margin: '0 0 1rem 0' }}>
                        Last synced: {new Date(googleStatus.lastSyncAt).toLocaleString()}
                      </p>
                    )}

                    <button
                      onClick={handleDisconnectGoogle}
                      disabled={disconnectingGoogle}
                      style={{
                        padding: '0.625rem 1rem',
                        background: 'transparent',
                        color: 'hsl(0 72% 50%)',
                        border: '1px solid hsl(0 72% 70%)',
                        borderRadius: '0.5rem',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        cursor: disconnectingGoogle ? 'not-allowed' : 'pointer',
                        opacity: disconnectingGoogle ? 0.6 : 1
                      }}
                    >
                      {disconnectingGoogle ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleConnectGoogle}
                    disabled={connectingGoogle || !integrationsStatus?.available.GOOGLE_CALENDAR.configured}
                    className={styles.primaryBtn}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {connectingGoogle ? (
                      <>
                        <span className={styles.btnSpinner}></span>
                        Connecting...
                      </>
                    ) : !integrationsStatus?.available.GOOGLE_CALENDAR.configured ? (
                      'Google Calendar not configured'
                    ) : (
                      <>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Connect Google Calendar
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Coming Soon integrations */}
              <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.8rem', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
                More integrations coming soon:
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ padding: '0.25rem 0.75rem', background: 'hsl(var(--muted))', borderRadius: '999px', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Calendly</span>
                <span style={{ padding: '0.25rem 0.75rem', background: 'hsl(var(--muted))', borderRadius: '999px', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Cal.com</span>
                <span style={{ padding: '0.25rem 0.75rem', background: 'hsl(var(--muted))', borderRadius: '999px', fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))' }}>Custom Webhooks</span>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className={styles.sectionContentInner}>
            <form onSubmit={handleSaveNotifications}>
              <label
                className={`${styles.checkboxField} ${notifyOnBooking ? styles.checked : ''}`}
                style={{ marginTop: '1rem' }}
              >
                <input
                  type="checkbox"
                  checked={notifyOnBooking}
                  onChange={(e) => setNotifyOnBooking(e.target.checked)}
                />
                <div className={styles.checkboxContent}>
                  <span className={styles.checkboxLabel}>Notify on new bookings</span>
                  <p className={styles.checkboxDescription}>
                    Send email/webhook when a customer submits a booking request
                  </p>
                </div>
              </label>

              <div className={styles.formGrid} style={{ marginTop: '1rem' }}>
                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                  <label htmlFor="notificationEmail">Notification Email</label>
                  <input
                    type="email"
                    id="notificationEmail"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    placeholder="bookings@yourcompany.com"
                  />
                  <small>Email to receive booking notifications</small>
                </div>
                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                  <label htmlFor="notificationWebhook">Webhook URL (optional)</label>
                  <input
                    type="url"
                    id="notificationWebhook"
                    value={notificationWebhook}
                    onChange={(e) => setNotificationWebhook(e.target.value)}
                    placeholder="https://your-crm.com/webhook"
                  />
                  <small>For CRM/calendar integrations</small>
                </div>
              </div>

              <div className={styles.saveButtonContainer}>
                <button type="submit" className={styles.primaryBtn} disabled={savingNotifications}>
                  {savingNotifications ? 'Saving...' : 'Save Notification Settings'}
                </button>
              </div>
            </form>
          </div>
        );

      case 'knowledge':
        return (
          <div className={styles.sectionContentInner}>
            <form onSubmit={handleSaveClinicData}>
              <div className={styles.formGrid} style={{ marginTop: '1rem' }}>
                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                  <label htmlFor="editClinicName">Business Name</label>
                  <input
                    type="text"
                    id="editClinicName"
                    value={editClinicName}
                    onChange={(e) => setEditClinicName(e.target.value)}
                    placeholder="Business name"
                  />
                </div>
                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                  <label htmlFor="editPhone">Phone</label>
                  <input
                    type="text"
                    id="editPhone"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                  <label htmlFor="editEmail">Email</label>
                  <input
                    type="text"
                    id="editEmail"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="Email address"
                  />
                </div>
                <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                  <label htmlFor="editAddress">Address</label>
                  <input
                    type="text"
                    id="editAddress"
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Business address"
                  />
                </div>
              </div>

              <div className={styles.formGroup} style={{ marginTop: '1rem' }}>
                <label htmlFor="editOpeningHours">Opening Hours</label>
                <textarea
                  id="editOpeningHours"
                  value={editOpeningHours}
                  onChange={(e) => setEditOpeningHours(e.target.value)}
                  placeholder="Mon-Fri: 9:00-17:00&#10;Sat: 10:00-14:00&#10;Sun: Closed"
                  rows={3}
                  style={{ fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="editServices">Services & Prices</label>
                <textarea
                  id="editServices"
                  value={editServices}
                  onChange={(e) => setEditServices(e.target.value)}
                  placeholder="Service Name: Price&#10;Another Service: €50"
                  rows={8}
                  style={{ fontFamily: 'monospace', fontSize: '0.875rem', resize: 'vertical' }}
                />
                <small>One service per line. Format: &quot;Service Name: Price&quot;</small>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid hsl(var(--border))' }}>
                <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                  {(clinicData.source_pages || []).length} pages scraped from {chatbot.sourceUrl}
                </span>
                <button type="submit" className={styles.primaryBtn} disabled={savingClinicData}>
                  {savingClinicData ? 'Saving...' : 'Save Knowledge Base'}
                </button>
              </div>
            </form>
          </div>
        );

      default:
        return null;
    }
  };

  const getSuccessState = (sectionId: string) => {
    switch (sectionId) {
      case 'ai': return settingsSuccess;
      case 'communication': return communicationSuccess;
      case 'pages': return pagesSuccess;
      case 'booking': return bookingSuccess;
      case 'notifications': return notificationsSuccess;
      case 'knowledge': return clinicDataSuccess;
      default: return false;
    }
  };

  const getSectionBadge = (sectionId: string) => {
    switch (sectionId) {
      case 'insights':
        return insights?.totalMessages ? `${insights.totalMessages} msgs` : null;
      case 'apikeys': return apiKeys.length > 0 ? `${apiKeys.length} keys` : null;
      case 'pages': return pageDisplayMode !== 'ALL' ? (pageDisplayMode === 'INCLUDE' ? 'Include' : 'Exclude') : null;
      case 'booking': return bookingEnabled ? 'Enabled' : 'Disabled';
      case 'integrations': return googleStatus?.connected ? 'Connected' : null;
      case 'notifications': return notifyOnBooking ? 'Active' : null;
      default: return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <Link href="/dashboard/chatbots" style={{ color: '#64748b', fontSize: '0.875rem', textDecoration: 'none' }}>
            ← Back to Chatbots
          </Link>
          <h1 style={{ marginTop: '0.5rem' }}>{chatbot.name}</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{chatbot.sourceUrl}</p>
        </div>
        <div className={styles.actions}>
          <button onClick={() => setShowDeleteModal(true)} className={styles.dangerBtn}>
            Delete
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Status</h3>
          <p className={styles.statValue}>
            <span className={`${styles.cardBadge} ${chatbot.status === 'ACTIVE' ? styles.active : styles.paused}`}>
              {chatbot.status}
            </span>
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Conversations</h3>
          <p className={styles.statValue}>{(chatbot as Chatbot & { _count?: { conversations: number } })._count?.conversations || 0}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Created</h3>
          <p className={styles.statValue} style={{ fontSize: '1rem' }}>
            {new Date(chatbot.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Last Scraped</h3>
          <p className={styles.statValue} style={{ fontSize: '1rem' }}>
            {new Date(chatbot.lastScrapedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.settingsSearch}>
        <span className={styles.searchIcon}>
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Search settings..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Collapsible Settings Sections */}
      {filteredSections.length === 0 ? (
        <div className={styles.noResults}>
          <SearchEmptyIcon />
          <p>No settings found for &quot;{searchQuery}&quot;</p>
          <span>Try searching for something else</span>
        </div>
      ) : (
        <div className={styles.settingsContainer}>
          {filteredSections.map((section) => {
            const Icon = section.icon;
            const isOpen = openSections.has(section.id);
            const showSuccess = getSuccessState(section.id);
            const badge = getSectionBadge(section.id);

            return (
              <div 
                key={section.id} 
                id={`section-${section.id}`} 
                className={`${styles.settingsSection} ${highlightedSection === section.id ? styles.highlighted : ''}`}
              >
                <div
                  className={styles.sectionHeader}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className={styles.sectionHeaderLeft}>
                    <div className={styles.sectionIcon}>
                      <Icon />
                    </div>
                    <div className={styles.sectionTitle}>
                      <h3>{section.title}</h3>
                      <span>{section.description}</span>
                    </div>
                  </div>
                  <div className={styles.sectionHeaderRight}>
                    {showSuccess && (
                      <span className={styles.successIndicator}>
                        <CheckIcon /> Saved
                      </span>
                    )}
                    {badge && !showSuccess && (
                      <span className={styles.sectionBadge}>{badge}</span>
                    )}
                    <ChevronIcon className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
                  </div>
                </div>
                <div className={`${styles.sectionContent} ${isOpen ? styles.open : ''}`}>
                  {renderSectionContent(section.id)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Delete Chatbot</h2>
            </div>
            <div className={styles.modalBody}>
              <p>Are you <strong>absolutely sure</strong> you want to delete <strong>{chatbot.name}</strong>?</p>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                This will also deactivate all API keys associated with this chatbot.
              </p>
              <p style={{ color: '#b91c1c', fontWeight: 500, marginTop: '1rem' }}>
                This action <strong>cannot be undone</strong>. Please confirm again: <br />
                <span>
                  Delete <strong>{chatbot.name}</strong>?
                </span>
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button onClick={() => setShowDeleteModal(false)} className={styles.secondaryBtn}>
                Cancel
              </button>
              <button onClick={handleDelete} className={styles.dangerBtn} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete Chatbot'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create API Key Modal */}
      {showApiKeyModal && (
        <div className={styles.modalOverlay} onClick={() => {
          if (!newlyCreatedKey) {
            setShowApiKeyModal(false);
            setNewKeyName('');
            setNewKeyDomains('');
          }
        }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{newlyCreatedKey ? 'API Key Created' : 'Create API Key'}</h2>
            </div>

            {newlyCreatedKey ? (
              <div className={styles.modalBody}>
                <div className={styles.warning}>
                  Save this key now! It will not be shown again.
                </div>
                <div className={styles.keyDisplay}>
                  {newlyCreatedKey}
                </div>
                <button
                  onClick={() => copyToClipboard(newlyCreatedKey)}
                  className={styles.primaryBtn}
                  style={{ width: '100%' }}
                >
                  {copied ? 'Copied!' : 'Copy API Key'}
                </button>
                <button
                  onClick={() => {
                    setShowApiKeyModal(false);
                    setNewlyCreatedKey(null);
                    setNewKeyName('');
                    setNewKeyDomains('');
                  }}
                  className={styles.secondaryBtn}
                  style={{ width: '100%', marginTop: '0.5rem' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey}>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label htmlFor="keyName">Key Name</label>
                    <input
                      type="text"
                      id="keyName"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="Production Key"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="domains">Allowed Domains (optional)</label>
                    <input
                      type="text"
                      id="domains"
                      value={newKeyDomains}
                      onChange={(e) => setNewKeyDomains(e.target.value)}
                      placeholder="example.com, www.example.com"
                    />
                    <small>Comma-separated list of domains. Leave empty to allow all domains.</small>
                  </div>
                </div>
                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    onClick={() => setShowApiKeyModal(false)}
                    className={styles.secondaryBtn}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.primaryBtn} disabled={creatingKey}>
                    {creatingKey ? 'Creating...' : 'Create Key'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
