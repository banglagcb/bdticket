import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MapPin,
  Ticket,
  RefreshCw,
  AlertCircle,
  Plane,
  Users,
  TrendingUp,
  Globe,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";

interface Country {
  code: string;
  name: string;
  flag: string;
  totalTickets: number;
  availableTickets: number;
}

interface CountryCardProps {
  country: Country;
  index: number;
}

function CountryCard({ country, index }: CountryCardProps) {
  const availabilityPercentage =
    country.totalTickets > 0
      ? (country.availableTickets / country.totalTickets) * 100
      : 0;

  const getAvailabilityColor = () => {
    if (availabilityPercentage >= 70) return "text-green-600";
    if (availabilityPercentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getCardStyle = () => {
    if (availabilityPercentage >= 70) return "border-green-200 bg-green-50";
    if (availabilityPercentage >= 40) return "border-yellow-200 bg-yellow-50";
    return "border-red-200 bg-red-50";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        duration: 0.6,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="transform-gpu"
    >
      <Link to={`/tickets/${country.code}`}>
        <Card className={`luxury-card hover:shadow-2xl transition-all duration-500 ${getCardStyle()}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="text-4xl">{country.flag}</div>
                <div>
                  <h3 className="text-xl font-heading font-bold text-foreground">
                    {country.name}
                  </h3>
                  <p className="text-sm font-body text-foreground/60">
                    {country.code}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${getAvailabilityColor()}`}>
                  {country.availableTickets}
                </div>
                <p className="text-xs text-foreground/60">Available</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-body text-foreground/70">
                  Total Tickets:
                </span>
                <span className="font-semibold">{country.totalTickets}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-body text-foreground/70">
                    Availability:
                  </span>
                  <span className={`font-semibold ${getAvailabilityColor()}`}>
                    {availabilityPercentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${
                      availabilityPercentage >= 70
                        ? "bg-green-500"
                        : availabilityPercentage >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${availabilityPercentage}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Plane className="h-4 w-4 text-primary" />
                    <span className="text-xs font-body text-foreground/60">
                      Multiple Airlines
                    </span>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="p-1 bg-primary/10 rounded-full"
                  >
                    <Ticket className="h-4 w-4 text-primary" />
                  </motion.div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function CountriesDemo() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCountries = async () => {
    setLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo data with comprehensive realistic numbers
    const demoCountries: Country[] = [
      { code: "KSA", name: "Saudi Arabia", flag: "🇸🇦", totalTickets: 55, availableTickets: 45 },
      { code: "UAE", name: "United Arab Emirates", flag: "🇦🇪", totalTickets: 55, availableTickets: 48 },
      { code: "QAT", name: "Qatar", flag: "🇶🇦", totalTickets: 33, availableTickets: 28 },
      { code: "KWT", name: "Kuwait", flag: "🇰🇼", totalTickets: 50, availableTickets: 42 },
      { code: "OMN", name: "Oman", flag: "🇴����", totalTickets: 16, availableTickets: 14 },
      { code: "BHR", name: "Bahrain", flag: "🇧🇭", totalTickets: 45, availableTickets: 38 },
      { code: "JOR", name: "Jordan", flag: "🇯🇴", totalTickets: 12, availableTickets: 10 },
      { code: "LBN", name: "Lebanon", flag: "🇱🇧", totalTickets: 14, availableTickets: 12 },
    ];
    
    setCountries(demoCountries);
    setLoading(false);
  };

  useEffect(() => {
    loadCountries();
  }, []);

  const totalAvailable = countries.reduce(
    (sum, country) => sum + country.availableTickets,
    0,
  );
  const totalTickets = countries.reduce(
    (sum, country) => sum + country.totalTickets,
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <span className="text-xl font-heading text-foreground">
            Loading Countries...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 to-cream-200">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-md border-b border-border/30 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-luxury-gold to-luxury-bronze rounded-full animate-glow">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-heading font-bold text-primary">
                  BD TicketPro
                </h1>
                <p className="text-foreground/70 font-body">
                  International Flight Ticket Management
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={loadCountries}
                variant="outline"
                size="sm"
                className="font-body hover:scale-105 transform transition-all duration-200"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Countries Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-luxury-gold to-luxury-bronze rounded-full animate-glow animate-float">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-heading font-bold text-foreground">
                Countries
              </h2>
              <p className="text-foreground/70 font-body">
                Browse tickets by destination country
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="hidden md:flex items-center space-x-6 bg-white/80 backdrop-blur-md p-4 rounded-lg border border-border/30">
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-primary">
                {totalAvailable}
              </p>
              <p className="text-xs font-body text-foreground/60">
                Available
              </p>
            </div>
            <div className="w-px h-8 bg-border/30"></div>
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-foreground">
                {totalTickets}
              </p>
              <p className="text-xs font-body text-foreground/60">Total</p>
            </div>
            <div className="w-px h-8 bg-border/30"></div>
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-foreground">
                {countries.length}
              </p>
              <p className="text-xs font-body text-foreground/60">
                Countries
              </p>
            </div>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="luxury-card">
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">{totalAvailable}</h3>
                <p className="text-sm text-foreground/60">Available Tickets</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="luxury-card">
              <CardContent className="p-6 text-center">
                <Ticket className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">{totalTickets}</h3>
                <p className="text-sm text-foreground/60">Total Inventory</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="luxury-card">
              <CardContent className="p-6 text-center">
                <Globe className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">{countries.length}</h3>
                <p className="text-sm text-foreground/60">Destinations</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="luxury-card">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-foreground">
                  {Math.round((totalAvailable / totalTickets) * 100)}%
                </h3>
                <p className="text-sm text-foreground/60">Availability</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {countries.map((country, index) => (
            <CountryCard key={country.code} country={country} index={index} />
          ))}
        </div>

        {/* Demo Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center py-8"
        >
          <Card className="inline-block luxury-card bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-500" />
                <p className="text-sm text-blue-700">
                  <strong>Demo Mode:</strong> This page shows sample data for demonstration. 
                  Login to access real inventory data.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
