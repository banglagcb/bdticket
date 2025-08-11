import React, { useState, useEffect } from "react";
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
import { apiClient } from "../services/api";

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
  const [pastPurchases, setPastPurchases] = useState<PastPurchase[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [purchasesError, setPurchasesError] = useState<string | null>(null);

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
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isFormValid, setIsFormValid] = useState(false);
  const { toast } = useToast();

  // Load past purchases data
  const loadPastPurchases = async () => {
    try {
      setLoadingPurchases(true);
      setPurchasesError(null);

      // Get ticket batches
      const response = await apiClient.getTicketBatches();
      console.log("📊 Past purchases data:", response);

      // Transform data to match interface
      const transformedData: PastPurchase[] = (response.batches || []).map((batch: any) => ({
        id: batch.id,
        country: batch.country_code,
        airline: batch.airline_name,
        flightDate: batch.flight_date,
        quantity: batch.quantity,
        buyingPrice: batch.buying_price || 0,
        totalCost: (batch.buying_price || 0) * batch.quantity,
        agentName: batch.agent_name,
        agentContact: batch.agent_contact,
        sold: batch.sold_count || 0,
        locked: batch.locked_count || 0,
        available: batch.available_count || 0,
        profit: ((batch.selling_price || 0) - (batch.buying_price || 0)) * (batch.sold_count || 0),
        createdAt: batch.created_at
      }));

      setPastPurchases(transformedData);
    } catch (error) {
      console.error("❌ Failed to load past purchases:", error);
      setPurchasesError("Failed to load purchase history");
      setPastPurchases([]);
    } finally {
      setLoadingPurchases(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadPastPurchases();
  }, []);

  // Comprehensive validation functions
  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Country validation
    if (!formData.country.trim()) {
      errors.country =
        "দেশ নির্বাচন করা আবশ্যক / Country selection is required";
    }

    // Airline validation
    if (!formData.airline.trim()) {
      errors.airline =
        "এয়ারলাইন নির্বাচন করা আবশ্যক / Airline selection is required";
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
        errors.flightDate =
          "ভবিষ্যতের তারিখ নির্বাচন করুন / Please select a future date";
      }
      if (flightDate > maxDate) {
        errors.flightDate =
          "১ বছরের মধ্যে তারিখ নির্বাচন করুন / Please select date within 1 year";
      }
    }

    // Flight time validation
    if (!formData.flightTime) {
      errors.flightTime = "ফ্লাইটের সময় আবশ্যক / Flight time is required";
    } else {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(formData.flightTime)) {
        errors.flightTime =
          "সঠিক সময় ফরম্যাট ব্যবহার করুন (HH:MM) / Please use correct time format (HH:MM)";
      }
    }

    // Buying price validation
    if (!formData.buyingPrice || formData.buyingPrice <= 0) {
      errors.buyingPrice =
        "ক্রয় মূল্য ০ এর চেয়ে বেশি হতে হবে / Buying price must be greater than 0";
    } else if (formData.buyingPrice < 1000) {
      errors.buyingPrice =
        "ক্রয় মূল্য কমপক্ষে ১০০০ টাকা হতে হবে / Buying price must be at least ৳1000";
    } else if (formData.buyingPrice > 200000) {
      errors.buyingPrice =
        "ক্রয় মূল্য ২,০০,০০০ টাকার চেয়ে বেশি হতে পারে না / Buying price cannot exceed ৳2,00,000";
    }

    // Quantity validation
    if (!formData.quantity || formData.quantity <= 0) {
      errors.quantity =
        "টিকেটের ���ংখ্যা ০ ����র চেয়ে বেশি হতে হবে / Quantity must be greater than 0";
    } else if (formData.quantity > 1000) {
      errors.quantity =
        "একবারে সর্বোচ্চ ১��০০ টিকেট ক্রয় করা যাবে / Maximum 1000 tickets can be purchased at once";
    }

    // Agent name validation
    if (!formData.agentName.trim()) {
      errors.agentName = "এজেন্টের নাম আবশ্যক / Agent name is required";
    } else if (formData.agentName.trim().length < 3) {
      errors.agentName =
        "এজেন্টের নাম কমপক্ষে ৩ অক্ষর হতে হবে / Agent name must be at least 3 characters";
    }

    // Agent contact validation
    if (!formData.agentContact.trim()) {
      errors.agentContact =
        "এজেন্টের যোগাযোগ নম্বর আবশ্���ক / Agent contact is required";
    } else {
      const phoneRegex = /^(\+880|880|0)?(1[3-9]\d{8})$/;
      const cleanContact = formData.agentContact.replace(/[\s-]/g, "");
      if (!phoneRegex.test(cleanContact)) {
        errors.agentContact =
          "সঠিক বাংলাদেশি মোবাইল নম্বর দিন / Please provide valid Bangladeshi mobile number";
      }
    }

    // Agent address validation
    if (
      formData.agentAddress &&
      formData.agentAddress.trim().length > 0 &&
      formData.agentAddress.trim().length < 10
    ) {
      errors.agentAddress =
        "ঠিকানা কমপক্ষে ১০ অক্ষর হতে হবে / Address must be at least 10 characters";
    }

    // Total cost validation
    const totalCost = formData.buyingPrice * formData.quantity;
    if (totalCost > 50000000) {
      // 5 crore limit
      errors.general =
        "মোট খরচ ৫ কোটি টাকার বেশি হতে পারে না / Total cost cannot exceed ৳5 crore";
    }

    return errors;
  };

  // Business logic validation
  const validateBusinessRules = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Check for duplicate flights on same date/time
    const existingFlight = pastPurchases.find(
      (p) =>
        p.country === formData.country &&
        p.airline === formData.airline &&
        p.flightDate === formData.flightDate,
    );

    if (existingFlight) {
      errors.duplicate =
        "একই দিনে, ���কই এয়ারলাইন��র জন্য ইতিমধ্যে টিকেট ক্রয় করা হয়েছে / Tickets already purchased for same airline on this date";
    }

    // Check minimum profit margin (20%)
    const estimatedSellingPrice = formData.buyingPrice * 1.15; // Minimum 15% markup
    if (
      estimatedSellingPrice - formData.buyingPrice <
      formData.buyingPrice * 0.1
    ) {
      errors.profit =
        "লাভের মার্জিন কমপক্ষে ১০% রাখুন / Keep minimum 10% profit margin";
    }

    return errors;
  };

  // Real-time validation - form validation happens in real-time
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
      profitMargin:
        totalCost > 0 ? ((estimatedProfit / totalCost) * 100).toFixed(1) : "0",
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

    // 1st Check: Form validation
    const formErrors = validateForm();
    const businessErrors = validateBusinessRules();
    const allErrors = { ...formErrors, ...businessErrors };

    if (Object.keys(allErrors).length > 0) {
      setValidationErrors(allErrors);
      toast({
        title: "ভ্যা���িডেশন ত্রুটি / Validation Error",
        description:
          "দয়া করে সব ক্ষেত্র সঠিকভাবে পূরণ করুন / Please fill all fields correctly",
        variant: "destructive",
      });
      return;
    }

    // 2nd Check: Financial validation
    const financials = calculateFinancials();
    if (financials.totalCost <= 0) {
      toast({
        title: "আর্থিক ত্রুটি / Financial Error",
        description:
          "মোট খরচ শূন্যের চেয়ে বেশি হতে হবে / Total cost must be greater than zero",
        variant: "destructive",
      });
      return;
    }

    // 3rd Check: Confirm large purchases
    if (financials.totalCost > 1000000) {
      // 10 lakh
      const confirmed = window.confirm(
        `বড় পরিমাণ ক্রয়: ৳${financials.totalCost.toLocaleString()}\n\nআপনি কি নিশ্চিত?\n\nLarge purchase: ৳${financials.totalCost.toLocaleString()}\n\nAre you sure?`,
      );
      if (!confirmed) return;
    }

    setIsSubmitting(true);

    try {
      // 4th Check: Final pre-submission validation
      toast({
        title: "প্রক্রিয়াকরণ / Processing",
        description: "টিকেট ব্যাচ তৈরি করা হচ্ছে / Creating ticket batch...",
      });

      // Log purchase details for audit
      console.log("=== টিকেট ক্রয় অডিট লগ / TICKET PURCHASE AUDIT LOG ===");
      console.log("দেশ / Country:", formData.country);
      console.log("এয়ারলাইন / Airline:", formData.airline);
      console.log("ফ্লাইট তারিখ / Flight Date:", formData.flightDate);
      console.log("পরিমাণ / Quantity:", formData.quantity);
      console.log(
        "ক্রয় মূল্য / Buying Price:",
        `৳${formData.buyingPrice.toLocaleString()}`,
      );
      console.log(
        "মোট খরচ / Total Cost:",
        `৳${financials.totalCost.toLocaleString()}`,
      );
      console.log(
        "��্রত্���াশিত বিক্রয় মূল্য / Expected Selling Price:",
        `৳${financials.estimatedSellingPrice.toLocaleString()}`,
      );
      console.log(
        "প্রত্যাশিত মুনাফা / Expected Profit:",
        `৳${financials.estimatedProfit.toLocaleString()}`,
      );
      console.log(
        "মুনাফার হার / Profit Margin:",
        `${financials.profitMargin}%`,
      );
      console.log("এজেন্ট / Agent:", formData.agentName);
      console.log("যোগাযোগ / Contact:", formData.agentContact);
      console.log("সময় / Time:", new Date().toLocaleString());
      console.log("=== লগ শেষ / END LOG ===");

      // Actual API call to create ticket batch
      const batchResponse = await apiClient.createTicketBatch(formData);
      console.log(
        "টিকেট ব্যাচ তৈর��� সফল / Ticket batch created successfully:",
        batchResponse,
      );

      // 5th Check: Post-submission verification
      const successMessage =
        `✅ সফলভাবে সম্পন্ন / Successfully Completed!\n\n` +
        `📊 বিস্তারিত / Details:\n` +
        `• দেশ / Country: ${formData.country}\n` +
        `• এয়ারলাইন / Airline: ${formData.airline}\n` +
        `• টিকেট সংখ্যা / Tickets: ${formData.quantity}\n` +
        `• মোট খরচ / Total Cost: ৳${financials.totalCost.toLocaleString()}\n` +
        `• প্রত্যাশিত মুনাফা / Expected Profit: ৳${financials.estimatedProfit.toLocaleString()}\n` +
        `• মুনাফার হার / Profit Margin: ${financials.profitMargin}%`;

      // Success notification
      toast({
        title: "সফল / Success!",
        description:
          "টিকেট ব্যাচ সফলভাবে তৈরি হয়েছে / Ticket batch created successfully",
      });

      // Reset form after successful submission
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
      setValidationErrors({});

      // Show detailed success message
      alert(successMessage);
    } catch (error) {
      console.error("Error creating ticket batch:", error);
      toast({
        title: "ত্রুটি / Error",
        description:
          "টিকেট ব্যাচ তৈরিতে সমস্যা হয়েছে / Failed to create ticket batch",
        variant: "destructive",
      });
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
                      {validationErrors.country && (
                        <p className="text-red-500 text-sm font-body mt-1">
                          {validationErrors.country}
                        </p>
                      )}
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

                  {/* Comprehensive Financial Calculator */}
                  {formData.quantity > 0 && formData.buyingPrice > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      {(() => {
                        const financials = calculateFinancials();
                        return (
                          <>
                            {/* Cost Breakdown */}
                            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                              <h3 className="font-heading font-semibold text-blue-800 mb-3 flex items-center">
                                <DollarSign className="h-5 w-5 mr-2" />
                                আর্থিক বিশ্লেষণ / Financial Analysis
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-body">
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                  <span className="text-gray-600 block">
                                    টিকেট প্রতি দাম / Price per Ticket
                                  </span>
                                  <span className="font-bold text-blue-600 text-lg">
                                    ৳{formData.buyingPrice.toLocaleString()}
                                  </span>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                  <span className="text-gray-600 block">
                                    মোট টিকেট / Total Tickets
                                  </span>
                                  <span className="font-bold text-blue-600 text-lg">
                                    {formData.quantity}
                                  </span>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                  <span className="text-gray-600 block">
                                    মোট খরচ / Total Cost
                                  </span>
                                  <span className="font-bold text-red-600 text-lg">
                                    ৳{financials.totalCost.toLocaleString()}
                                  </span>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                  <span className="text-gray-600 block">
                                    প্রত্যাশিত বিক্রয় মূল্য / Expected Selling
                                    Price
                                  </span>
                                  <span className="font-bold text-green-600 text-lg">
                                    ৳
                                    {financials.estimatedSellingPrice.toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Profit Analysis */}
                            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                              <h3 className="font-heading font-semibold text-green-800 mb-3 flex items-center">
                                <TrendingUp className="h-5 w-5 mr-2" />
                                মুনাফা বিশ্লেষণ / Profit Analysis
                              </h3>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-body">
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                  <span className="text-gray-600 block">
                                    প্রত্যাশিত আয় / Expected Revenue
                                  </span>
                                  <span className="font-bold text-green-600 text-xl">
                                    ৳
                                    {financials.estimatedRevenue.toLocaleString()}
                                  </span>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                  <span className="text-gray-600 block">
                                    প্রত্যাশিত মু��াফা / Expected Profit
                                  </span>
                                  <span className="font-bold text-green-600 text-xl">
                                    ৳
                                    {financials.estimatedProfit.toLocaleString()}
                                  </span>
                                </div>
                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                  <span className="text-gray-600 block">
                                    মুনাফার হ���র / Profit Margin
                                  </span>
                                  <span
                                    className={`font-bold text-xl ${
                                      parseFloat(financials.profitMargin) >= 20
                                        ? "text-green-600"
                                        : parseFloat(financials.profitMargin) >=
                                            10
                                          ? "text-yellow-600"
                                          : "text-red-600"
                                    }`}
                                  >
                                    {financials.profitMargin}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Risk Assessment */}
                            <div className="p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                              <h3 className="font-heading font-semibold text-yellow-800 mb-3 flex items-center">
                                <Package className="h-5 w-5 mr-2" />
                                ঝুঁকি মূল্যায়ন / Risk Assessment
                              </h3>
                              <div className="space-y-2 text-sm font-body">
                                {financials.totalCost > 5000000 && (
                                  <div className="bg-red-100 border border-red-300 p-2 rounded flex items-center">
                                    <span className="text-red-600 font-semibold">
                                      ⚠️ উচ্চ ঝুঁকি: ৫০ লাখ টাকার বেশি বিনিয়োগ
                                      / High Risk: Investment over ৳50 lakh
                                    </span>
                                  </div>
                                )}
                                {parseFloat(financials.profitMargin) < 10 && (
                                  <div className="bg-orange-100 border border-orange-300 p-2 rounded flex items-center">
                                    <span className="text-orange-600 font-semibold">
                                      ⚠️ কম মুনাফা: ১০% এর কম / Low Profit: Less
                                      than 10%
                                    </span>
                                  </div>
                                )}
                                {formData.quantity > 500 && (
                                  <div className="bg-yellow-100 border border-yellow-300 p-2 rounded flex items-center">
                                    <span className="text-yellow-600 font-semibold">
                                      ⚠️ বড় পরিমাণ: ৫���০+ টিকেট / Large
                                      Quantity: 500+ tickets
                                    </span>
                                  </div>
                                )}
                                {parseFloat(financials.profitMargin) >= 20 &&
                                  financials.totalCost <= 1000000 && (
                                    <div className="bg-green-100 border border-green-300 p-2 rounded flex items-center">
                                      <span className="text-green-600 font-semibold">
                                        ✅ নিরাপদ বিনিয়োগ: ভাল মুনাফার হার /
                                        Safe Investment: Good profit margin
                                      </span>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </motion.div>
                  )}

                  {/* Validation Summary */}
                  {Object.keys(validationErrors).length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">
                        ত্রুটি সমূহ / Validation Errors:
                      </h4>
                      <ul className="space-y-1 text-sm text-red-600">
                        {Object.values(validationErrors).map((error, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting || !isFormValid}
                    className={`w-full font-body text-lg py-3 hover:scale-105 transform transition-all duration-200 ${
                      isFormValid
                        ? "velvet-button text-primary-foreground"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>
                          টিকেট ইনভেন্টরিতে যোগ করা হচ্ছে... / Adding to
                          Inventory...
                        </span>
                      </div>
                    ) : !isFormValid ? (
                      <div className="flex items-center space-x-2">
                        <span>
                          সব তথ্য সঠিকভাবে পূরণ করুন / Please fill all fields
                          correctly
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Plus className="h-5 w-5" />
                        <span>ইনভেন্টরিতে যোগ করুন / Add to Inventory</span>
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
