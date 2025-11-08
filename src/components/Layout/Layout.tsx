import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  );
};
