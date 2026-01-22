import type { Metadata } from 'next';
import { Auth0Provider } from '@auth0/nextjs-auth0';
import './globals.css';

export const metadata: Metadata = {
  title: 'XeloChat - AI Chatbots for Any Website',
  description: 'Turn any website into a deployable, bottom-right chatbot widget.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Auth0Provider>
          {children}
        </Auth0Provider>
      </body>
      <script
        src="https://chatbotfrontend-production-6ff3.up.railway.app/embed.js"
        data-chatbot-id="cmkps7qu300010ylyjyu1k3bv"
        data-api-key="sb_live_dD-A3wNu-UDT2fzGdxF_CsE720r_sLu3"
        data-api-url="https://chatbotbackend-production-814f.up.railway.app"
        defer
      />
    </html>
  );
}
