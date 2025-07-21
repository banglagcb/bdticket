import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth Context
import { AuthProvider } from "./context/AuthContext";

// Components and Pages
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Countries from "./pages/Countries";
import NotFound from "./pages/NotFound";

// Placeholder components for routes not yet implemented
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="text-center py-12">
    <h1 className="text-2xl font-heading font-bold text-gray-900 mb-4">
      {title}
    </h1>
    <p className="text-gray-600 font-body">
      This page is under development. Continue prompting to build out this section.
    </p>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes with Layout */}
            <Route path="/dashboard" element={
              <Layout>
                <Dashboard />
              </Layout>
            } />
            
            <Route path="/countries" element={
              <Layout>
                <Countries />
              </Layout>
            } />
            
            <Route path="/tickets" element={
              <Layout>
                <PlaceholderPage title="All Tickets" />
              </Layout>
            } />
            
            <Route path="/tickets/:country" element={
              <Layout>
                <PlaceholderPage title="Country Tickets" />
              </Layout>
            } />
            
            <Route path="/admin/buying" element={
              <Layout>
                <PlaceholderPage title="Admin Ticket Buying" />
              </Layout>
            } />
            
            <Route path="/settings" element={
              <Layout>
                <PlaceholderPage title="Settings" />
              </Layout>
            } />
            
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
