import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  School,
  ClipboardCheck,
  Wallet,
  TrendingUp,
  TrendingDown,
  FileText,
  BarChart3,
  Settings,
  Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const AppSidebar = () => {
  const { t } = useTranslation();
  const { isRTL, toggleLanguage, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { title: t('dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { title: t('students'), path: '/students', icon: Users },
    { title: t('teachers'), path: '/teachers', icon: GraduationCap },
    { title: t('classes'), path: '/classes', icon: School },
    { title: t('courses'), path: '/courses', icon: BookOpen },
    { title: t('attendance'), path: '/attendance', icon: ClipboardCheck },
    { title: t('fees'), path: '/fees', icon: Wallet },
    { title: t('income'), path: '/income', icon: TrendingUp },
    { title: t('expenses'), path: '/expenses', icon: TrendingDown },
    { title: t('financialReports'), path: '/financial-reports', icon: FileText },
    { title: t('educationReports'), path: '/education-reports', icon: BarChart3 },
    { title: t('settings'), path: '/settings', icon: Settings },
  ];

  return (
    <aside className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-screen w-64 bg-card ${isRTL ? 'border-l' : 'border-r'} border-border flex flex-col transition-all duration-300`}>
      <div className="p-6 border-b border-border">
        <h1 className={`text-2xl font-bold text-primary ${isRTL ? 'text-right' : 'text-left'}`}>Madrasa System</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-accent text-foreground'
              } ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <Icon className="w-5 h-5" />
              <span className={isRTL ? 'text-right' : 'text-left'}>{item.title}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <Button
          onClick={toggleLanguage}
          variant="outline"
          className={`w-full flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
        >
          <Languages className="w-4 h-4" />
          <span>{language === 'ur' ? 'English' : 'اردو'}</span>
        </Button>
      </div>
    </aside>
  );
};
