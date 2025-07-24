import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ArrowRight,
  User,
  CreditCard,
  Ticket,
  Bell,
  Settings,
  FileText,
  Users,
  Package,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function BookingSystemDemo() {
  const [currentStep, setCurrentStep] = useState(0);

  const bookingSteps = [
    {
      id: 1,
      title: "User Login",
      description: "Access system with role-based permissions",
      icon: <User className="h-5 w-5" />,
      details: [
        "Admin: Full system access (admin/admin123)",
        "Manager: Booking management (manager/manager123)", 
        "Staff: Basic booking operations (staff/staff123)",
      ],
      color: "bg-blue-500",
    },
    {
      id: 2,
      title: "Browse Countries & Tickets",
      description: "View available flights by destination",
      icon: <Package className="h-5 w-5" />,
      details: [
        "8 Countries: KSA, UAE, Qatar, Kuwait, Oman, Bahrain, Jordan, Lebanon",
        "300+ tickets across all destinations",
        "Real-time availability and pricing",
      ],
      color: "bg-purple-500",
    },
    {
      id: 3,
      title: "Select & Filter Flights",
      description: "Find the perfect flight with advanced filters",
      icon: <Ticket className="h-5 w-5" />,
      details: [
        "Filter by status, airline, price range",
        "Search by flight number or agent",
        "Sort by price low to high or high to low",
      ],
      color: "bg-green-500",
    },
    {
      id: 4,
      title: "Create Booking",
      description: "Complete customer information and payment details",
      icon: <FileText className="h-5 w-5" />,
      details: [
        "Agent Information: Name, phone, email",
        "Passenger Details: Name, passport, contact info",
        "Payment Options: Full payment or partial advance",
      ],
      color: "bg-orange-500",
    },
    {
      id: 5,
      title: "Payment Processing",
      description: "Handle various payment methods",
      icon: <CreditCard className="h-5 w-5" />,
      details: [
        "Cash, Bank Transfer, Mobile Banking",
        "Credit Card, Check payments",
        "Partial payments with advance tracking",
      ],
      color: "bg-teal-500",
    },
    {
      id: 6,
      title: "Booking Confirmation",
      description: "Generate booking confirmation and notifications",
      icon: <CheckCircle className="h-5 w-5" />,
      details: [
        "Unique booking ID generation",
        "Automatic ticket status update",
        "Real-time notifications to users",
      ],
      color: "bg-green-600",
    },
    {
      id: 7,
      title: "Management & Reports",
      description: "Track bookings and manage business operations",
      icon: <Settings className="h-5 w-5" />,
      details: [
        "Booking status management",
        "Sales reports and analytics",
        "Inventory tracking and alerts",
      ],
      color: "bg-indigo-500",
    },
  ];

  const features = [
    {
      title: "Complete Booking Workflow",
      description: "From login to ticket sales with customer information collection",
      icon: <Users className="h-6 w-6" />,
    },
    {
      title: "Real-time Notifications", 
      description: "Bell notifications for bookings, payments, and system updates",
      icon: <Bell className="h-6 w-6" />,
    },
    {
      title: "Clickable Dashboard Cards",
      description: "Navigate directly to relevant sections from dashboard statistics",
      icon: <Package className="h-6 w-6" />,
    },
    {
      title: "Role-based Permissions",
      description: "Different access levels for admin, manager, and staff users",
      icon: <User className="h-6 w-6" />,
    },
  ];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-4xl font-heading font-bold velvet-text mb-4">
          BD TicketPro Booking System Demo
        </h1>
        <p className="text-lg text-foreground/70 font-body max-w-3xl mx-auto">
          Complete end-to-end booking system for international flight tickets with customer information collection,
          payment processing, and real-time notifications.
        </p>
      </motion.div>

      {/* Features Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="luxury-card border-0 mb-8">
          <CardHeader>
            <CardTitle className="font-heading velvet-text text-center">
              Key Features Implemented
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  className="flex items-start space-x-4 p-4 bg-gradient-to-r from-cream-100 to-cream-200 rounded-lg"
                >
                  <div className="p-2 bg-primary/10 rounded-full">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold velvet-text">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-foreground/70 font-body">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Booking Workflow Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card className="luxury-card border-0">
          <CardHeader>
            <CardTitle className="font-heading velvet-text text-center">
              Complete Booking Workflow
            </CardTitle>
            <CardDescription className="text-center font-body">
              Step-by-step process from user login to ticket sales completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {bookingSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  className={`relative flex items-start space-x-4 p-6 rounded-lg border-l-4 ${ 
                    currentStep >= index ? 'bg-green-50 border-green-500' : 'bg-gray-50 border-gray-300'
                  } hover:shadow-md transition-all duration-300 cursor-pointer`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className={`p-3 rounded-full text-white ${step.color}`}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-heading font-semibold velvet-text">
                        Step {step.id}: {step.title}
                      </h3>
                      {currentStep >= index && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </div>
                    <p className="text-foreground/70 font-body mb-3">
                      {step.description}
                    </p>
                    <ul className="space-y-1">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="text-sm text-foreground/60 font-body flex items-center">
                          <ArrowRight className="h-3 w-3 mr-2 text-primary" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-2xl font-heading font-bold text-gray-300">
                    {step.id}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Demo Credentials */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card className="luxury-card border-0">
          <CardHeader>
            <CardTitle className="font-heading velvet-text text-center">
              Ready to Test? Use These Demo Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { role: "Admin", username: "admin", password: "admin123", color: "bg-red-500" },
                { role: "Manager", username: "manager", password: "manager123", color: "bg-blue-500" },
                { role: "Staff", username: "staff", password: "staff123", color: "bg-green-500" },
              ].map((cred) => (
                <div key={cred.role} className={`p-4 rounded-lg text-white ${cred.color}`}>
                  <h3 className="font-heading font-semibold mb-2">{cred.role} Access</h3>
                  <p className="font-body text-sm opacity-90">
                    Username: <span className="font-mono">{cred.username}</span>
                  </p>
                  <p className="font-body text-sm opacity-90">
                    Password: <span className="font-mono">{cred.password}</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h2 className="text-2xl font-heading font-bold velvet-text">
          Start Testing the Complete System
        </h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            onClick={() => window.location.href = '/login'}
            className="velvet-button text-primary-foreground font-body"
          >
            <User className="h-4 w-4 mr-2" />
            Go to Login
          </Button>
          <Button
            onClick={() => window.location.href = '/countries-demo'}
            variant="outline"
            className="font-body"
          >
            <Ticket className="h-4 w-4 mr-2" />
            View Demo Tickets
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
