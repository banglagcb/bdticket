import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, MapPin, Ticket } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

interface CountryCardProps {
  country: {
    code: string;
    name: string;
    flag: string;
    totalTickets: number;
    availableTickets: number;
  };
  index: number;
}

function CountryCard({ country, index }: CountryCardProps) {
  const availabilityPercentage = (country.availableTickets / country.totalTickets) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/tickets/${country.code.toLowerCase()}`}>
        <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group">
          <CardHeader className="text-center pb-2">
            <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">
              {country.flag}
            </div>
            <CardTitle className="font-heading text-lg group-hover:text-teal-primary transition-colors">
              {country.name}
            </CardTitle>
            <CardDescription className="font-body text-sm text-gray-600">
              {country.code}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Ticket Availability */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-body text-sm text-gray-600">Available</span>
                <span className="font-heading font-semibold text-teal-primary">
                  {country.availableTickets}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-teal-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${availabilityPercentage}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between items-center text-xs font-body text-gray-500">
                <span>Total: {country.totalTickets}</span>
                <span>{availabilityPercentage.toFixed(0)}% available</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-blue-100 rounded">
                  <Plane className="h-3 w-3 text-blue-600" />
                </div>
                <span className="font-body text-xs text-gray-600">
                  {Math.floor(Math.random() * 5) + 2} Airlines
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="p-1 bg-green-100 rounded">
                  <Ticket className="h-3 w-3 text-green-600" />
                </div>
                <span className="font-body text-xs text-gray-600">
                  View Tickets
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}

export default function Countries() {
  // Mock data - in a real app, this would come from API
  const countries = [
    {
      code: 'KSA',
      name: 'Saudi Arabia',
      flag: '🇸🇦',
      totalTickets: 85,
      availableTickets: 42
    },
    {
      code: 'UAE',
      name: 'United Arab Emirates',
      flag: '🇦🇪',
      totalTickets: 72,
      availableTickets: 38
    },
    {
      code: 'QAT',
      name: 'Qatar',
      flag: '🇶🇦',
      totalTickets: 56,
      availableTickets: 29
    },
    {
      code: 'KWT',
      name: 'Kuwait',
      flag: '🇰🇼',
      totalTickets: 48,
      availableTickets: 25
    },
    {
      code: 'OMN',
      name: 'Oman',
      flag: '🇴🇲',
      totalTickets: 34,
      availableTickets: 18
    },
    {
      code: 'BHR',
      name: 'Bahrain',
      flag: '🇧🇭',
      totalTickets: 28,
      availableTickets: 15
    },
    {
      code: 'JOR',
      name: 'Jordan',
      flag: '🇯🇴',
      totalTickets: 22,
      availableTickets: 12
    },
    {
      code: 'LBN',
      name: 'Lebanon',
      flag: '🇱🇧',
      totalTickets: 18,
      availableTickets: 9
    }
  ];

  const totalAvailable = countries.reduce((sum, country) => sum + country.availableTickets, 0);
  const totalTickets = countries.reduce((sum, country) => sum + country.totalTickets, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-teal-primary rounded-full">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-gray-900">
                Countries
              </h1>
              <p className="text-gray-600 font-body">
                Browse tickets by destination country
              </p>
            </div>
          </div>
          
          {/* Summary Stats */}
          <div className="hidden md:flex items-center space-x-6 bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-teal-primary">
                {totalAvailable}
              </p>
              <p className="text-xs font-body text-gray-600">Available</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-gray-700">
                {totalTickets}
              </p>
              <p className="text-xs font-body text-gray-600">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-heading font-bold text-blue-600">
                {countries.length}
              </p>
              <p className="text-xs font-body text-gray-600">Countries</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="md:hidden grid grid-cols-3 gap-4"
      >
        <Card className="text-center p-4">
          <div className="text-xl font-heading font-bold text-teal-primary">
            {totalAvailable}
          </div>
          <div className="text-xs font-body text-gray-600">Available</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-xl font-heading font-bold text-gray-700">
            {totalTickets}
          </div>
          <div className="text-xs font-body text-gray-600">Total</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-xl font-heading font-bold text-blue-600">
            {countries.length}
          </div>
          <div className="text-xs font-body text-gray-600">Countries</div>
        </Card>
      </motion.div>

      {/* Countries Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {countries.map((country, index) => (
          <CountryCard
            key={country.code}
            country={country}
            index={index}
          />
        ))}
      </div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-center py-8"
      >
        <p className="font-body text-sm text-gray-500">
          Click on any country to view available tickets and make bookings
        </p>
      </motion.div>
    </div>
  );
}
