import React from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Ticket, 
  Lock, 
  Package, 
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  Users 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

interface DashboardTileProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

function DashboardTile({ title, value, description, icon, color, delay = 0 }: DashboardTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Card className="shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-heading font-medium">
            {title}
          </CardTitle>
          <div className={`p-2 rounded-full ${color}`}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-heading font-bold mb-1">{value}</div>
          <p className="text-xs text-muted-foreground font-body">
            {description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user, hasPermission } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  // Mock data - in a real app, this would come from API
  const stats = {
    todaysSales: { count: 12, amount: 240000 },
    totalBookings: 45,
    lockedTickets: 8,
    totalInventory: 320,
    estimatedProfit: 85000,
    todaysTicketsBought: 25,
    unsoldTickets: 187
  };

  const commonTiles = [
    {
      title: "Today's Sales",
      value: `৳${stats.todaysSales.amount.toLocaleString()}`,
      description: `${stats.todaysSales.count} tickets sold today`,
      icon: <DollarSign className="h-4 w-4 text-white" />,
      color: "bg-green-500"
    },
    {
      title: "Total Bookings",
      value: stats.totalBookings,
      description: "Active booking requests",
      icon: <Ticket className="h-4 w-4 text-white" />,
      color: "bg-blue-500"
    },
    {
      title: "Locked Tickets",
      value: stats.lockedTickets,
      description: "Temporarily reserved",
      icon: <Lock className="h-4 w-4 text-white" />,
      color: "bg-yellow-500"
    },
    {
      title: "Total Inventory",
      value: stats.totalInventory,
      description: "Available tickets",
      icon: <Package className="h-4 w-4 text-white" />,
      color: "bg-purple-500"
    }
  ];

  const adminTiles = [
    {
      title: "Estimated Profit",
      value: `৳${stats.estimatedProfit.toLocaleString()}`,
      description: "Based on current sales",
      icon: <TrendingUp className="h-4 w-4 text-white" />,
      color: "bg-teal-primary"
    },
    {
      title: "Today's Purchases",
      value: stats.todaysTicketsBought,
      description: "Tickets bought today",
      icon: <ShoppingCart className="h-4 w-4 text-white" />,
      color: "bg-indigo-500"
    },
    {
      title: "Unsold Tickets",
      value: stats.unsoldTickets,
      description: "Remaining inventory",
      icon: <AlertCircle className="h-4 w-4 text-white" />,
      color: "bg-orange-500"
    }
  ];

  const tilesToShow = hasPermission('view_profit') 
    ? [...commonTiles, ...adminTiles]
    : commonTiles;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-teal-primary rounded-full">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-gray-900">
              Welcome back, {user.name}
            </h1>
            <p className="text-gray-600 font-body capitalize">
              {user.role} Dashboard • BD TicketPro
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tilesToShow.map((tile, index) => (
          <DashboardTile
            key={tile.title}
            {...tile}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-heading">Quick Actions</CardTitle>
            <CardDescription className="font-body">
              Frequently used features for your role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Ticket className="h-8 w-8 text-teal-primary mb-2" />
                <h3 className="font-heading font-semibold">View Tickets</h3>
                <p className="text-sm text-gray-600 font-body">Browse available tickets</p>
              </motion.div>

              {hasPermission('create_batches') && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <ShoppingCart className="h-8 w-8 text-teal-primary mb-2" />
                  <h3 className="font-heading font-semibold">Buy Tickets</h3>
                  <p className="text-sm text-gray-600 font-body">Add new inventory</p>
                </motion.div>
              )}

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Package className="h-8 w-8 text-teal-primary mb-2" />
                <h3 className="font-heading font-semibold">Manage Bookings</h3>
                <p className="text-sm text-gray-600 font-body">Process customer requests</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="font-heading">Recent Activity</CardTitle>
            <CardDescription className="font-body">
              Latest updates and transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "Ticket sold", details: "Air Arabia • KSA • ৳20,000", time: "2 minutes ago" },
                { action: "New booking", details: "Emirates • UAE • John Doe", time: "15 minutes ago" },
                { action: "Ticket locked", details: "Flydubai • Qatar • 24hr hold", time: "1 hour ago" },
                { action: "Booking confirmed", details: "Saudi Airlines • KSA • ৳18,500", time: "2 hours ago" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-teal-primary rounded-full"></div>
                    <div>
                      <p className="font-body font-medium text-sm">{activity.action}</p>
                      <p className="font-body text-xs text-gray-600">{activity.details}</p>
                    </div>
                  </div>
                  <span className="font-body text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
