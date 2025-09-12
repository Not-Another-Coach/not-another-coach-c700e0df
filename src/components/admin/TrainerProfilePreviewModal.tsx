import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { ImageGallery } from './ImageGallery';
import { 
  User, 
  MapPin, 
  Clock, 
  DollarSign, 
  Shield, 
  CheckCircle, 
  XCircle,
  Star,
  Calendar,
  FileText,
  Award,
  Image,
  ExternalLink
} from 'lucide-react';

interface TrainerProfilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainerId: string;
  trainerName: string;
  requestId: string;
  onReview: (requestId: string, action: 'approved' | 'rejected', adminNotes: string, rejectionReason?: string) => void;
}

export const TrainerProfilePreviewModal = ({
  open,
  onOpenChange,
  trainerId,
  trainerName,
  requestId,
  onReview
}: TrainerProfilePreviewModalProps) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [reviewMode, setReviewMode] = useState<'viewing' | 'approving' | 'rejecting'>('viewing');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchProfile = async () => {
    if (!trainerId) return;
    
    setLoading(true);
    try {
      // Use the v_trainers view directly without complex joins
      const { data: profileData, error: profileError } = await supabase
        .from('v_trainers')
        .select('*')
        .eq('id', trainerId)
        .single();

      if (profileError) {
        console.error('Error fetching v_trainers profile:', profileError);
        // Fallback to basic profile
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', trainerId)
          .single();
          
        if (fallbackError) {
          throw fallbackError;
        }
        
        setProfile(fallbackData);
      } else {
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching trainer profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && trainerId) {
      fetchProfile();
      setReviewMode('viewing');
      setAdminNotes('');
      setRejectionReason('');
    }
  }, [open, trainerId]);

  const handleReviewSubmit = () => {
    const action = reviewMode === 'approving' ? 'approved' : 'rejected';
    onReview(requestId, action, adminNotes, action === 'rejected' ? rejectionReason : undefined);
    onOpenChange(false);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!profile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="text-center py-8">
            <p>Profile not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Review Profile: {trainerName}
          </DialogTitle>
        </DialogHeader>

        {reviewMode === 'viewing' ? (
          <div className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList>
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
                <TabsTrigger value="packages">Packages</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Name</label>
                        <p>{profile.first_name} {profile.last_name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Location</label>
                        <p className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {profile.location || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    
                    {profile.tagline && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tagline</label>
                        <p>{profile.tagline}</p>
                      </div>
                    )}
                    
                    {profile.bio && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Bio</label>
                        <p className="text-sm">{profile.bio}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Profile Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={profile.verification_status === 'verified' ? 'default' : 'secondary'}>
                          {profile.verification_status === 'verified' ? (
                            <><Shield className="w-3 h-3 mr-1" />Verified</>
                          ) : (
                            <><Clock className="w-3 h-3 mr-1" />Unverified</>
                          )}
                        </Badge>
                        <Badge variant={profile.profile_published ? 'default' : 'secondary'}>
                          {profile.profile_published ? 'Published' : 'Unpublished'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Services & Expertise</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Specializations */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Specializations</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(profile.trainer_specializations || profile.specializations || []).map((item: any, index: number) => (
                          <Badge key={index} variant="outline">
                            {item.specialty?.name || item.name || item}
                          </Badge>
                        ))}
                        {(!profile.trainer_specializations?.length && !profile.specializations?.length) && (
                          <p className="text-sm text-muted-foreground">No specializations added</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Training Types */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Training Types</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(profile.trainer_training_types || profile.training_types || []).map((item: any, index: number) => (
                          <Badge key={index} variant="outline">
                            {item.training_type?.name || item.name || item}
                          </Badge>
                        ))}
                        {(!profile.trainer_training_types?.length && !profile.training_types?.length) && (
                          <p className="text-sm text-muted-foreground">No training types added</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Qualifications */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Qualifications</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {(profile.trainer_qualifications || profile.qualifications || []).map((item: any, index: number) => (
                          <Badge key={index} variant="outline">
                            <Award className="w-3 h-3 mr-1" />
                            {item.qualification?.name || item.name || item}
                          </Badge>
                        ))}
                        {(!profile.trainer_qualifications?.length && !profile.qualifications?.length) && (
                          <p className="text-sm text-muted-foreground">No qualifications added</p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Format */}
                    {profile.delivery_format && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Delivery Format</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.delivery_format.map((format: string, index: number) => (
                            <Badge key={index} variant="outline">{format}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Coaching Style */}
                    {profile.coaching_style && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Coaching Style</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {profile.coaching_style.map((style: string, index: number) => (
                            <Badge key={index} variant="outline">{style}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="images" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Images</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Profile Photo */}
                    {profile.profile_photo_url && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Profile Photo</label>
                        <div className="mt-2">
                          <img
                            src={profile.profile_photo_url}
                            alt="Profile"
                            className="w-32 h-32 rounded-lg object-cover border"
                          />
                        </div>
                      </div>
                    )}

                    {/* Testimonial Images */}
                    {profile.testimonials && (
                      <div>
                        <ImageGallery
                          images={profile.testimonials
                            .filter((t: any) => t.image_url)
                            .map((t: any) => ({
                              url: t.image_url,
                              caption: t.text ? `"${t.text.substring(0, 50)}..."` : 'Testimonial image',
                              type: 'Testimonial'
                            }))}
                          title="Testimonial Images"
                        />
                      </div>
                    )}

                    {/* Professional Milestones Images */}
                    {profile.professional_milestones && (
                      <div>
                        <ImageGallery
                          images={Object.values(profile.professional_milestones)
                            .filter((milestone: any) => milestone.image_url)
                            .map((milestone: any) => ({
                              url: milestone.image_url,
                              caption: milestone.title || 'Professional milestone',
                              type: 'Achievement'
                            }))}
                          title="Achievement Images"
                        />
                      </div>
                    )}

                    {/* Uploaded Certificates */}
                    {profile.uploaded_certificates && (
                      <div>
                        <ImageGallery
                          images={Object.values(profile.uploaded_certificates)
                            .filter((cert: any) => cert.file_url)
                            .map((cert: any) => ({
                              url: cert.file_url,
                              caption: cert.name || 'Certificate',
                              type: 'Certificate'
                            }))}
                          title="Certificates"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="verification" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Verification Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        <Badge variant={profile.verification_status === 'verified' ? 'default' : 'secondary'}>
                          {profile.verification_status || 'Not verified'}
                        </Badge>
                      </div>
                      
                      {profile.admin_verification_notes && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Admin Notes</label>
                          <p className="text-sm bg-muted p-2 rounded">{profile.admin_verification_notes}</p>
                        </div>
                      )}

                      {profile.verification_documents && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Verification Documents</label>
                          <div className="mt-2 space-y-2">
                            {Object.entries(profile.verification_documents).map(([type, doc]: [string, any]) => (
                              <div key={type} className="flex items-center justify-between p-2 border rounded">
                                <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                                {doc.file_url && (
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="w-3 h-3 mr-1" />
                                      View
                                    </a>
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="packages" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Package Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.package_options ? (
                      <div className="space-y-4">
                        {Object.entries(profile.package_options).map(([key, pkg]: [string, any]) => (
                          <div key={key} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{pkg.name}</h4>
                              <Badge variant="outline">
                                <DollarSign className="w-3 h-3 mr-1" />
                                £{pkg.price}
                              </Badge>
                            </div>
                            {pkg.description && (
                              <p className="text-sm text-muted-foreground mb-2">{pkg.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {pkg.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {pkg.sessions} sessions
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No packages configured</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are about to {reviewMode === 'approving' ? 'approve' : 'reject'} the publication request for{' '}
              <span className="font-medium">{trainerName}</span>.
            </p>

            {reviewMode === 'rejecting' && (
              <div className="space-y-2">
                <Label>Rejection Reason *</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why the request is being rejected..."
                  rows={3}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Admin Notes (Optional)</Label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Any additional notes for internal use..."
                rows={2}
              />
            </div>

            {reviewMode === 'approving' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> If the trainer is already verified, their profile will be published immediately. 
                  If not verified, it will be published automatically once verification is completed.
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="gap-2">
          {reviewMode === 'viewing' ? (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button
                onClick={() => setReviewMode('rejecting')}
                variant="destructive"
                className="gap-1"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
              <Button
                onClick={() => setReviewMode('approving')}
                className="bg-green-600 hover:bg-green-700 gap-1"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setReviewMode('viewing')}
              >
                Back to Review
              </Button>
              <Button
                onClick={handleReviewSubmit}
                disabled={reviewMode === 'rejecting' && !rejectionReason.trim()}
                className={reviewMode === 'approving' ? 'bg-green-600 hover:bg-green-700' : ''}
                variant={reviewMode === 'rejecting' ? 'destructive' : 'default'}
              >
                {reviewMode === 'approving' ? 'Approve Request' : 'Reject Request'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};