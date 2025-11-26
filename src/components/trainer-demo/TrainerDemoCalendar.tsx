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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-4 w-4 text-primary" />
          Your Coaching Calendar
          <Badge variant="secondary" className="ml-auto text-xs">Demo</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Week View */}
        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day, index) => (
            <div key={day} className="text-center">
              <div className="text-xs font-medium text-muted-foreground">{day}</div>
              <div className={`text-sm mt-0.5 p-1.5 rounded ${
                index === 2 ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-muted/50'
              }`}>
                {weekDates[index].getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Today's Schedule */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-3.5 w-3.5" />
            Today's Schedule
          </div>
          
          {demoBookings.map((booking, index) => (
            <div key={index} className={`flex items-center justify-between p-2 rounded-lg border text-sm ${
              booking.status === 'available' 
                ? 'border-dashed border-muted-foreground/30 bg-muted/20' 
                : 'bg-card'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <div className="text-xs font-mono flex-shrink-0">{booking.time}</div>
                <div className="min-w-0">
                  <div className="font-medium text-xs truncate">{booking.client}</div>
                  {booking.type !== 'open' && (
                    <div className="text-xs text-muted-foreground truncate">{booking.type}</div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-shrink-0">
                {booking.status === 'confirmed' && (
                  <Badge variant="default" className="bg-green-500 text-xs px-2 py-0">
                    ✓
                  </Badge>
                )}
                {booking.status === 'pending' && (
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    ⏱
                  </Badge>
                )}
                {booking.status === 'available' && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    Open
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}