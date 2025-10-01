import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Star } from 'lucide-react';

export function TrainerDemoCalendar() {
  const demoBookings = [
    { time: '09:00', client: 'Sarah M.', type: 'Discovery Call', status: 'confirmed' },
    { time: '10:30', client: 'Mike R.', type: 'Training Session', status: 'confirmed' },
    { time: '14:00', client: 'Emma L.', type: 'Progress Review', status: 'pending' },
    { time: '16:00', client: 'Available Slot', type: 'open', status: 'available' },
    { time: '17:30', client: 'James K.', type: 'Training Session', status: 'confirmed' },
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDate = new Date();
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - currentDate.getDay() + 1 + i);
    return date;
  });

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Your Coaching Calendar
            <Badge variant="secondary" className="ml-auto">Demo Mode</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            This is how you would manage your client bookings and availability
          </p>
        </CardHeader>
        <CardContent>
          {/* Week View */}
          <div className="grid grid-cols-7 gap-2 mb-6">
            {weekDays.map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-sm font-medium text-muted-foreground">{day}</div>
                <div className={`text-lg mt-1 p-2 rounded-lg ${
                  index === 2 ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-muted/50'
                }`}>
                  {weekDates[index].getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Today's Schedule */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-medium">
              <Clock className="h-4 w-4" />
              Today's Schedule - Wednesday
            </div>
            
            {demoBookings.map((booking, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                booking.status === 'available' 
                  ? 'border-dashed border-muted-foreground/30 bg-muted/20' 
                  : 'bg-card'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-mono">{booking.time}</div>
                  <div>
                    <div className="font-medium">{booking.client}</div>
                    {booking.type !== 'open' && (
                      <div className="text-sm text-muted-foreground">{booking.type}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {booking.status === 'confirmed' && (
                    <Badge variant="default" className="bg-green-500">
                      Confirmed
                    </Badge>
                  )}
                  {booking.status === 'pending' && (
                    <Badge variant="secondary">
                      Pending
                    </Badge>
                  )}
                  {booking.status === 'available' && (
                    <Badge variant="outline">
                      Open Slot
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground mt-4">
        💡 Sign up to unlock full calendar management and client booking features
      </div>
    </div>
  );
}