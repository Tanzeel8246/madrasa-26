import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AppSidebar } from '@/components/AppSidebar';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar />
      <main className={`flex-1 ${isRTL ? 'mr-64' : 'ml-64'} p-6`}>
        {children}
      </main>
    </div>
  );
};
