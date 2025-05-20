import { ReactNode } from "react";
import { useLocation } from "wouter";

interface ArabicThemeProviderProps {
  children: ReactNode;
}

export default function ArabicThemeProvider({ children }: ArabicThemeProviderProps) {
  const [location] = useLocation();

  return (
    <div dir="rtl" lang="ar" className="font-amiri min-h-screen flex flex-col">
      {children}
    </div>
  );
}
