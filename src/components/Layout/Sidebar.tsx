import { Link, useLocation } from "react-router-dom";
import { BookOpen, Users, GraduationCap, ClipboardCheck, LayoutDashboard, BookMarked, FileText, DollarSign, TrendingUp, Shield, X, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { t } = useTranslation();
  const { isAdmin, madrasaName, logoUrl } = useAuth();

  console.log('Sidebar render - isOpen:', isOpen);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    console.log('Sidebar useEffect - isOpen changed to:', isOpen);
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const navigation = [
    { name: t('dashboard'), href: "/", icon: LayoutDashboard },
    { name: t('students'), href: "/students", icon: Users },
    { name: t('teachers'), href: "/teachers", icon: GraduationCap },
    { name: t('classes'), href: "/classes", icon: BookOpen },
    { name: t('attendance'), href: "/attendance", icon: ClipboardCheck },
    { name: t('courses'), href: "/courses", icon: BookMarked },
    { name: t('learningReport'), href: "/education-reports", icon: FileText },
    { name: t('fees'), href: "/fees", icon: DollarSign },
    { name: t('income'), href: "/income", icon: TrendingUp },
    ...(isAdmin ? [{ name: t('userRoles'), href: "/user-roles", icon: Shield }] : []),
    { name: t('myAccount') || 'My Account', href: "/my-account", icon: UserIcon },
  ];

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [location.pathname]);

  // Close sidebar on larger screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        onClose();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onClose]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-sidebar shadow-2xl",
          "transition-transform duration-300 ease-in-out",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        aria-label="Sidebar navigation"
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Logo */}
          <div className="flex h-16 md:h-20 items-center gap-3 border-b border-sidebar-border px-4 md:px-6">
            <Avatar className="h-10 w-10">
              <AvatarImage src={logoUrl || ''} alt={madrasaName || 'Madrasa'} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                {logoUrl ? (
                  <BookOpen className="h-6 w-6" />
                ) : (
                  <BookOpen className="h-6 w-6" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-base md:text-lg font-bold text-sidebar-foreground truncate">
                {madrasaName || t('appTitle')}
              </h1>
              <p className="text-xs text-sidebar-foreground/70">{t('appSubtitle')}</p>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="md:hidden p-2 hover:bg-sidebar-accent/50 rounded-lg"
            >
              <X className="h-5 w-5 text-sidebar-foreground" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/30 p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-primary">
                <span className="text-xs font-semibold text-sidebar-primary-foreground">AD</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{t('adminUser')}</p>
                <p className="text-xs text-sidebar-foreground/60 truncate">admin@madrasa.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

    </>
  );
}
