import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X,
  User,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  MapPin,
  Plane,
  DollarSign,
  Clock,
  Check,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { CreateBookingRequest, PassengerInfo } from '@shared/api';

interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: {
    id: string;
    airline: string;
    flightNumber: string;
    departureDate: string;
    departureTime: string;
    sellingPrice: number;
    country: string;
    availableSeats: number;
  } | null;
}

export default function BookingDialog({ isOpen, onClose, ticket }: BookingDialogProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const [agentInfo, setAgentInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const [passengerInfo, setPassengerInfo] = useState<PassengerInfo>({
    name: '',
    passportNo: '',
    phone: '',
    paxCount: 1,
    email: ''
  });

  const [bookingDetails, setBookingDetails] = useState({
    sellingPrice: ticket?.sellingPrice || 0,
    paymentType: 'full' as 'full' | 'partial',
    partialAmount: 0,
    comments: ''
  });

  const [paymentInfo, setPaymentInfo] = useState({
    method: 'cash',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: ''
  });

  const resetForm = () => {
    setStep(1);
    setBookingSuccess(false);
    setAgentInfo({ name: '', phone: '', email: '' });
    setPassengerInfo({ name: '', passportNo: '', phone: '', paxCount: 1, email: '' });
    setBookingDetails({ 
      sellingPrice: ticket?.sellingPrice || 0, 
      paymentType: 'full', 
      partialAmount: 0, 
      comments: '' 
    });
    setPaymentInfo({
      method: 'cash',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardHolderName: ''
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleNextStep = () => {
    setStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const calculateTotal = () => {
    const basePrice = bookingDetails.sellingPrice * passengerInfo.paxCount;
    return bookingDetails.paymentType === 'partial' && bookingDetails.partialAmount > 0
      ? bookingDetails.partialAmount
      : basePrice;
  };

  const handleSubmitBooking = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setBookingSuccess(true);
      setStep(4);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = (stepNumber: number) => {
    switch (stepNumber) {
      case 1: return 'Agent Information';
      case 2: return 'Passenger Details';
      case 3: return 'Payment Information';
      case 4: return 'Booking Confirmation';
      default: return 'Booking Process';
    }
  };

  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="luxury-card border-0 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl velvet-text flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-luxury-gold to-luxury-bronze rounded-full">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span>Book Flight - {ticket.airline}</span>
          </DialogTitle>
          <DialogDescription className="font-body">
            {getStepTitle(step)} • Step {step} of 4
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Flight Summary */}
          <Card className="bg-gradient-to-r from-cream-100 to-cream-200 border-border/30">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm font-body">
                <div className="flex items-center space-x-2">
                  <Plane className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">{ticket.airline}</p>
                    <p className="text-foreground/60">{ticket.flightNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">{ticket.departureDate}</p>
                    <p className="text-foreground/60">{ticket.departureTime}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-semibold text-foreground">Dhaka → {ticket.country}</p>
                    <p className="text-foreground/60">{ticket.availableSeats} seats available</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-600">৳{ticket.sellingPrice.toLocaleString()}</p>
                    <p className="text-foreground/60">per passenger</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-body font-semibold ${
                  stepNum <= step 
                    ? 'bg-gradient-to-br from-luxury-gold to-luxury-bronze text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum < step ? <Check className="h-4 w-4" /> : stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-20 h-1 ${
                    stepNum < step ? 'bg-gradient-to-r from-luxury-gold to-luxury-bronze' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="luxury-card border-0">
                  <CardHeader>
                    <CardTitle className="font-heading velvet-text flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Agent/Seller Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-body font-medium">Agent Name *</Label>
                        <Input
                          value={agentInfo.name}
                          onChange={(e) => setAgentInfo({...agentInfo, name: e.target.value})}
                          placeholder="Enter agent name"
                          className="font-body"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body font-medium">Phone Number *</Label>
                        <Input
                          value={agentInfo.phone}
                          onChange={(e) => setAgentInfo({...agentInfo, phone: e.target.value})}
                          placeholder="+8801234567890"
                          className="font-body"
                          required
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="font-body font-medium">Email Address (Optional)</Label>
                        <Input
                          type="email"
                          value={agentInfo.email}
                          onChange={(e) => setAgentInfo({...agentInfo, email: e.target.value})}
                          placeholder="agent@example.com"
                          className="font-body"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="luxury-card border-0">
                  <CardHeader>
                    <CardTitle className="font-heading velvet-text flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Passenger Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-body font-medium">Passenger Name *</Label>
                        <Input
                          value={passengerInfo.name}
                          onChange={(e) => setPassengerInfo({...passengerInfo, name: e.target.value})}
                          placeholder="As per passport"
                          className="font-body"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body font-medium">Passport Number *</Label>
                        <Input
                          value={passengerInfo.passportNo}
                          onChange={(e) => setPassengerInfo({...passengerInfo, passportNo: e.target.value})}
                          placeholder="Passport number"
                          className="font-body"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body font-medium">Phone Number *</Label>
                        <Input
                          value={passengerInfo.phone}
                          onChange={(e) => setPassengerInfo({...passengerInfo, phone: e.target.value})}
                          placeholder="+8801234567890"
                          className="font-body"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body font-medium">Number of Passengers *</Label>
                        <Select 
                          value={passengerInfo.paxCount.toString()} 
                          onValueChange={(value) => setPassengerInfo({...passengerInfo, paxCount: parseInt(value)})}
                        >
                          <SelectTrigger className="font-body">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'Passenger' : 'Passengers'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="font-body font-medium">Email Address (Optional)</Label>
                        <Input
                          type="email"
                          value={passengerInfo.email}
                          onChange={(e) => setPassengerInfo({...passengerInfo, email: e.target.value})}
                          placeholder="passenger@example.com"
                          className="font-body"
                        />
                      </div>
                    </div>
                    
                    {/* Price Calculation */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-cream-100 to-cream-200 rounded-lg">
                      <h3 className="font-heading font-semibold velvet-text mb-2">Price Summary</h3>
                      <div className="space-y-2 text-sm font-body">
                        <div className="flex justify-between">
                          <span className="text-foreground/70">Price per passenger:</span>
                          <span className="font-semibold text-foreground">৳{ticket.sellingPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-foreground/70">Number of passengers:</span>
                          <span className="font-semibold text-foreground">{passengerInfo.paxCount}</span>
                        </div>
                        <div className="border-t border-border/30 pt-2 flex justify-between">
                          <span className="text-foreground/70 font-semibold">Total Amount:</span>
                          <span className="font-semibold text-primary text-lg">
                            ৳{(ticket.sellingPrice * passengerInfo.paxCount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="luxury-card border-0">
                  <CardHeader>
                    <CardTitle className="font-heading velvet-text flex items-center space-x-2">
                      <DollarSign className="h-5 w-5" />
                      <span>Payment Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="font-body font-medium">Selling Price *</Label>
                        <Input
                          type="number"
                          value={bookingDetails.sellingPrice}
                          onChange={(e) => setBookingDetails({...bookingDetails, sellingPrice: parseInt(e.target.value) || 0})}
                          className="font-body"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-body font-medium">Payment Type *</Label>
                        <Select 
                          value={bookingDetails.paymentType} 
                          onValueChange={(value: 'full' | 'partial') => setBookingDetails({...bookingDetails, paymentType: value})}
                        >
                          <SelectTrigger className="font-body">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Payment</SelectItem>
                            <SelectItem value="partial">Partial Payment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {bookingDetails.paymentType === 'partial' && (
                        <div className="space-y-2">
                          <Label className="font-body font-medium">Partial Amount *</Label>
                          <Input
                            type="number"
                            value={bookingDetails.partialAmount}
                            onChange={(e) => setBookingDetails({...bookingDetails, partialAmount: parseInt(e.target.value) || 0})}
                            placeholder="Enter partial amount"
                            className="font-body"
                            required
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label className="font-body font-medium">Comments (Optional)</Label>
                        <Textarea
                          value={bookingDetails.comments}
                          onChange={(e) => setBookingDetails({...bookingDetails, comments: e.target.value})}
                          placeholder="Any additional comments..."
                          className="font-body"
                        />
                      </div>
                    </div>
                    
                    {bookingDetails.paymentType === 'partial' && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="font-body font-semibold text-yellow-800">Partial Payment Notice</p>
                            <p className="font-body text-sm text-yellow-700">
                              This booking will be locked for 24 hours. Full payment must be completed within this time.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="luxury-card border-0">
                  <CardHeader>
                    <CardTitle className="font-heading velvet-text flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Payment Method</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={paymentInfo.method} onValueChange={(value) => setPaymentInfo({...paymentInfo, method: value})}>
                      <SelectTrigger className="font-body">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash Payment</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="mobile">Mobile Banking</SelectItem>
                      </SelectContent>
                    </Select>

                    {paymentInfo.method === 'card' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 md:col-span-2">
                          <Label className="font-body font-medium">Card Holder Name</Label>
                          <Input
                            value={paymentInfo.cardHolderName}
                            onChange={(e) => setPaymentInfo({...paymentInfo, cardHolderName: e.target.value})}
                            placeholder="Name on card"
                            className="font-body"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="font-body font-medium">Card Number</Label>
                          <Input
                            value={paymentInfo.cardNumber}
                            onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                            placeholder="1234 5678 9012 3456"
                            className="font-body"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-body font-medium">Expiry Date</Label>
                          <Input
                            value={paymentInfo.expiryDate}
                            onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                            placeholder="MM/YY"
                            className="font-body"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-body font-medium">CVV</Label>
                          <Input
                            value={paymentInfo.cvv}
                            onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                            placeholder="123"
                            className="font-body"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="luxury-card border-0 text-center">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold velvet-text mb-2">
                      Booking {bookingDetails.paymentType === 'full' ? 'Confirmed' : 'Locked'}!
                    </h3>
                    <p className="font-body text-foreground/70 mb-6">
                      {bookingDetails.paymentType === 'full' 
                        ? 'Your ticket has been successfully booked and confirmed.'
                        : 'Your ticket has been locked for 24 hours. Please complete the payment to confirm.'
                      }
                    </p>
                    
                    <div className="bg-gradient-to-r from-cream-100 to-cream-200 rounded-lg p-4 mb-6">
                      <div className="grid grid-cols-2 gap-4 text-sm font-body">
                        <div>
                          <p className="text-foreground/60">Booking ID</p>
                          <p className="font-semibold text-foreground">BT-{Date.now().toString().slice(-6)}</p>
                        </div>
                        <div>
                          <p className="text-foreground/60">Amount Paid</p>
                          <p className="font-semibold text-green-600">৳{calculateTotal().toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-foreground/60">Status</p>
                          <Badge variant="outline" className={
                            bookingDetails.paymentType === 'full' 
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }>
                            {bookingDetails.paymentType === 'full' ? 'Confirmed' : 'Locked'}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-foreground/60">Expires</p>
                          <p className="font-semibold text-foreground">
                            {bookingDetails.paymentType === 'full' ? 'N/A' : '24 hours'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            {step > 1 && step < 4 && (
              <Button onClick={handlePrevStep} variant="outline" className="font-body">
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            {step < 3 && (
              <Button 
                onClick={handleNextStep} 
                className="velvet-button text-primary-foreground font-body"
                disabled={
                  (step === 1 && !agentInfo.name.trim()) ||
                  (step === 2 && (!passengerInfo.name.trim() || !passengerInfo.passportNo.trim()))
                }
              >
                Next
              </Button>
            )}
            
            {step === 3 && (
              <Button 
                onClick={handleSubmitBooking}
                disabled={isSubmitting}
                className="velvet-button text-primary-foreground font-body"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4" />
                    <span>Confirm Booking</span>
                  </div>
                )}
              </Button>
            )}
            
            {step === 4 && (
              <Button onClick={handleClose} className="velvet-button text-primary-foreground font-body">
                Close
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
