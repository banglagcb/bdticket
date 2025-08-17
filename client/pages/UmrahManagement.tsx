import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plane,
  MapPin,
  Users,
  Calendar,
  CreditCard,
  Phone,
  FileText,
  Download,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calculator,
  AlertCircle,
  CheckCircle,
  Save,
  X,
  Printer,
  FileSpreadsheet,
  ChevronDown,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Badge } from "../components/ui/badge";
import { useToast } from "../hooks/use-toast";
import { apiClient } from "../services/api";
import { validateBangladeshiPhone, validateEmailAddress } from "../lib/validation";
import UmrahGroupTickets from "./UmrahGroupTickets";

// Types for Umrah packages
interface UmrahWithTransport {
  id?: string;
  passengerName: string;
  pnr: string;
  passportNumber: string;
  flightAirlineName: string;
  departureDate: string;
  returnDate: string;
  approvedBy: string;
  referenceAgency: string;
  emergencyFlightContact: string;
  passengerMobile: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UmrahWithoutTransport {
  id?: string;
  flightDepartureDate: string;
  returnDate: string;
  passengerName: string;
  passportNumber: string;
  entryRecordedBy: string;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  lastPaymentDate: string;
  remarks: string;
  createdAt?: string;
  updatedAt?: string;
}

type PackageType = "with-transport" | "without-transport" | "group-tickets";

export default function UmrahManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<PackageType>("with-transport");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form states
  const [withTransportForm, setWithTransportForm] = useState<UmrahWithTransport>({
    passengerName: "",
    pnr: "",
    passportNumber: "",
    flightAirlineName: "",
    departureDate: "",
    returnDate: "",
    approvedBy: "",
    referenceAgency: "",
    emergencyFlightContact: "",
    passengerMobile: "",
  });

  const [withoutTransportForm, setWithoutTransportForm] = useState<UmrahWithoutTransport>({
    flightDepartureDate: "",
    returnDate: "",
    passengerName: "",
    passportNumber: "",
    entryRecordedBy: "",
    totalAmount: 0,
    amountPaid: 0,
    remainingAmount: 0,
    lastPaymentDate: "",
    remarks: "",
  });

