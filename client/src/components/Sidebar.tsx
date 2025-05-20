import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Home,
  UserCheck,
  FileText,
  AlertTriangle,
  Megaphone,
  Calendar,
  LogOut,
  X,
  Menu,
  User
} from "lucide-react";

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Navigation items
  const navItems = [
    { 
      href: "/", 
      label: "لوحة التحكم",
      icon: <Home className="ml-3 size-5" />
    },
    { 
      href: "/attendance", 
      label: "الحضور",
      icon: <UserCheck className="ml-3 size-5" />
    },
    { 
      href: "/reports", 
      label: "التقارير",
      icon: <FileText className="ml-3 size-5" />
    },
    { 
      href: "/behavior", 
      label: "المخالفات",
      icon: <AlertTriangle className="ml-3 size-5" />
    },
    { 
      href: "/announcements", 
      label: "الإعلانات",
      icon: <Megaphone className="ml-3 size-5" />
    },
    { 
      href: "/schedule", 
      label: "جدول الحصص",
      icon: <Calendar className="ml-3 size-5" />
    }
  ];

  // Is current path active
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile menu toggle */}
      <div className="lg:hidden fixed top-0 right-0 p-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={toggleMobileMenu}
          className="bg-white text-primary"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`bg-white shadow-md fixed inset-y-0 right-0 w-64 lg:translate-x-0 transform transition-transform duration-300 ease-in-out z-40 flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-primary">مدرسة جابر بن حيان</h1>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMobileMenu}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* User profile */}
        <div className="mb-4 mt-2 text-center">
          <div className="inline-block h-16 w-16 rounded-full overflow-hidden bg-gray-200">
            <div className="h-full w-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary/60" />
            </div>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-700">سامي الرويلي</h3>
          <p className="text-xs text-gray-500">مدير النظام</p>
        </div>
        
        {/* Navigation links */}
        <nav className="space-y-1 p-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive(item.href) 
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        {/* Logout button */}
        <div className="mt-auto p-4 border-t border-gray-200">
          <Button 
            variant="ghost"
            className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            <LogOut className="ml-3 size-5 transform -scale-x-100" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </aside>
    </>
  );
}
