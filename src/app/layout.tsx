import './globals.css';
import { Inter } from 'next/font/google';
import { PeerProvider } from './context/PeerContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'EMDR Video Chat',
  description: 'EMDR therapy over video chat',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PeerProvider>
          {children}
        </PeerProvider>
      </body>
    </html>
  );
}