  const [withTransportRecords, setWithTransportRecords] = useState<UmrahWithTransport[]>([]);
  const [withoutTransportRecords, setWithoutTransportRecords] = useState<UmrahWithoutTransport[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load data on component mount
  useEffect(() => {
    loadRecords();
  }, []);

  // Auto-calculate remaining amount for without transport
  useEffect(() => {
    const remaining = withoutTransportForm.totalAmount - withoutTransportForm.amountPaid;
    setWithoutTransportForm(prev => ({
      ...prev,
      remainingAmount: remaining >= 0 ? remaining : 0
    }));
  }, [withoutTransportForm.totalAmount, withoutTransportForm.amountPaid]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const [withTransport, withoutTransport] = await Promise.all([
        apiClient.getUmrahWithTransport(),
        apiClient.getUmrahWithoutTransport()
      ]);
      setWithTransportRecords(withTransport || []);
      setWithoutTransportRecords(withoutTransport || []);
    } catch (error) {
      console.error("Error loading records:", error);
      toast({
        title: "Error",
        description: "Failed to load records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateWithTransportForm = (form: UmrahWithTransport): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!form.passengerName.trim()) errors.passengerName = "Passenger name is required";
    if (!form.pnr.trim()) errors.pnr = "PNR is required";
    if (!form.passportNumber.trim()) errors.passportNumber = "Passport number is required";
    if (!form.flightAirlineName.trim()) errors.flightAirlineName = "Flight/Airline name is required";
    if (!form.departureDate) errors.departureDate = "Departure date is required";
    if (!form.returnDate) errors.returnDate = "Return date is required";
    if (!form.approvedBy.trim()) errors.approvedBy = "Approved by is required";
    if (!form.referenceAgency.trim()) errors.referenceAgency = "Reference agency is required";
    
    if (!form.emergencyFlightContact.trim()) {
      errors.emergencyFlightContact = "Emergency contact is required";
    } else if (!validateBangladeshiPhone(form.emergencyFlightContact)) {
      errors.emergencyFlightContact = "Invalid phone number format";
    }
    
    if (!form.passengerMobile.trim()) {
      errors.passengerMobile = "Passenger mobile is required";
    } else if (!validateBangladeshiPhone(form.passengerMobile)) {
      errors.passengerMobile = "Invalid phone number format";
    }

    // Date validation
    if (form.departureDate && form.returnDate) {
      const departure = new Date(form.departureDate);
      const returnDate = new Date(form.returnDate);
      if (returnDate <= departure) {
        errors.returnDate = "Return date must be after departure date";
      }
    }

    return errors;
  };

  const validateWithoutTransportForm = (form: UmrahWithoutTransport): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!form.flightDepartureDate) errors.flightDepartureDate = "Departure date is required";
    if (!form.returnDate) errors.returnDate = "Return date is required";
    if (!form.passengerName.trim()) errors.passengerName = "Passenger name is required";
    if (!form.passportNumber.trim()) errors.passportNumber = "Passport number is required";
    if (!form.entryRecordedBy.trim()) errors.entryRecordedBy = "Entry recorded by is required";
    if (form.totalAmount <= 0) errors.totalAmount = "Total amount must be greater than 0";
    if (form.amountPaid < 0) errors.amountPaid = "Amount paid cannot be negative";
    if (form.amountPaid > form.totalAmount) errors.amountPaid = "Amount paid cannot exceed total amount";

    // Date validation
    if (form.flightDepartureDate && form.returnDate) {
      const departure = new Date(form.flightDepartureDate);
      const returnDate = new Date(form.returnDate);
      if (returnDate <= departure) {
        errors.returnDate = "Return date must be after departure date";
      }
    }

    return errors;
  };

  const handleSubmitWithTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateWithTransportForm(withTransportForm);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      // Transform camelCase to snake_case for API
      const apiData = {
        passenger_name: withTransportForm.passengerName,
        pnr: withTransportForm.pnr,
        passport_number: withTransportForm.passportNumber,
        flight_airline_name: withTransportForm.flightAirlineName,
        departure_date: withTransportForm.departureDate,
        return_date: withTransportForm.returnDate,
        approved_by: withTransportForm.approvedBy,
        reference_agency: withTransportForm.referenceAgency,
        emergency_flight_contact: withTransportForm.emergencyFlightContact,
        passenger_mobile: withTransportForm.passengerMobile,
      };
      const newRecord = await apiClient.createUmrahWithTransport(apiData);
      setWithTransportRecords(prev => [newRecord, ...prev]);

      toast({
        title: "Success",
        description: "Umrah with transport record created successfully",
      });

      setIsFormDialogOpen(false);
      resetWithTransportForm();
    } catch (error) {
      console.error("Umrah with transport creation error:", error);
      console.log("Form data sent:", apiData);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWithoutTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    const formErrors = validateWithoutTransportForm(withoutTransportForm);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      // Transform camelCase to snake_case for API
      const apiData = {
        flight_departure_date: withoutTransportForm.flightDepartureDate,
        return_date: withoutTransportForm.returnDate,
        passenger_name: withoutTransportForm.passengerName,
        passport_number: withoutTransportForm.passportNumber,
        entry_recorded_by: withoutTransportForm.entryRecordedBy,
        total_amount: withoutTransportForm.totalAmount,
        amount_paid: withoutTransportForm.amountPaid,
        last_payment_date: withoutTransportForm.lastPaymentDate || undefined,
        remarks: withoutTransportForm.remarks || undefined,
      };
      const newRecord = await apiClient.createUmrahWithoutTransport(apiData);
      setWithoutTransportRecords(prev => [newRecord, ...prev]);

      toast({
        title: "Success",
        description: "Umrah without transport record created successfully",
      });

      setIsFormDialogOpen(false);
      resetWithoutTransportForm();
    } catch (error) {
      console.error("Umrah without transport creation error:", error);
      console.log("Form data sent:", apiData);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetWithTransportForm = () => {
    setWithTransportForm({
      passengerName: "",
      pnr: "",
      passportNumber: "",
      flightAirlineName: "",
      departureDate: "",
      returnDate: "",
      approvedBy: "",
      referenceAgency: "",
      emergencyFlightContact: "",
      passengerMobile: "",
    });
    setErrors({});
  };

  const resetWithoutTransportForm = () => {
    setWithoutTransportForm({
      flightDepartureDate: "",
      returnDate: "",
      passengerName: "",
      passportNumber: "",
      entryRecordedBy: "",
      totalAmount: 0,
      amountPaid: 0,
      remainingAmount: 0,
      lastPaymentDate: "",
      remarks: "",
    });
    setErrors({});
  };

  const getDayOfWeek = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  const exportToCSV = (records: any[], filename: string) => {
    if (records.length === 0) {
      toast({
        title: "No Data",
        description: "No records to export",
        variant: "destructive",
      });
      return;
    }

    // Create headers with proper formatting
    const headers = activeTab === "with-transport"
      ? ["Passenger Name", "PNR", "Passport Number", "Flight/Airline", "Departure Date", "Return Date", "Approved By", "Reference Agency", "Emergency Contact", "Passenger Mobile", "Created Date"]
      : ["Passenger Name", "Passport Number", "Departure Date", "Return Date", "Entry Recorded By", "Total Amount (BDT)", "Amount Paid (BDT)", "Remaining Amount (BDT)", "Last Payment Date", "Remarks", "Created Date"];

    // Format data based on package type
    const csvData = records.map(record => {
      if (activeTab === "with-transport") {
        return [
          record.passenger_name || record.passengerName,
          record.pnr,
          record.passport_number || record.passportNumber,
          record.flight_airline_name || record.flightAirlineName,
          record.departure_date || record.departureDate,
          record.return_date || record.returnDate,
          record.approved_by || record.approvedBy,
          record.reference_agency || record.referenceAgency,
          record.emergency_flight_contact || record.emergencyFlightContact,
          record.passenger_mobile || record.passengerMobile,
          record.created_at || record.createdAt || new Date().toISOString().split('T')[0]
        ];
      } else {
        return [
          record.passenger_name || record.passengerName,
          record.passport_number || record.passportNumber,
          record.flight_departure_date || record.flightDepartureDate,
          record.return_date || record.returnDate,
          record.entry_recorded_by || record.entryRecordedBy,
          record.total_amount || record.totalAmount || 0,
          record.amount_paid || record.amountPaid || 0,
          record.remaining_amount || record.remainingAmount || 0,
          record.last_payment_date || record.lastPaymentDate || "",
          record.remarks || "",
          record.created_at || record.createdAt || new Date().toISOString().split('T')[0]
        ];
      }
    });

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...csvData.map(row =>
        row.map(value => {
          const stringValue = String(value || "");
          // Escape quotes and wrap in quotes if contains comma or quotes
          return stringValue.includes(',') || stringValue.includes('"')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
        }).join(",")
      )
    ].join("\n");

    // Add BOM for better Excel compatibility
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;"
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `${filename} exported successfully as CSV (Excel compatible)`,
    });
  };

  const printRecords = () => {
    const records = activeTab === "with-transport" ? filteredWithTransportRecords : filteredWithoutTransportRecords;

    if (records.length === 0) {
      toast({
        title: "No Data",
        description: "No records to print",
        variant: "destructive",
      });
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const title = activeTab === "with-transport" ? "Umrah With Transport Packages" : "Umrah Without Transport Packages";

    let tableHeaders = "";
    let tableRows = "";

    if (activeTab === "with-transport") {
      tableHeaders = `
        <tr>
          <th>Passenger Name</th>
          <th>PNR</th>
          <th>Passport</th>
          <th>Flight/Airline</th>
          <th>Departure</th>
          <th>Return</th>
          <th>Mobile</th>
        </tr>
      `;

      tableRows = records.map(record => `
        <tr>
          <td>${record.passenger_name || record.passengerName}</td>
          <td>${record.pnr}</td>
          <td>${record.passport_number || record.passportNumber}</td>
          <td>${record.flight_airline_name || record.flightAirlineName}</td>
          <td>${new Date(record.departure_date || record.departureDate).toLocaleDateString()}</td>
          <td>${new Date(record.return_date || record.returnDate).toLocaleDateString()}</td>
          <td>${record.passenger_mobile || record.passengerMobile}</td>
        </tr>
      `).join("");
    } else {
      tableHeaders = `
        <tr>
          <th>Passenger Name</th>
          <th>Passport</th>
          <th>Departure</th>
          <th>Total Amount</th>
          <th>Amount Paid</th>
          <th>Remaining</th>
          <th>Status</th>
        </tr>
      `;

      tableRows = records.map(record => `
        <tr>
          <td>${record.passenger_name || record.passengerName}</td>
          <td>${record.passport_number || record.passportNumber}</td>
          <td>${new Date(record.flight_departure_date || record.flightDepartureDate).toLocaleDateString()}</td>
          <td>${formatCurrency(record.total_amount || record.totalAmount || 0)}</td>
          <td>${formatCurrency(record.amount_paid || record.amountPaid || 0)}</td>
          <td>${formatCurrency(record.remaining_amount || record.remainingAmount || 0)}</td>
          <td>${(record.remaining_amount || record.remainingAmount || 0) > 0 ? "Pending" : "Paid"}</td>
        </tr>
      `).join("");
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .print-date { text-align: center; margin-top: 20px; color: #666; }
            @media print {
              body { margin: 0; }
              .print-date { position: fixed; bottom: 10px; width: 100%; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <table>
            ${tableHeaders}
            ${tableRows}
          </table>
          <div class="print-date">
            Generated on: ${new Date().toLocaleString()} | Total Records: ${records.length}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();

    // Auto print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const filteredWithTransportRecords = withTransportRecords.filter(record =>
    (record.passengerName || record.passenger_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.pnr || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.passportNumber || record.passport_number || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredWithoutTransportRecords = withoutTransportRecords.filter(record =>
    (record.passengerName || record.passenger_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.passportNumber || record.passport_number || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full animate-glow">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold velvet-text">
                Umrah Ticket Management
              </h1>
              <p className="text-foreground/70 font-body">
                Manage Umrah packages with and without transport
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="font-body">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => exportToCSV(
                    activeTab === "with-transport" ? filteredWithTransportRecords : filteredWithoutTransportRecords,
                    `umrah-${activeTab}`
                  )}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as CSV/Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={printRecords}>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Records
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
              <DialogTrigger asChild>
                <Button className="velvet-button text-primary-foreground font-body">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Package
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-heading">
                    Add New Umrah Package
                  </DialogTitle>
                  <DialogDescription className="font-body">
                    Choose package type and fill in the details
                  </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PackageType)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="with-transport" className="font-body">
                      With Transport
                    </TabsTrigger>
                    <TabsTrigger value="without-transport" className="font-body">
                      Without Transport
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="with-transport">
                    <form onSubmit={handleSubmitWithTransport} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="passengerName">Passenger Name *</Label>
                          <Input
                            id="passengerName"
                            value={withTransportForm.passengerName}
                            onChange={(e) => setWithTransportForm(prev => ({
                              ...prev,
                              passengerName: e.target.value
                            }))}
                            className={errors.passengerName ? "border-red-500" : ""}
                          />
                          {errors.passengerName && (
                            <p className="text-red-500 text-sm">{errors.passengerName}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="pnr">PNR *</Label>
                          <Input
                            id="pnr"
                            value={withTransportForm.pnr}
                            onChange={(e) => setWithTransportForm(prev => ({
                              ...prev,
                              pnr: e.target.value
                            }))}
                            className={errors.pnr ? "border-red-500" : ""}
                          />
                          {errors.pnr && (
                            <p className="text-red-500 text-sm">{errors.pnr}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="passportNumber">Passport Number *</Label>
                          <Input
                            id="passportNumber"
                            value={withTransportForm.passportNumber}
                            onChange={(e) => setWithTransportForm(prev => ({
                              ...prev,
                              passportNumber: e.target.value
                            }))}
                            className={errors.passportNumber ? "border-red-500" : ""}
                          />
                          {errors.passportNumber && (
                            <p className="text-red-500 text-sm">{errors.passportNumber}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="flightAirlineName">Flight / Airline Name *</Label>
                          <Input
                            id="flightAirlineName"
                            value={withTransportForm.flightAirlineName}
                            onChange={(e) => setWithTransportForm(prev => ({
                              ...prev,
                              flightAirlineName: e.target.value
                            }))}
                            className={errors.flightAirlineName ? "border-red-500" : ""}
                          />
                          {errors.flightAirlineName && (
                            <p className="text-red-500 text-sm">{errors.flightAirlineName}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="departureDate">Departure Date *</Label>
                          <Input
                            id="departureDate"
                            type="date"
                            value={withTransportForm.departureDate}
                            onChange={(e) => setWithTransportForm(prev => ({
                              ...prev,
                              departureDate: e.target.value
                            }))}
                            className={errors.departureDate ? "border-red-500" : ""}
                          />
                          {errors.departureDate && (
                            <p className="text-red-500 text-sm">{errors.departureDate}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="returnDate">Return Date *</Label>
                          <Input
                            id="returnDate"
                            type="date"
                            value={withTransportForm.returnDate}
                            onChange={(e) => setWithTransportForm(prev => ({
                              ...prev,
                              returnDate: e.target.value
                            }))}
                            className={errors.returnDate ? "border-red-500" : ""}
                          />
                          {errors.returnDate && (
                            <p className="text-red-500 text-sm">{errors.returnDate}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="approvedBy">Approved By *</Label>
                          <Input
                            id="approvedBy"
                            value={withTransportForm.approvedBy}
                            onChange={(e) => setWithTransportForm(prev => ({
                              ...prev,
                              approvedBy: e.target.value
                            }))}
                            className={errors.approvedBy ? "border-red-500" : ""}
                          />
                          {errors.approvedBy && (
                            <p className="text-red-500 text-sm">{errors.approvedBy}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="referenceAgency">Reference Agency *</Label>
                          <Input
                            id="referenceAgency"
                            value={withTransportForm.referenceAgency}
                            onChange={(e) => setWithTransportForm(prev => ({
                              ...prev,
                              referenceAgency: e.target.value
                            }))}
                            className={errors.referenceAgency ? "border-red-500" : ""}
                          />
                          {errors.referenceAgency && (
                            <p className="text-red-500 text-sm">{errors.referenceAgency}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emergencyFlightContact">Emergency Flight Contact *</Label>
                          <Input
                            id="emergencyFlightContact"
                            value={withTransportForm.emergencyFlightContact}
                            onChange={(e) => setWithTransportForm(prev => ({
                              ...prev,
                              emergencyFlightContact: e.target.value
                            }))}
                            placeholder="+880XXXXXXXXX"
                            className={errors.emergencyFlightContact ? "border-red-500" : ""}
                          />
                          {errors.emergencyFlightContact && (
                            <p className="text-red-500 text-sm">{errors.emergencyFlightContact}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="passengerMobile">Passenger Mobile *</Label>
                          <Input
                            id="passengerMobile"
                            value={withTransportForm.passengerMobile}
                            onChange={(e) => setWithTransportForm(prev => ({
                              ...prev,
                              passengerMobile: e.target.value
                            }))}
                            placeholder="+880XXXXXXXXX"
                            className={errors.passengerMobile ? "border-red-500" : ""}
                          />
                          {errors.passengerMobile && (
                            <p className="text-red-500 text-sm">{errors.passengerMobile}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsFormDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="velvet-button">
                          <Save className="h-4 w-4 mr-2" />
                          Save Package
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="without-transport">
                    <form onSubmit={handleSubmitWithoutTransport} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="flightDepartureDate">Flight Departure Date *</Label>
                          <Input
                            id="flightDepartureDate"
                            type="date"
                            value={withoutTransportForm.flightDepartureDate}
                            onChange={(e) => setWithoutTransportForm(prev => ({
                              ...prev,
                              flightDepartureDate: e.target.value
                            }))}
                            className={errors.flightDepartureDate ? "border-red-500" : ""}
                          />
                          {withoutTransportForm.flightDepartureDate && (
                            <p className="text-sm text-muted-foreground">
                              Day: {getDayOfWeek(withoutTransportForm.flightDepartureDate)}
                            </p>
                          )}
                          {errors.flightDepartureDate && (
                            <p className="text-red-500 text-sm">{errors.flightDepartureDate}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="returnDateWT">Return Date *</Label>
                          <Input
                            id="returnDateWT"
                            type="date"
                            value={withoutTransportForm.returnDate}
                            onChange={(e) => setWithoutTransportForm(prev => ({
                              ...prev,
                              returnDate: e.target.value
                            }))}
                            className={errors.returnDate ? "border-red-500" : ""}
                          />
                          {errors.returnDate && (
                            <p className="text-red-500 text-sm">{errors.returnDate}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="passengerNameWT">Passenger Name *</Label>
                          <Input
                            id="passengerNameWT"
                            value={withoutTransportForm.passengerName}
                            onChange={(e) => setWithoutTransportForm(prev => ({
                              ...prev,
                              passengerName: e.target.value
                            }))}
                            className={errors.passengerName ? "border-red-500" : ""}
                          />
                          {errors.passengerName && (
                            <p className="text-red-500 text-sm">{errors.passengerName}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="passportNumberWT">Passport Number *</Label>
                          <Input
                            id="passportNumberWT"
                            value={withoutTransportForm.passportNumber}
                            onChange={(e) => setWithoutTransportForm(prev => ({
                              ...prev,
                              passportNumber: e.target.value
                            }))}
                            className={errors.passportNumber ? "border-red-500" : ""}
                          />
                          {errors.passportNumber && (
                            <p className="text-red-500 text-sm">{errors.passportNumber}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="entryRecordedBy">Entry Recorded By *</Label>
                          <Input
                            id="entryRecordedBy"
                            value={withoutTransportForm.entryRecordedBy}
                            onChange={(e) => setWithoutTransportForm(prev => ({
                              ...prev,
                              entryRecordedBy: e.target.value
                            }))}
                            className={errors.entryRecordedBy ? "border-red-500" : ""}
                          />
                          {errors.entryRecordedBy && (
                            <p className="text-red-500 text-sm">{errors.entryRecordedBy}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="totalAmount">Total Amount (৳) *</Label>
                          <Input
                            id="totalAmount"
                            type="number"
                            min="0"
                            value={withoutTransportForm.totalAmount}
                            onChange={(e) => setWithoutTransportForm(prev => ({
                              ...prev,
                              totalAmount: parseFloat(e.target.value) || 0
                            }))}
                            className={errors.totalAmount ? "border-red-500" : ""}
                          />
                          {errors.totalAmount && (
                            <p className="text-red-500 text-sm">{errors.totalAmount}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="amountPaid">Amount Paid (৳) *</Label>
                          <Input
                            id="amountPaid"
                            type="number"
                            min="0"
                            value={withoutTransportForm.amountPaid}
                            onChange={(e) => setWithoutTransportForm(prev => ({
                              ...prev,
                              amountPaid: parseFloat(e.target.value) || 0
                            }))}
                            className={errors.amountPaid ? "border-red-500" : ""}
                          />
                          {errors.amountPaid && (
                            <p className="text-red-500 text-sm">{errors.amountPaid}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Remaining Amount (৳)</Label>
                          <div className="flex items-center space-x-2">
                            <Calculator className="h-4 w-4 text-muted-foreground" />
                            <span className="text-lg font-bold text-primary">
                              {formatCurrency(withoutTransportForm.remainingAmount)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastPaymentDate">Last Payment Date</Label>
                          <Input
                            id="lastPaymentDate"
                            type="date"
                            value={withoutTransportForm.lastPaymentDate}
                            onChange={(e) => setWithoutTransportForm(prev => ({
                              ...prev,
                              lastPaymentDate: e.target.value
                            }))}
                          />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="remarks">Remarks / Notes</Label>
                          <Textarea
                            id="remarks"
                            value={withoutTransportForm.remarks}
                            onChange={(e) => setWithoutTransportForm(prev => ({
                              ...prev,
                              remarks: e.target.value
                            }))}
                            rows={3}
                            placeholder="Any additional notes or remarks..."
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsFormDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="velvet-button">
                          <Save className="h-4 w-4 mr-2" />
                          Save Package
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Card className="luxury-card border-0">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by passenger name, PNR, or passport..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PackageType)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="with-transport" className="font-body">
              <Plane className="h-4 w-4 mr-2" />
              With Transport ({filteredWithTransportRecords.length})
            </TabsTrigger>
            <TabsTrigger value="without-transport" className="font-body">
              <Users className="h-4 w-4 mr-2" />
              Without Transport ({filteredWithoutTransportRecords.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="with-transport">
            <Card className="luxury-card border-0">
              <CardHeader>
                <CardTitle className="font-heading">Umrah With Transport</CardTitle>
                <CardDescription className="font-body">
                  Complete travel packages including flight arrangements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredWithTransportRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Passenger Name</TableHead>
                          <TableHead>PNR</TableHead>
                          <TableHead>Passport</TableHead>
                          <TableHead>Flight/Airline</TableHead>
                          <TableHead>Departure</TableHead>
                          <TableHead>Return</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWithTransportRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.passengerName || record.passenger_name}</TableCell>
                            <TableCell>{record.pnr}</TableCell>
                            <TableCell>{record.passportNumber || record.passport_number}</TableCell>
                            <TableCell>{record.flightAirlineName || record.flight_airline_name}</TableCell>
                            <TableCell>
                              {new Date(record.departureDate || record.departure_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(record.returnDate || record.return_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{record.passengerMobile || record.passenger_mobile}</TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setIsViewDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Plane className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-heading font-bold text-foreground mb-2">
                      No records found
                    </h3>
                    <p className="text-foreground/70 font-body mb-4">
                      {searchTerm ? "No packages match your search criteria" : "No Umrah with transport packages have been added yet"}
                    </p>
                    <Button
                      onClick={() => setIsFormDialogOpen(true)}
                      className="velvet-button"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Package
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="without-transport">
            <Card className="luxury-card border-0">
              <CardHeader>
                <CardTitle className="font-heading">Umrah Without Transport</CardTitle>
                <CardDescription className="font-body">
                  Packages without flight arrangements - payment tracking enabled
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredWithoutTransportRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Passenger Name</TableHead>
                          <TableHead>Passport</TableHead>
                          <TableHead>Departure</TableHead>
                          <TableHead>Total Amount</TableHead>
                          <TableHead>Amount Paid</TableHead>
                          <TableHead>Remaining</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredWithoutTransportRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">{record.passengerName || record.passenger_name}</TableCell>
                            <TableCell>{record.passportNumber || record.passport_number}</TableCell>
                            <TableCell>
                              {new Date(record.flightDepartureDate || record.flight_departure_date).toLocaleDateString()}
                              <br />
                              <span className="text-xs text-muted-foreground">
                                {getDayOfWeek(record.flightDepartureDate || record.flight_departure_date)}
                              </span>
                            </TableCell>
                            <TableCell>{formatCurrency(record.totalAmount || record.total_amount || 0)}</TableCell>
                            <TableCell>{formatCurrency(record.amountPaid || record.amount_paid || 0)}</TableCell>
                            <TableCell>
                              <span className={(record.remainingAmount || record.remaining_amount || 0) > 0 ? "text-orange-600 font-bold" : "text-green-600 font-bold"}>
                                {formatCurrency(record.remainingAmount || record.remaining_amount || 0)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={(record.remainingAmount || record.remaining_amount || 0) > 0 ? "destructive" : "default"}>
                                {(record.remainingAmount || record.remaining_amount || 0) > 0 ? "Pending" : "Paid"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedRecord(record);
                                    setIsViewDialogOpen(true);
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-heading font-bold text-foreground mb-2">
                      No records found
                    </h3>
                    <p className="text-foreground/70 font-body mb-4">
                      {searchTerm ? "No packages match your search criteria" : "No Umrah without transport packages have been added yet"}
                    </p>
                    <Button
                      onClick={() => setIsFormDialogOpen(true)}
                      className="velvet-button"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Package
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* View Record Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Package Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(selectedRecord).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <p className="text-sm text-foreground/70">
                      {typeof value === 'number' && key.includes('Amount') ? 
                        formatCurrency(value as number) : 
                        String(value)
                      }
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
