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
      src="http://localhost:3000/embed.js"
      data-chatbot-id="cmkps7qu300010ylyjyu1k3bv"
      data-api-key="sb_live_gzO6BoH2IHczG7xAZlTRd2kHZ2x8ehml"
      data-api-url="http://localhost:3001"
      defer
></script>
    </html>
  );
}
