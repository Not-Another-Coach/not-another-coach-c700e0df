import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EnhancedDatePickerProps {
  dueDays?: number;
  dueDate?: Date;
  slaDays?: number;
  slaHours?: number;
  businessDaysOnly?: boolean;
  autoCalculate?: boolean;
  reminderHours?: number;
  escalationHours?: number;
  onDueDaysChange?: (days: number | undefined) => void;
  onDueDateChange?: (date: Date | undefined) => void;
  onSlaHoursChange?: (hours: number | undefined) => void;
  onBusinessDaysOnlyChange?: (enabled: boolean) => void;
  onAutoCalculateChange?: (enabled: boolean) => void;
  onReminderHoursChange?: (hours: number | undefined) => void;
  onEscalationHoursChange?: (hours: number | undefined) => void;
}

export function EnhancedDatePicker({
  dueDays,
  dueDate,
  slaDays,
  slaHours,
  businessDaysOnly = false,
  autoCalculate = true,
  reminderHours = 24,
  escalationHours,
  onDueDaysChange,
  onDueDateChange,
  onSlaHoursChange,
  onBusinessDaysOnlyChange,
  onAutoCalculateChange,
  onReminderHoursChange,
  onEscalationHoursChange
}: EnhancedDatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);

  const calculateDueDate = (days: number, businessOnly: boolean): Date => {
    const start = new Date();
    if (!businessOnly) {
      const result = new Date(start);
      result.setDate(result.getDate() + days);
      return result;
    }

    // Calculate business days only
    let current = new Date(start);
    let daysAdded = 0;
    
    while (daysAdded < days) {
      current.setDate(current.getDate() + 1);
      const dayOfWeek = current.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }
    
    return current;
  };

  const calculatedDueDate = dueDays ? calculateDueDate(dueDays, businessDaysOnly) : null;
  const effectiveDueDate = autoCalculate ? calculatedDueDate : dueDate;

  const calculateSlaDate = (): Date | null => {
    if (!slaHours) return null;
    const start = new Date();
    const result = new Date(start);
    result.setHours(result.getHours() + slaHours);
    return result;
  };

  const slaDate = calculateSlaDate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Due Dates & SLA Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auto-calculate toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-calculate"
            checked={autoCalculate}
            onCheckedChange={onAutoCalculateChange}
          />
          <Label htmlFor="auto-calculate">Auto-calculate due dates</Label>
        </div>

        {autoCalculate ? (
          // Auto-calculation mode
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due in (days)</Label>
                <Input
                  type="number"
                  value={dueDays || ''}
                  onChange={(e) => onDueDaysChange?.(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 7"
                  min="0"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="business-days"
                  checked={businessDaysOnly}
                  onCheckedChange={onBusinessDaysOnlyChange}
                />
                <Label htmlFor="business-days" className="text-sm">
                  Business days only
                </Label>
              </div>
            </div>

            {calculatedDueDate && (
              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Calculated due date:</strong> {format(calculatedDueDate, 'PPP')}
                </span>
                {businessDaysOnly && (
                  <Badge variant="outline" className="text-xs">
                    Business days only
                  </Badge>
                )}
              </div>
            )}
          </div>
        ) : (
          // Manual date selection mode
          <div>
            <Label>Manual due date</Label>
            <Popover open={showCalendar} onOpenChange={setShowCalendar}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    onDueDateChange?.(date);
                    setShowCalendar(false);
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* SLA Configuration */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            SLA Configuration
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>SLA Hours</Label>
              <Input
                type="number"
                value={slaHours || ''}
                onChange={(e) => onSlaHoursChange?.(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="e.g., 24"
                min="0"
              />
            </div>
            <div>
              <Label>Reminder Hours</Label>
              <Select
                value={reminderHours?.toString() || '24'}
                onValueChange={(value) => onReminderHoursChange?.(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour before</SelectItem>
                  <SelectItem value="4">4 hours before</SelectItem>
                  <SelectItem value="12">12 hours before</SelectItem>
                  <SelectItem value="24">24 hours before</SelectItem>
                  <SelectItem value="48">48 hours before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Escalation Hours (Optional)</Label>
            <Input
              type="number"
              value={escalationHours || ''}
              onChange={(e) => onEscalationHoursChange?.(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="e.g., 72 (escalate after 72 hours)"
              min="0"
            />
          </div>

          {slaDate && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>SLA deadline:</strong> {format(slaDate, 'PPp')}
              </span>
            </div>
          )}
        </div>

        {/* Summary */}
        {(effectiveDueDate || slaDate) && (
          <div className="space-y-2 pt-4 border-t">
            <h4 className="text-sm font-medium">Timeline Summary</h4>
            <div className="space-y-1 text-sm">
              {effectiveDueDate && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Due Date:</span>
                  <span>{format(effectiveDueDate, 'MMM d, yyyy')}</span>
                </div>
              )}
              {slaDate && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">SLA Deadline:</span>
                  <span>{format(slaDate, 'MMM d, yyyy HH:mm')}</span>
                </div>
              )}
              {reminderHours && effectiveDueDate && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Reminder:</span>
                  <span>
                    {format(
                      new Date(effectiveDueDate.getTime() - reminderHours * 60 * 60 * 1000),
                      'MMM d, HH:mm'
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}