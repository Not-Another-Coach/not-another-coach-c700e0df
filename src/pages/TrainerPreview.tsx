import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAnonymousTrainerSession } from '@/hooks/useAnonymousTrainerSession';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Star, MapPin, Clock, Users, Eye, AlertCircle } from 'lucide-react';

export default function TrainerPreview() {
  const navigate = useNavigate();
  const { trainerProfile, updateTrainerProfile, trackInteraction } = useAnonymousTrainerSession();
  
  const [formData, setFormData] = useState({
    name: trainerProfile.name || '',
    tagline: trainerProfile.tagline || '',
    specialization: trainerProfile.specialization || '',
    hourlyRate: trainerProfile.hourlyRate || 50,
    location: trainerProfile.location || 'London, UK',
    bio: trainerProfile.bio || '',
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    trackInteraction('createdPreview');
  }, [trackInteraction]);

  const specializations = [
    'Weight Loss',
    'Strength Training',
    'Yoga & Flexibility',
    'Nutrition Coaching',
    'Athletic Performance',
    'Rehabilitation',
    'Mental Health & Wellness',
    'Seniors Fitness',
    'Prenatal Fitness',
    'Group Training'
  ];

  const handleInputChange = (field: string, value: string | number) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    updateTrainerProfile(newData);
  };

  const handleCreateProfile = () => {
    if (!formData.name || !formData.tagline || !formData.specialization) {
      return;
    }
    setShowPreview(true);
  };

  const handlePublishAttempt = () => {
    trackInteraction('attemptedPublish');
    navigate('/auth?intent=trainer-signup');
  };

  const isFormValid = formData.name && formData.tagline && formData.specialization;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/" className="text-2xl font-bold text-primary">
                NAC
              </Link>
              <Badge variant="secondary">Profile Preview</Badge>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/trainer/demo">← Back to Demo</Link>
              </Button>
              {showPreview && (
                <Button onClick={handlePublishAttempt}>
                  Publish Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!showPreview ? (
          /* Profile Builder Form */
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">
                Create Your Coach Profile Preview
              </h1>
              <p className="text-muted-foreground">
                Fill in these 3 essential fields to see how your profile would look to potential clients
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Just the essentials - you can add more details later
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Sarah Johnson"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagline">Professional Tagline *</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                    placeholder="e.g., Transforming lives through personalized fitness"
                  />
                  <p className="text-xs text-muted-foreground">
                    A short, compelling statement about your coaching approach
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Primary Specialization *</Label>
                  <Select value={formData.specialization} onValueChange={(value) => handleInputChange('specialization', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose your main area of expertise" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Optional Fields */}
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-4">Optional Details (enhance your preview)</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="e.g., London, UK"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate (£)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value) || 50)}
                        min="25"
                        max="200"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Short Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell potential clients a bit about your background and approach..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleCreateProfile} 
                  className="w-full" 
                  size="lg"
                  disabled={!isFormValid}
                >
                  {isFormValid ? 'Generate Profile Preview' : 'Complete Required Fields'}
                  <Eye className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Profile Preview */
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">
                Your Profile Preview
              </h1>
              <p className="text-muted-foreground">
                This is how potential clients would see your profile on NAC
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Profile Card */}
              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="p-0">
                    {/* Profile Header */}
                    <div className="relative h-48 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-t-lg">
                      <div className="absolute -bottom-12 left-6">
                        <div className="w-24 h-24 bg-primary/20 rounded-full border-4 border-background flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">
                            {formData.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <Badge className="absolute top-4 right-4">Preview Mode</Badge>
                    </div>

                    <div className="pt-16 p-6">
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-2xl font-bold">{formData.name}</h2>
                          <p className="text-lg text-muted-foreground">{formData.tagline}</p>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {formData.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            4.8 (24 reviews)
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            32 clients
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{formData.specialization}</Badge>
                          <Badge variant="outline">Verified Coach</Badge>
                          <Badge variant="outline">Available</Badge>
                        </div>

                        {formData.bio && (
                          <div>
                            <h3 className="font-semibold mb-2">About</h3>
                            <p className="text-muted-foreground">{formData.bio}</p>
                          </div>
                        )}

                        <div>
                          <h3 className="font-semibold mb-2">Specializations</h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">{formData.specialization}</Badge>
                            <Badge variant="outline">Beginner Friendly</Badge>
                            <Badge variant="outline">Online Sessions</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Booking Sidebar */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Book Session
                      <span className="text-2xl font-bold text-primary">£{formData.hourlyRate}</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">per hour</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" disabled>
                      <Clock className="mr-2 h-4 w-4" />
                      Book Discovery Call
                    </Button>
                    <Button variant="outline" className="w-full" disabled>
                      Send Message
                    </Button>
                    <Button variant="outline" className="w-full" disabled>
                      Add to Shortlist
                    </Button>
                    <div className="text-center text-xs text-muted-foreground">
                      💡 Interactions disabled in preview mode
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm">"Amazing trainer! Really helped me achieve my goals."</p>
                      <p className="text-xs text-muted-foreground">- Emma K.</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <p className="text-sm">"Professional, knowledgeable, and motivating!"</p>
                      <p className="text-xs text-muted-foreground">- Mike R.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Publish CTA */}
            <div className="mt-8 text-center bg-primary/5 rounded-lg p-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Ready to Go Live?</h2>
              </div>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Your profile looks great! To publish it and start connecting with clients, 
                you'll need to create your coach account and complete the verification process.
              </p>
              <div className="flex justify-center gap-4">
                <Button size="lg" onClick={handlePublishAttempt}>
                  Create Coach Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/trainer/demo">← Back to Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}