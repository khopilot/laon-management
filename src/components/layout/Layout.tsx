import React, { useEffect } from 'react';
import { AppSidebar } from './AppSidebar';
import { useAuth } from '../../hooks/useAuth';
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, login } = useAuth();

  // Auto-login for development
  useEffect(() => {
    if (!isAuthenticated) {
      login({
        staff_id: 'staff_001',
        password: 'password123'
      }).catch(() => {
        // Ignore login errors in development
        console.log('Auto-login failed, but continuing...');
      });
    }
  }, [isAuthenticated, login]);

  // Always show the layout with sidebar for development
  // if (!isAuthenticated) {
  //   return <>{children}</>;
  // }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold">LoanCare Management</h1>
            </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min p-6">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}; 