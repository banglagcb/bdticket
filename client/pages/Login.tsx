import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, Lock, User } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export default function Login() {
  const { user, login } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const success = await login(credentials);
    
    if (!success) {
      setError('Invalid username or password');
    }
    
    setIsLoading(false);
  };

  const demoCredentials = [
    { role: 'Admin', username: 'admin', password: 'admin123' },
    { role: 'Manager', username: 'manager', password: 'manager123' },
    { role: 'Staff', username: 'staff', password: 'staff123' }
  ];

  return (
    <div className=\"min-h-screen bg-gradient-to-br from-teal-primary/10 to-gray-light flex items-center justify-center p-4\">\n      <motion.div\n        initial={{ opacity: 0, y: 20 }}\n        animate={{ opacity: 1, y: 0 }}\n        transition={{ duration: 0.5 }}\n        className=\"w-full max-w-md\"\n      >\n        {/* Logo and Welcome */}\n        <div className=\"text-center mb-8\">\n          <motion.div\n            initial={{ scale: 0 }}\n            animate={{ scale: 1 }}\n            transition={{ delay: 0.2, type: \"spring\", stiffness: 200 }}\n            className=\"inline-flex items-center justify-center w-16 h-16 bg-teal-primary rounded-full mb-4\"\n          >\n            <Plane className=\"w-8 h-8 text-white\" />\n          </motion.div>\n          <h1 className=\"text-3xl font-heading font-bold text-gray-900 mb-2\">\n            BD TicketPro\n          </h1>\n          <p className=\"text-gray-600 font-body\">\n            International Flight Ticket Management\n          </p>\n        </div>\n\n        <Card className=\"shadow-lg border-0\">\n          <CardHeader className=\"text-center\">\n            <CardTitle className=\"text-2xl font-heading\">Welcome Back</CardTitle>\n            <CardDescription className=\"font-body\">\n              Sign in to access your dashboard\n            </CardDescription>\n          </CardHeader>\n          <CardContent>\n            <form onSubmit={handleSubmit} className=\"space-y-4\">\n              <div className=\"space-y-2\">\n                <Label htmlFor=\"username\" className=\"font-body font-medium\">\n                  Username\n                </Label>\n                <div className=\"relative\">\n                  <User className=\"absolute left-3 top-3 h-4 w-4 text-gray-400\" />\n                  <Input\n                    id=\"username\"\n                    type=\"text\"\n                    placeholder=\"Enter your username\"\n                    value={credentials.username}\n                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}\n                    className=\"pl-10 font-body\"\n                    required\n                  />\n                </div>\n              </div>\n              \n              <div className=\"space-y-2\">\n                <Label htmlFor=\"password\" className=\"font-body font-medium\">\n                  Password\n                </Label>\n                <div className=\"relative\">\n                  <Lock className=\"absolute left-3 top-3 h-4 w-4 text-gray-400\" />\n                  <Input\n                    id=\"password\"\n                    type=\"password\"\n                    placeholder=\"Enter your password\"\n                    value={credentials.password}\n                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}\n                    className=\"pl-10 font-body\"\n                    required\n                  />\n                </div>\n              </div>\n\n              {error && (\n                <motion.div\n                  initial={{ opacity: 0, x: -10 }}\n                  animate={{ opacity: 1, x: 0 }}\n                  className=\"text-red-500 text-sm font-body text-center\"\n                >\n                  {error}\n                </motion.div>\n              )}\n\n              <Button\n                type=\"submit\"\n                className=\"w-full bg-teal-primary hover:bg-teal-primary/90 font-body\"\n                disabled={isLoading}\n              >\n                {isLoading ? 'Signing in...' : 'Sign In'}\n              </Button>\n            </form>\n\n            {/* Demo Credentials */}\n            <div className=\"mt-6 p-4 bg-gray-50 rounded-lg\">\n              <h3 className=\"text-sm font-heading font-semibold text-gray-700 mb-2\">\n                Demo Credentials:\n              </h3>\n              <div className=\"space-y-1 text-xs font-body text-gray-600\">\n                {demoCredentials.map((cred, index) => (\n                  <div key={index} className=\"flex justify-between\">\n                    <span className=\"font-medium\">{cred.role}:</span>\n                    <span>{cred.username} / {cred.password}</span>\n                  </div>\n                ))}\n              </div>\n            </div>\n          </CardContent>\n        </Card>\n\n        <div className=\"text-center mt-6 text-sm text-gray-500 font-body\">\n          © 2024 BD TicketPro. Travel Agency Management System.\n        </div>\n      </motion.div>\n    </div>\n  );\n}