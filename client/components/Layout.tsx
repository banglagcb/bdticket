import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plane,
  LayoutDashboard,
  Globe,
  Ticket,
  ShoppingCart,
  Settings,
  LogOut,
  User,
  Menu,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  permission?: string;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navigationItems: NavItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="h-4 w-4" />
    },
    {
      path: '/countries',
      label: 'Countries',
      icon: <Globe className="h-4 w-4" />
    },
    {
      path: '/tickets',
      label: 'Tickets',
      icon: <Ticket className="h-4 w-4" />
    },
    {
      path: '/admin/buying',
      label: 'Buy Tickets',
      icon: <ShoppingCart className="h-4 w-4" />,
      permission: 'create_batches'
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: <Settings className="h-4 w-4" />
    }
  ];

  const visibleNavItems = navigationItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  const handleLogout = () => {
    logout();
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.path;
    
    return (
      <Link
        to={item.path}
        className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-body font-medium transition-colors ${
          isActive
            ? 'bg-teal-primary text-white'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {item.icon}
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
            
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="p-2 bg-teal-primary rounded-lg">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-lg text-gray-900">
                  BD TicketPro
                </h1>
              </div>
            </Link>
          </div>

          {/* User Profile and Actions */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <div className="p-2 bg-gray-100 rounded-full">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div className="text-right">
                <p className="font-body font-medium text-sm text-gray-900">
                  {user.name}
                </p>
                <p className="font-body text-xs text-gray-500 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="font-body"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex md:flex-col w-64 bg-white shadow-sm border-r h-[calc(100vh-73px)]">
          <nav className="flex-1 p-4 space-y-2">
            {visibleNavItems.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </nav>
          
          {/* User info at bottom */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-primary/10 rounded-full">
                <User className="h-4 w-4 text-teal-primary" />
              </div>
              <div>
                <p className="font-body font-medium text-sm text-gray-900">
                  {user.name}
                </p>
                <p className="font-body text-xs text-gray-500 capitalize">
                  {user.role} Account
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-64 bg-white h-full shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-teal-primary rounded-lg">
                    <Plane className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="font-heading font-bold text-lg text-gray-900">
                    BD TicketPro
                  </h1>
                </div>
              </div>
              
              <nav className="flex-1 p-4 space-y-2">
                {visibleNavItems.map((item) => (
                  <NavLink key={item.path} item={item} />
                ))}
              </nav>
              
              <div className="p-4 border-t">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-teal-primary/10 rounded-full">
                    <User className="h-4 w-4 text-teal-primary" />
                  </div>
                  <div>
                    <p className="font-body font-medium text-sm text-gray-900">
                      {user.name}
                    </p>
                    <p className="font-body text-xs text-gray-500 capitalize">
                      {user.role} Account
                    </p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
