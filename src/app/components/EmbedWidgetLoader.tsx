'use client';

import { useEffect } from 'react';

type EmbedWidgetLoaderProps = {
  enabled?: boolean;
  chatbotId: string;
  apiKey: string;
  apiUrl: string;
};

function cleanupWidget() {
  const widgetHost = document.getElementById('xelochat-widget');
  if (widgetHost) {
    widgetHost.remove();
  }
  const existingScript = document.getElementById('xelochat-embed-script');
  if (existingScript) {
    existingScript.remove();
  }
}

export default function EmbedWidgetLoader({
  enabled = true,
  chatbotId,
  apiKey,
  apiUrl,
}: EmbedWidgetLoaderProps) {
  useEffect(() => {
    const hasConfig = Boolean(chatbotId && apiKey && apiUrl);
    if (!enabled || !hasConfig) {
      cleanupWidget();
      return undefined;
    }

    cleanupWidget();

    const script = document.createElement('script');
    script.id = 'xelochat-embed-script';
    script.src = '/embed.js';
    script.async = true;
    script.setAttribute('data-chatbot-id', chatbotId);
    script.setAttribute('data-api-key', apiKey);
    script.setAttribute('data-api-url', apiUrl);
    document.body.appendChild(script);

    return () => {
      cleanupWidget();
    };
  }, [enabled, chatbotId, apiKey, apiUrl]);

  return null;
}
