import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, DollarSign, Calendar, MessageCircle } from "lucide-react";

interface TrainerProfilePreviewProps {
  formData: any;
}

export const TrainerProfilePreview = ({ formData }: TrainerProfilePreviewProps) => {
  const getInitials = () => {
    const first = formData.first_name?.charAt(0) || '';
    const last = formData.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || 'PT';
  };

  const formatRate = (rate: number, type: string) => {
    if (!rate) return null;
    const currency = formData.currency || 'GBP';
    const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€';
    return `${symbol}${rate}/${type === 'hourly' ? 'hour' : type === 'class' ? 'class' : 'month'}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Section */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage 
                  src={formData.profile_photo_url} 
                  alt={`${formData.first_name} ${formData.last_name}`} 
                />
                <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 mb-2">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="font-medium">4.9</span>
                <span className="text-sm text-muted-foreground">(23 reviews)</span>
              </div>
              <Badge variant="secondary" className="mb-2">
                {formData.client_status === 'open' ? 'Accepting Clients' : 
                 formData.client_status === 'waitlist' ? 'Waitlist Only' : 'Not Available'}
              </Badge>
            </div>

            {/* Main Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    {formData.first_name} {formData.last_name}
                  </h1>
                  {formData.tagline && (
                    <p className="text-lg text-muted-foreground mb-3">{formData.tagline}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                  {formData.free_discovery_call && (
                    <Button variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Free Call
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 mb-4">
                {formData.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {formData.location}
                  </div>
                )}
                {formData.year_certified && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {new Date().getFullYear() - formData.year_certified} years experience
                  </div>
                )}
              </div>

              {/* Rate Display */}
              <div className="flex gap-4 mb-4">
                {formData.selected_rate_types?.map((rateType: string) => {
                  const rate = formData[`${rateType}_rate`];
                  if (!rate) return null;
                  return (
                    <Badge key={rateType} variant="outline" className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {formatRate(rate, rateType)}
                    </Badge>
                  );
                })}
              </div>

              {/* Specializations */}
              {formData.specializations?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.specializations.map((spec: string) => (
                    <Badge key={spec} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bio Section */}
      {formData.bio && (
        <Card>
          <CardHeader>
            <CardTitle>About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{formData.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Training Types */}
      {formData.training_types?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Training Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formData.training_types.map((type: string) => (
                <Badge key={type} variant="outline">{type}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Packages */}
      {formData.package_options?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Training Packages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.package_options.map((pkg: any) => (
              <div key={pkg.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{pkg.name}</h4>
                  <Badge variant="secondary">
                    {pkg.currency === 'GBP' ? '£' : pkg.currency === 'USD' ? '$' : '€'}{pkg.price}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{pkg.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Testimonials */}
      {formData.testimonials?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Client Success Stories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.testimonials.map((testimonial: any) => (
              <div key={testimonial.id} className="border-l-4 border-primary pl-4">
                <blockquote className="text-sm italic mb-2">
                  "{testimonial.clientQuote}"
                </blockquote>
                <div className="flex items-center justify-between">
                  <cite className="text-sm font-medium">- {testimonial.clientName}</cite>
                  {testimonial.outcomeTag && (
                    <Badge variant="secondary" className="text-xs">{testimonial.outcomeTag}</Badge>
                  )}
                </div>
                {testimonial.achievement && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Achievement: {testimonial.achievement}
                  </p>
                )}
                {testimonial.showImages && (testimonial.beforeImage || testimonial.afterImage) && (
                  <div className="flex gap-2 mt-2">
                    {testimonial.beforeImage && (
                      <div className="text-center">
                        <img 
                          src={testimonial.beforeImage} 
                          alt="Before" 
                          className="w-16 h-16 object-cover rounded"
                        />
                        <p className="text-xs text-muted-foreground">Before</p>
                      </div>
                    )}
                    {testimonial.afterImage && (
                      <div className="text-center">
                        <img 
                          src={testimonial.afterImage} 
                          alt="After" 
                          className="w-16 h-16 object-cover rounded"
                        />
                        <p className="text-xs text-muted-foreground">After</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Availability */}
      {formData.availability_slots?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Group slots by day */}
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                const daySlots = formData.availability_slots.filter((slot: any) => slot.day === day);
                if (daySlots.length === 0) return null;
                
                return (
                  <div key={day} className="space-y-2">
                    <h5 className="font-medium">{day}</h5>
                    <div className="space-y-1">
                      {daySlots.map((slot: any) => (
                        <Badge key={slot.id} variant="outline" className="block w-fit">
                          {slot.startTime} - {slot.endTime}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};