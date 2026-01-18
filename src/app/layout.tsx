import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Site AI Studio',
  description: 'Turn any website into a deployable, bottom-right chatbot widget.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
