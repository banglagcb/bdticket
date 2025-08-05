import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Plus,
  Calendar,
  Clock,
  Plane,
  DollarSign,
  User,
  Phone,
  MapPin,
  FileText,
  Upload,
  Filter,
  Search,
  Eye,
  TrendingUp,
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
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { CreateTicketBatchRequest } from "@shared/api";
import { useToast } from "../hooks/use-toast";

interface PastPurchase {
  id: string;
  country: string;
  airline: string;
  flightDate: string;
  quantity: number;
  buyingPrice: number;
  totalCost: number;
  agentName: string;
  agentContact?: string;
  sold: number;
  locked: number;
  available: number;
  profit: number;
  createdAt: string;
}

export default function AdminBuying() {
  const { user, hasPermission } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Redirect if not admin
  if (!user || !hasPermission("create_batches")) {
    return <Navigate to="/dashboard" replace />;
  }

  const [formData, setFormData] = useState<CreateTicketBatchRequest>({
    country: "",
    airline: "",
    flightDate: "",
    flightTime: "",
    buyingPrice: 0,
    quantity: 0,
    agentName: "",
    agentContact: "",
    agentAddress: "",
    remarks: "",
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const { toast } = useToast();

  // Mock data for past purchases
  const pastPurchases: PastPurchase[] = [
    // Will be populated with real purchase data
  ];

  // Comprehensive validation functions
  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Country validation
    if (!formData.country.trim()) {
      errors.country = "দেশ নির্বাচন করা আবশ্যক / Country selection is required";
    }

    // Airline validation
    if (!formData.airline.trim()) {
      errors.airline = "এয়ারলাইন নির্বাচন করা আবশ্যক / Airline selection is required";
    }

    // Flight date validation
    if (!formData.flightDate) {
      errors.flightDate = "ফ্লাইটের তারিখ আবশ্যক / Flight date is required";
    } else {
      const flightDate = new Date(formData.flightDate);
      const today = new Date();
      const maxDate = new Date();
      maxDate.setFullYear(today.getFullYear() + 1); // Max 1 year in future

      if (flightDate < today) {
        errors.flightDate = "ভবিষ্যতের তারিখ নির্বাচন করুন / Please select a future date";
      }
      if (flightDate > maxDate) {
        errors.flightDate = "১ বছরের মধ্যে তারিখ নির্বাচন করুন / Please select date within 1 year";
      }
    }

    // Flight time validation
    if (!formData.flightTime) {
      errors.flightTime = "ফ্লাইটের সময় আবশ্যক / Flight time is required";
    } else {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.flightTime)) {
        errors.flightTime = "সঠিক সময় ফরম্যাট ব্যবহার করুন (HH:MM) / Please use correct time format (HH:MM)";
      }
    }

    // Buying price validation
    if (!formData.buyingPrice || formData.buyingPrice <= 0) {
      errors.buyingPrice = "ক্রয় মূল্য ০ এর চেয়ে বেশি হতে হবে / Buying price must be greater than 0";
    } else if (formData.buyingPrice < 1000) {
      errors.buyingPrice = "ক্রয় মূল্য কমপক্ষে ১০০০ টাকা হতে হবে / Buying price must be at least ৳1000";
    } else if (formData.buyingPrice > 200000) {
      errors.buyingPrice = "ক্রয় মূল্য ২,০০,০০০ টাকার চেয়ে বেশি হতে পারে না / Buying price cannot exceed ৳2,00,000";
    }

    // Quantity validation
    if (!formData.quantity || formData.quantity <= 0) {
      errors.quantity = "টিকেটের সংখ্যা ০ ���র চেয়ে বেশি হতে হবে / Quantity must be greater than 0";
    } else if (formData.quantity > 1000) {
      errors.quantity = "একবারে সর্বোচ্চ ১০০০ টিকেট ক্রয় করা যাবে / Maximum 1000 tickets can be purchased at once";
    }

    // Agent name validation
    if (!formData.agentName.trim()) {
      errors.agentName = "এজেন্টের নাম আবশ্যক / Agent name is required";
    } else if (formData.agentName.trim().length < 3) {
      errors.agentName = "এজেন্টের নাম কমপক্ষে ৩ অক্ষর হতে হবে / Agent name must be at least 3 characters";
    }

    // Agent contact validation
    if (!formData.agentContact.trim()) {
      errors.agentContact = "এজেন্টের যোগাযোগ নম্বর আবশ্যক / Agent contact is required";
    } else {
      const phoneRegex = /^(\+880|880|0)?(1[3-9]\d{8})$/;
      const cleanContact = formData.agentContact.replace(/[\s-]/g, '');
      if (!phoneRegex.test(cleanContact)) {
        errors.agentContact = "সঠিক বাংলাদেশি মোবাইল নম্বর দিন / Please provide valid Bangladeshi mobile number";
      }
    }

    // Agent address validation
    if (formData.agentAddress && formData.agentAddress.trim().length > 0 && formData.agentAddress.trim().length < 10) {
      errors.agentAddress = "ঠিকানা কমপক্ষে ১০ অক্ষর হতে হবে / Address must be at least 10 characters";
    }

    // Total cost validation
    const totalCost = formData.buyingPrice * formData.quantity;
    if (totalCost > 50000000) { // 5 crore limit
      errors.general = "মোট খরচ ৫ কোটি টাকার বেশি হতে পারে না / Total cost cannot exceed ৳5 crore";
    }

    return errors;
  };

  // Business logic validation
  const validateBusinessRules = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Check for duplicate flights on same date/time
    const existingFlight = pastPurchases.find(p =>
      p.country === formData.country &&
      p.airline === formData.airline &&
      p.flightDate === formData.flightDate
    );

    if (existingFlight) {
      errors.duplicate = "একই দিনে, একই এয়ারলাইনের জন্য ইতিমধ্যে টিকেট ক্রয় করা হয়েছে / Tickets already purchased for same airline on this date";
    }

    // Check minimum profit margin (20%)
    const estimatedSellingPrice = formData.buyingPrice * 1.15; // Minimum 15% markup
    if (estimatedSellingPrice - formData.buyingPrice < formData.buyingPrice * 0.1) {
      errors.profit = "লাভের মার্জিন কমপক্ষে ১০% রাখুন / Keep minimum 10% profit margin";
    }

    return errors;
  };

  // Real-time form validation
  useEffect(() => {
    const formErrors = validateForm();
    const businessErrors = validateBusinessRules();
    const allErrors = { ...formErrors, ...businessErrors };

    setValidationErrors(allErrors);
    setIsFormValid(Object.keys(allErrors).length === 0);
  }, [formData]);

  // Financial calculations with validation
  const calculateFinancials = () => {
    const totalCost = formData.buyingPrice * formData.quantity;
    const estimatedSellingPrice = Math.round(formData.buyingPrice * 1.2); // 20% markup
    const estimatedRevenue = estimatedSellingPrice * formData.quantity;
    const estimatedProfit = estimatedRevenue - totalCost;

    return {
      totalCost,
      estimatedSellingPrice,
      estimatedRevenue,
      estimatedProfit,
      profitMargin: totalCost > 0 ? ((estimatedProfit / totalCost) * 100).toFixed(1) : "0"
    };
  };

  const countries = [
    { code: "KSA", name: "Saudi Arabia", flag: "🇸🇦" },
    { code: "UAE", name: "United Arab Emirates", flag: "🇦🇪" },
    { code: "QAT", name: "Qatar", flag: "🇶🇦" },
    { code: "KWT", name: "Kuwait", flag: "🇰🇼" },
    { code: "OMN", name: "Oman", flag: "🇴🇲" },
    { code: "BHR", name: "Bahrain", flag: "🇧🇭" },
    { code: "JOR", name: "Jordan", flag: "🇯🇴" },
    { code: "LBN", name: "Lebanon", flag: "🇱🇧" },
  ];

  const airlines = [
    "Air Arabia",
    "Emirates",
    "Qatar Airways",
    "Saudi Airlines",
    "Flydubai",
    "Kuwait Airways",
    "Oman Air",
    "Gulf Air",
  ];

  const handleInputChange = (
    field: keyof CreateTicketBatchRequest,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Reset form
      setFormData({
        country: "",
        airline: "",
        flightDate: "",
        flightTime: "",
        buyingPrice: 0,
        quantity: 0,
        agentName: "",
        agentContact: "",
        agentAddress: "",
        remarks: "",
      });
      setUploadedFile(null);

      alert(`Successfully added ${formData.quantity} tickets to inventory!`);
    } catch (error) {
      console.error("Error creating ticket batch:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPurchases = pastPurchases.filter((purchase) => {
    const matchesSearch =
      purchase.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.agentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry =
      countryFilter === "all" || purchase.country === countryFilter;

    let matchesDate = true;
    if (dateFrom || dateTo) {
      const purchaseDate = new Date(purchase.createdAt);
      if (dateFrom && purchaseDate < new Date(dateFrom)) matchesDate = false;
      if (dateTo && purchaseDate > new Date(dateTo)) matchesDate = false;
    }

    return matchesSearch && matchesCountry && matchesDate;
  });

  const totalStats = {
    totalInvestment: pastPurchases.reduce((sum, p) => sum + p.totalCost, 0),
    totalProfit: pastPurchases.reduce((sum, p) => sum + p.profit, 0),
    totalTickets: pastPurchases.reduce((sum, p) => sum + p.quantity, 0),
    totalSold: pastPurchases.reduce((sum, p) => sum + p.sold, 0),
  };

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
            <div className="p-3 bg-gradient-to-br from-luxury-gold to-luxury-bronze rounded-full animate-glow animate-float">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold velvet-text">
                Admin Ticket Buying
              </h1>
              <p className="text-foreground/70 font-body">
                Purchase and manage flight ticket inventory
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="hidden lg:flex items-center space-x-6 luxury-card p-4 rounded-lg border-0">
            <div className="text-center">
              <p className="text-xl font-heading font-bold text-primary velvet-text">
                ৳{totalStats.totalInvestment.toLocaleString()}
              </p>
              <p className="text-xs font-body text-foreground/60">
                Total Investment
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-heading font-bold text-green-600 velvet-text">
                ৳{totalStats.totalProfit.toLocaleString()}
              </p>
              <p className="text-xs font-body text-foreground/60">
                Total Profit
              </p>
            </div>
            <div className="text-center">
              <p className="text-xl font-heading font-bold text-blue-600 velvet-text">
                {totalStats.totalSold}/{totalStats.totalTickets}
              </p>
              <p className="text-xs font-body text-foreground/60">Sold/Total</p>
            </div>
          </div>
        </div>
      </motion.div>

      <Tabs defaultValue="add-tickets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 luxury-card border-0 p-1">
          <TabsTrigger
            value="add-tickets"
            className="data-[state=active]:velvet-button data-[state=active]:text-primary-foreground font-body"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Tickets
          </TabsTrigger>
          <TabsTrigger
            value="past-purchases"
            className="data-[state=active]:velvet-button data-[state=active]:text-primary-foreground font-body"
          >
            <Eye className="h-4 w-4 mr-2" />
            Past Purchases
          </TabsTrigger>
        </TabsList>

        {/* Add New Ticket Batch */}
        <TabsContent value="add-tickets">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Card className="luxury-card border-0">
              <CardHeader>
                <CardTitle className="font-heading velvet-text flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Add New Ticket Batch</span>
                </CardTitle>
                <CardDescription className="font-body">
                  Enter ticket details to add new inventory to the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Flight Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="font-body font-medium">Country</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) =>
                          handleInputChange("country", value)
                        }
                        required
                      >
                        <SelectTrigger className="font-body">
                          <SelectValue placeholder="Select destination country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.flag} {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body font-medium">Airline</Label>
                      <Select
                        value={formData.airline}
                        onValueChange={(value) =>
                          handleInputChange("airline", value)
                        }
                        required
                      >
                        <SelectTrigger className="font-body">
                          <SelectValue placeholder="Select airline" />
                        </SelectTrigger>
                        <SelectContent>
                          {airlines.map((airline) => (
                            <SelectItem key={airline} value={airline}>
                              <div className="flex items-center space-x-2">
                                <Plane className="h-4 w-4" />
                                <span>{airline}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body font-medium">
                        Flight Date
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
                        <Input
                          type="date"
                          value={formData.flightDate}
                          onChange={(e) =>
                            handleInputChange("flightDate", e.target.value)
                          }
                          className="pl-10 font-body"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body font-medium">
                        Flight Time
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
                        <Input
                          type="time"
                          value={formData.flightTime}
                          onChange={(e) =>
                            handleInputChange("flightTime", e.target.value)
                          }
                          className="pl-10 font-body"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body font-medium">
                        Buying Price (Per Ticket)
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
                        <Input
                          type="number"
                          value={formData.buyingPrice || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "buyingPrice",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="pl-10 font-body"
                          placeholder="Enter buying price per ticket"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body font-medium">
                        Total Tickets
                      </Label>
                      <div className="relative">
                        <Package className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
                        <Input
                          type="number"
                          value={formData.quantity || ""}
                          onChange={(e) =>
                            handleInputChange(
                              "quantity",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="pl-10 font-body"
                          placeholder="20"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Agent Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="font-body font-medium">
                        Agent/Seller Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
                        <Input
                          value={formData.agentName}
                          onChange={(e) =>
                            handleInputChange("agentName", e.target.value)
                          }
                          className="pl-10 font-body"
                          placeholder="Ahmed Travel Agency"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body font-medium">
                        Agent Contact (Optional)
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
                        <Input
                          value={formData.agentContact}
                          onChange={(e) =>
                            handleInputChange("agentContact", e.target.value)
                          }
                          className="pl-10 font-body"
                          placeholder="Enter agent contact number"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body font-medium">
                        Agent Address (Optional)
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
                        <Input
                          value={formData.agentAddress}
                          onChange={(e) =>
                            handleInputChange("agentAddress", e.target.value)
                          }
                          className="pl-10 font-body"
                          placeholder="Dhanmondi, Dhaka"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-body font-medium">
                        Remarks (Optional)
                      </Label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
                        <Textarea
                          value={formData.remarks}
                          onChange={(e) =>
                            handleInputChange("remarks", e.target.value)
                          }
                          className="pl-10 font-body min-h-[80px]"
                          placeholder="Any additional notes about this batch..."
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="font-body font-medium">
                        Upload Invoice (Optional)
                      </Label>
                      <div className="border-2 border-dashed border-border/50 rounded-lg p-4 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="h-8 w-8 text-foreground/40 mx-auto mb-2" />
                          <p className="font-body text-sm text-foreground/70">
                            {uploadedFile
                              ? uploadedFile.name
                              : "Click to upload PDF or Image"}
                          </p>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Cost Summary */}
                  {formData.quantity > 0 && formData.buyingPrice > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-gradient-to-br from-cream-100 to-cream-200 rounded-lg border border-border/30"
                    >
                      <h3 className="font-heading font-semibold velvet-text mb-2">
                        Cost Summary
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-body">
                        <div>
                          <span className="text-foreground/70">
                            Price per ticket:
                          </span>
                          <span className="font-semibold text-foreground ml-2">
                            ৳{formData.buyingPrice.toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-foreground/70">
                            Total tickets:
                          </span>
                          <span className="font-semibold text-foreground ml-2">
                            {formData.quantity}
                          </span>
                        </div>
                        <div>
                          <span className="text-foreground/70">
                            Total cost:
                          </span>
                          <span className="font-semibold text-primary ml-2">
                            ৳
                            {(
                              formData.buyingPrice * formData.quantity
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full velvet-button text-primary-foreground font-body text-lg py-3 hover:scale-105 transform transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Adding to Inventory...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Plus className="h-5 w-5" />
                        <span>Add to Inventory</span>
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Past Purchases */}
        <TabsContent value="past-purchases">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
          >
            {/* Filters */}
            <Card className="luxury-card border-0">
              <CardHeader>
                <CardTitle className="font-heading velvet-text flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filter Purchases</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-foreground/40" />
                    <Input
                      placeholder="Search airline or agent..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 font-body"
                    />
                  </div>

                  <Select
                    value={countryFilter}
                    onValueChange={setCountryFilter}
                  >
                    <SelectTrigger className="font-body">
                      <SelectValue placeholder="Filter by country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    placeholder="From date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="font-body"
                  />

                  <Input
                    type="date"
                    placeholder="To date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="font-body"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Purchases Table */}
            <Card className="luxury-card border-0">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-cream-100 to-cream-200 border-b border-border/30">
                      <tr>
                        <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-foreground velvet-text">
                          Country
                        </th>
                        <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-foreground velvet-text">
                          Airline
                        </th>
                        <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-foreground velvet-text">
                          Flight Date
                        </th>
                        <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-foreground velvet-text">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-foreground velvet-text">
                          Buying Price
                        </th>
                        <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-foreground velvet-text">
                          Total Cost
                        </th>
                        <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-foreground velvet-text">
                          Agent
                        </th>
                        <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-foreground velvet-text">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-foreground velvet-text">
                          Profit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPurchases.map((purchase, index) => (
                        <motion.tr
                          key={purchase.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                          className="border-b border-border/20 hover:bg-gradient-to-r hover:from-cream-100/50 hover:to-transparent transition-all duration-300"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">
                                {
                                  countries.find(
                                    (c) => c.code === purchase.country,
                                  )?.flag
                                }
                              </span>
                              <span className="font-body font-medium text-sm text-foreground">
                                {purchase.country}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <Plane className="h-4 w-4 text-foreground/40" />
                              <span className="font-body text-sm text-foreground">
                                {purchase.airline}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-body text-sm text-foreground">
                            {purchase.flightDate}
                          </td>
                          <td className="px-4 py-3 font-body text-sm text-foreground">
                            {purchase.quantity}
                          </td>
                          <td className="px-4 py-3 font-body text-sm text-foreground">
                            ৳{purchase.buyingPrice.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-body font-semibold text-sm text-foreground">
                            ৳{purchase.totalCost.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-body font-medium text-sm text-foreground">
                                {purchase.agentName}
                              </p>
                              {purchase.agentContact && (
                                <p className="font-body text-xs text-foreground/60">
                                  {purchase.agentContact}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <div className="flex space-x-1">
                                <Badge
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 text-xs"
                                >
                                  {purchase.sold} Sold
                                </Badge>
                              </div>
                              <div className="flex space-x-1">
                                <Badge
                                  variant="outline"
                                  className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs"
                                >
                                  {purchase.locked} Locked
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                                >
                                  {purchase.available} Available
                                </Badge>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="font-body font-semibold text-sm text-green-600">
                                ৳{purchase.profit.toLocaleString()}
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
