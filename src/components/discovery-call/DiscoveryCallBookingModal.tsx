import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, User, CheckCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useDiscoveryCallBooking } from '@/hooks/useDiscoveryCallBooking';
import { cn } from '@/lib/utils';

interface DiscoveryCallBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  trainer: {
    id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    profilePhotoUrl?: string;
  };
  onCallBooked?: () => void;
}

type BookingStep = 'date' | 'time' | 'notes' | 'confirmation';

export const DiscoveryCallBookingModal = ({ 
  isOpen, 
  onClose, 
  trainer,
  onCallBooked
}: DiscoveryCallBookingModalProps) => {
  const [currentStep, setCurrentStep] = useState<BookingStep>('date');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [bookingNotes, setBookingNotes] = useState('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [trainerSettings, setTrainerSettings] = useState<any>(null);
  const [bookedCall, setBookedCall] = useState<any>(null);

  const { 
    loading, 
    booking, 
    getTrainerSettings, 
    getAvailableSlots, 
    bookDiscoveryCall 
  } = useDiscoveryCallBooking();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('date');
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setBookingNotes('');
      setAvailableSlots([]);
      setTrainerSettings(null);
      setBookedCall(null);
      loadTrainerSettings();
    }
  }, [isOpen]);

  // Load available slots when date changes
  useEffect(() => {
    if (selectedDate && trainer.id) {
      loadAvailableSlots();
    }
  }, [selectedDate, trainer.id]);

  const loadTrainerSettings = async () => {
    const settings = await getTrainerSettings(trainer.id);
    setTrainerSettings(settings);
  };

  const loadAvailableSlots = async () => {
    if (selectedDate) {
      const slots = await getAvailableSlots(trainer.id, selectedDate);
      setAvailableSlots(slots);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(undefined);
    if (date) {
      setCurrentStep('time');
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep('notes');
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !trainerSettings) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(hours, minutes, 0, 0);

    const result = await bookDiscoveryCall(
      trainer.id,
      selectedDateTime,
      trainerSettings.discovery_call_duration,
      bookingNotes
    );

    if (result) {
      setBookedCall(result);
      setCurrentStep('confirmation');
    }
  };

  const handleClose = () => {
    setCurrentStep('date');
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    setBookingNotes('');
    setAvailableSlots([]);
    setTrainerSettings(null);
    setBookedCall(null);
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'date':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Select a Date</h3>
              <p className="text-sm text-muted-foreground">
                Choose a date for your {trainerSettings?.discovery_call_duration || 15}-minute discovery call
              </p>
            </div>
            
            <div className="flex justify-center">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => date < new Date() || date < new Date(Date.now() - 86400000)}
                className={cn("rounded-md border pointer-events-auto")}
              />
            </div>
          </div>
        );

      case 'time':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Select a Time</h3>
              <p className="text-sm text-muted-foreground">
                Available times for {selectedDate && format(selectedDate, 'EEEE, MMMM do')}
              </p>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Loading available times...</p>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    disabled={!slot.available}
                    onClick={() => handleTimeSelect(slot.time)}
                    className="h-12"
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No available slots for this date. Please select a different date.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('date')} className="flex-1">
                Back
              </Button>
              {selectedTime && (
                <Button onClick={() => setCurrentStep('notes')} className="flex-1">
                  Continue
                </Button>
              )}
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Add Notes (Optional)</h3>
              <p className="text-sm text-muted-foreground">
                Let {trainer.firstName || trainer.name} know what you'd like to discuss
              </p>
            </div>

            {/* Booking Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedDate && format(selectedDate, 'EEEE, MMMM do, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{selectedTime} ({trainerSettings?.discovery_call_duration || 15} minutes)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" />
                    <span>With {trainer.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="booking_notes">What would you like to discuss?</Label>
              <Textarea
                id="booking_notes"
                placeholder="e.g., I'm looking to improve my fitness for marathon training..."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {trainerSettings?.prep_notes && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Preparation Notes from {trainer.firstName}</h4>
                  <p className="text-sm text-blue-800">{trainerSettings.prep_notes}</p>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCurrentStep('time')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleBooking} disabled={booking} className="flex-1">
                {booking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </>
                ) : (
                  'Book Discovery Call'
                )}
              </Button>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">
                Discovery Call Booked!
              </h3>
              <p className="text-sm text-muted-foreground">
                Your discovery call has been successfully scheduled
              </p>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>{bookedCall && format(new Date(bookedCall.scheduled_for), 'EEEE, MMMM do, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{bookedCall && format(new Date(bookedCall.scheduled_for), 'HH:mm')} ({bookedCall?.duration_minutes} minutes)</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" />
                    <span>With {trainer.name}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                📧 You'll receive email confirmations and reminders (coming in Phase 4)
              </p>
            </div>

            <Button onClick={() => {
              onCallBooked?.();
              handleClose();
            }} className="w-full">
              Done
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!trainerSettings?.offers_discovery_call && isOpen) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Discovery Call Not Available</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-muted-foreground">
              {trainer.name} is not currently offering discovery calls.
            </p>
            <Button onClick={handleClose} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {trainer.profilePhotoUrl ? (
                <img 
                  src={trainer.profilePhotoUrl} 
                  alt={trainer.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium">
                  {trainer.firstName?.[0]}{trainer.lastName?.[0]}
                </span>
              )}
            </div>
            <div>
              <p className="font-semibold">Book Discovery Call</p>
              <p className="text-sm text-muted-foreground">with {trainer.name}</p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        {/* Progress indicator */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2">
            {['date', 'time', 'notes', 'confirmation'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                  currentStep === step 
                    ? "bg-primary text-primary-foreground" 
                    : index < ['date', 'time', 'notes', 'confirmation'].indexOf(currentStep)
                      ? "bg-green-500 text-white"
                      : "bg-muted text-muted-foreground"
                )}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={cn(
                    "w-8 h-0.5 mx-1",
                    index < ['date', 'time', 'notes', 'confirmation'].indexOf(currentStep)
                      ? "bg-green-500"
                      : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};