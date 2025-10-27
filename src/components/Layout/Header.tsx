import { Bell, Search, LogOut, User, Languages, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { SearchCommand } from "@/components/ui/search-command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePendingUserRoles } from "@/hooks/usePendingUserRoles";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, signOut, isAdmin, madrasaName } = useAuth();
  const { t, i18n } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const { pendingRoles } = usePendingUserRoles();
  const navigate = useNavigate();
  
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ur' : 'en';
    i18n.changeLanguage(newLang);
    document.documentElement.setAttribute('lang', newLang);
  };

  useEffect(() => {
    document.documentElement.setAttribute('lang', i18n.language);
  }, [i18n.language]);

  return (
    <header className="fixed left-0 md:left-64 right-0 top-0 z-30 h-16 md:h-20 border-b border-border bg-card shadow-soft">
      <div className="flex h-full items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Madrasa Name - Hidden on mobile */}
        {madrasaName && (
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-primary">{madrasaName}</h1>
          </div>
        )}
        
        {/* Search - Hidden on mobile */}
        <div className="hidden sm:flex flex-1 max-w-md ml-4">
          <Button 
            variant="outline" 
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => setSearchOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">{t('searchPlaceholder')}</span>
            <span className="md:hidden">{t('search')}</span>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Mobile title */}
        <h1 className="sm:hidden text-lg font-bold text-foreground">{t('appTitle')}</h1>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
          {/* Search icon for mobile */}
          <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setSearchOpen(true)}>
            <Search className="h-5 w-5" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleLanguage}
            title={i18n.language === 'en' ? 'Switch to Urdu' : 'انگلش میں تبدیل کریں'}
          >
            <Languages className="h-5 w-5" />
          </Button>

          {isAdmin && (
            <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {pendingRoles.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                      {pendingRoles.length}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">{t('notifications')}</h4>
                  {pendingRoles.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('noNewNotifications')}</p>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {pendingRoles.length} {t('pendingJoinRequests')}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          navigate('/user-roles');
                          setNotificationOpen(false);
                        }}
                      >
                        {t('viewAllRequests')}
                      </Button>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user?.email ? getInitials(user.email) : 'U'}</AvatarFallback>
                </Avatar>
                <span className="text-sm hidden lg:inline">{user?.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t('myAccount')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isAdmin && (
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('admin')}</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t('signOut')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
