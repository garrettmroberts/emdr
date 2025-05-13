import './globals.css';
import { Inter } from 'next/font/google';
import { PeerProvider } from './context/PeerContext';
import { AuthProvider } from './context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'TapiocaEMDR',
  description: 'EMDR therapy video chat client',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <PeerProvider>
            {children}
          </PeerProvider>
        </AuthProvider>
      </body>
    </html>
  );
}