import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  User,
  Users,
  Shield,
  Bell,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Database,
  FileText,
  Globe,
  Palette,
  Mail,
  Phone,
  MapPin,
  Building,
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
import { Switch } from "../components/ui/switch";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "staff";
  status: "active" | "inactive";
  lastLogin: string;
  createdAt: string;
}

interface SystemSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  defaultCurrency: string;
  timezone: string;
  language: string;
  autoBackup: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  bookingTimeout: number;
}

export default function Settings() {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock user data
  const [users] = useState<UserData[]>([
    {
      id: "1",
      name: "Admin User",
      email: "admin@bdticketpro.com",
      phone: "+8801234567890",
      role: "admin",
      status: "active",
      lastLogin: "2024-12-23 10:30 AM",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Manager User",
      email: "manager@bdticketpro.com",
      phone: "+8801234567891",
      role: "manager",
      status: "active",
      lastLogin: "2024-12-23 09:15 AM",
      createdAt: "2024-02-01",
    },
    {
      id: "3",
      name: "Staff User",
      email: "staff@bdticketpro.com",
      phone: "+8801234567892",
      role: "staff",
      status: "active",
      lastLogin: "2024-12-22 04:45 PM",
      createdAt: "2024-03-10",
    },
  ]);

  const [userProfile, setUserProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    companyName: "BD TicketPro",
    companyEmail: "info@bdticketpro.com",
    companyPhone: "+880-123-456-7890",
    companyAddress: "Dhanmondi, Dhaka, Bangladesh",
    defaultCurrency: "BDT",
    timezone: "Asia/Dhaka",
    language: "en",
    autoBackup: true,
    emailNotifications: true,
    smsNotifications: false,
    bookingTimeout: 24,
  });

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSystemUpdate = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      alert("System settings updated successfully!");
    } catch (error) {
      console.error("System update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataExport = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Create mock CSV data
      const csvData =
        "data:text/csv;charset=utf-8,ID,Airline,Date,Price,Status\n1,Air Arabia,2024-12-25,22000,Available\n2,Emirates,2024-12-26,45000,Booked";
      const encodedUri = encodeURI(csvData);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute(
        "download",
        `bd-ticketpro-export-${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      alert("Data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "manager":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "staff":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-luxury-gold to-luxury-bronze rounded-full animate-glow animate-float">
            <SettingsIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold velvet-text">
              Settings
            </h1>
            <p className="text-foreground/70 font-body">
              Manage your profile and system configuration
            </p>
          </div>
        </div>
      </motion.div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4 luxury-card border-0 p-1">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:velvet-button data-[state=active]:text-primary-foreground font-body"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          {hasPermission("manage_users") && (
            <TabsTrigger
              value="users"
              className="data-[state=active]:velvet-button data-[state=active]:text-primary-foreground font-body"
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
          )}
          <TabsTrigger
            value="system"
            className="data-[state=active]:velvet-button data-[state=active]:text-primary-foreground font-body"
          >
            <Globe className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
          <TabsTrigger
            value="backup"
            className="data-[state=active]:velvet-button data-[state=active]:text-primary-foreground font-body"
          >
            <Database className="h-4 w-4 mr-2" />
            Backup
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="luxury-card border-0">
              <CardHeader>
                <CardTitle className="font-heading velvet-text flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription className="font-body">
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-body font-medium">Full Name</Label>
                    <Input
                      value={userProfile.name}
                      onChange={(e) =>
                        setUserProfile({ ...userProfile, name: e.target.value })
                      }
                      className="font-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body font-medium">
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          email: e.target.value,
                        })
                      }
                      className="font-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body font-medium">
                      Phone Number
                    </Label>
                    <Input
                      value={userProfile.phone}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          phone: e.target.value,
                        })
                      }
                      className="font-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body font-medium">Role</Label>
                    <Input
                      value={user?.role || ""}
                      disabled
                      className="font-body bg-muted capitalize"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="luxury-card border-0">
              <CardHeader>
                <CardTitle className="font-heading velvet-text flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription className="font-body">
                  Change your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="font-body font-medium">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={userProfile.currentPassword}
                        onChange={(e) =>
                          setUserProfile({
                            ...userProfile,
                            currentPassword: e.target.value,
                          })
                        }
                        className="font-body pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-foreground/40 hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body font-medium">
                      New Password
                    </Label>
                    <Input
                      type="password"
                      value={userProfile.newPassword}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          newPassword: e.target.value,
                        })
                      }
                      className="font-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body font-medium">
                      Confirm New Password
                    </Label>
                    <Input
                      type="password"
                      value={userProfile.confirmPassword}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="font-body"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={handleProfileUpdate}
                disabled={isLoading}
                className="velvet-button text-primary-foreground font-body hover:scale-105 transform transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </div>
                )}
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* User Management */}
        {hasPermission("manage_users") && (
          <TabsContent value="users">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Card className="luxury-card border-0">
                <CardHeader>
                  <CardTitle className="font-heading velvet-text flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User Management</span>
                  </CardTitle>
                  <CardDescription className="font-body">
                    Manage system users and their permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-cream-100 to-cream-200 border-b border-border/30">
                        <tr>
                          <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-foreground velvet-text">
                            User
                          </th>
                          <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-foreground velvet-text">
                            Role
                          </th>
                          <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-foreground velvet-text">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-foreground velvet-text">
                            Last Login
                          </th>
                          <th className="px-4 py-3 text-left font-heading font-semibold text-sm text-foreground velvet-text">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((userData, index) => (
                          <motion.tr
                            key={userData.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.3 }}
                            className="border-b border-border/20 hover:bg-gradient-to-r hover:from-cream-100/50 hover:to-transparent transition-all duration-300"
                          >
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-body font-medium text-sm text-foreground">
                                  {userData.name}
                                </p>
                                <p className="font-body text-xs text-foreground/60">
                                  {userData.email}
                                </p>
                                <p className="font-body text-xs text-foreground/60">
                                  {userData.phone}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant="outline"
                                className={`${getRoleColor(userData.role)} text-xs capitalize`}
                              >
                                {userData.role}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant="outline"
                                className={`${getStatusColor(userData.status)} text-xs capitalize`}
                              >
                                {userData.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 font-body text-sm text-foreground">
                              {userData.lastLogin}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="font-body text-xs"
                                >
                                  Edit
                                </Button>
                                {userData.id !== user?.id && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="font-body text-xs text-red-600 border-red-200"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="luxury-card border-0">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Delete User
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this
                                          user? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
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
        )}

        {/* System Settings */}
        <TabsContent value="system">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="luxury-card border-0">
              <CardHeader>
                <CardTitle className="font-heading velvet-text flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Company Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-body font-medium">
                      Company Name
                    </Label>
                    <Input
                      value={systemSettings.companyName}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          companyName: e.target.value,
                        })
                      }
                      className="font-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body font-medium">
                      Company Email
                    </Label>
                    <Input
                      value={systemSettings.companyEmail}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          companyEmail: e.target.value,
                        })
                      }
                      className="font-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body font-medium">
                      Company Phone
                    </Label>
                    <Input
                      value={systemSettings.companyPhone}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          companyPhone: e.target.value,
                        })
                      }
                      className="font-body"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body font-medium">
                      Company Address
                    </Label>
                    <Textarea
                      value={systemSettings.companyAddress}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          companyAddress: e.target.value,
                        })
                      }
                      className="font-body"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="luxury-card border-0">
              <CardHeader>
                <CardTitle className="font-heading velvet-text flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Regional Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="font-body font-medium">
                      Default Currency
                    </Label>
                    <Select
                      value={systemSettings.defaultCurrency}
                      onValueChange={(value) =>
                        setSystemSettings({
                          ...systemSettings,
                          defaultCurrency: value,
                        })
                      }
                    >
                      <SelectTrigger className="font-body">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BDT">
                          BDT - Bangladeshi Taka
                        </SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body font-medium">Timezone</Label>
                    <Select
                      value={systemSettings.timezone}
                      onValueChange={(value) =>
                        setSystemSettings({
                          ...systemSettings,
                          timezone: value,
                        })
                      }
                    >
                      <SelectTrigger className="font-body">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Dhaka">Asia/Dhaka</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                        <SelectItem value="Asia/Riyadh">Asia/Riyadh</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body font-medium">Language</Label>
                    <Select
                      value={systemSettings.language}
                      onValueChange={(value) =>
                        setSystemSettings({
                          ...systemSettings,
                          language: value,
                        })
                      }
                    >
                      <SelectTrigger className="font-body">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="bn">বাংলা</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="luxury-card border-0">
              <CardHeader>
                <CardTitle className="font-heading velvet-text flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body font-medium text-foreground">
                        Email Notifications
                      </p>
                      <p className="font-body text-sm text-foreground/60">
                        Receive booking confirmations via email
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setSystemSettings({
                          ...systemSettings,
                          emailNotifications: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body font-medium text-foreground">
                        SMS Notifications
                      </p>
                      <p className="font-body text-sm text-foreground/60">
                        Receive booking alerts via SMS
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.smsNotifications}
                      onCheckedChange={(checked) =>
                        setSystemSettings({
                          ...systemSettings,
                          smsNotifications: checked,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body font-medium text-foreground">
                        Auto Backup
                      </p>
                      <p className="font-body text-sm text-foreground/60">
                        Automatically backup data daily
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.autoBackup}
                      onCheckedChange={(checked) =>
                        setSystemSettings({
                          ...systemSettings,
                          autoBackup: checked,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-body font-medium">
                      Booking Timeout (Hours)
                    </Label>
                    <Input
                      type="number"
                      value={systemSettings.bookingTimeout}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          bookingTimeout: parseInt(e.target.value),
                        })
                      }
                      className="font-body w-24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={handleSystemUpdate}
                disabled={isLoading}
                className="velvet-button text-primary-foreground font-body hover:scale-105 transform transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Save Settings</span>
                  </div>
                )}
              </Button>
            </div>
          </motion.div>
        </TabsContent>

        {/* Backup & Export */}
        <TabsContent value="backup">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-6"
          >
            <Card className="luxury-card border-0">
              <CardHeader>
                <CardTitle className="font-heading velvet-text flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Data Export</span>
                </CardTitle>
                <CardDescription className="font-body">
                  Export your data for backup or analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={handleDataExport}
                    disabled={isLoading}
                    className="velvet-button text-primary-foreground font-body hover:scale-105 transform transition-all duration-200 p-6"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <FileText className="h-6 w-6" />
                      <span>Export All Data</span>
                      <span className="text-xs opacity-80">CSV Format</span>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="font-body hover:scale-105 transform transition-all duration-200 p-6"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="h-6 w-6" />
                      <span>Import Data</span>
                      <span className="text-xs opacity-80">CSV Format</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="luxury-card border-0">
              <CardHeader>
                <CardTitle className="font-heading velvet-text flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Backup History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: "2024-12-23", size: "2.3 MB", status: "Completed" },
                    { date: "2024-12-22", size: "2.1 MB", status: "Completed" },
                    { date: "2024-12-21", size: "1.9 MB", status: "Completed" },
                  ].map((backup, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-cream-100/50 to-transparent rounded-lg"
                    >
                      <div>
                        <p className="font-body font-medium text-sm text-foreground">
                          Backup - {backup.date}
                        </p>
                        <p className="font-body text-xs text-foreground/60">
                          Size: {backup.size}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-700 border-green-200 text-xs"
                        >
                          {backup.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          className="font-body text-xs"
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
