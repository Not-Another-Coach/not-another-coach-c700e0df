import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Upload, 
  Camera,
  Shield,
  Eye,
  EyeOff,
  Save,
  Edit2
} from "lucide-react";

interface ProfileViewEditProps {
  profile: any;
}

export function ProfileViewEdit({ profile }: ProfileViewEditProps) {
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    profile_photo_url: profile?.profile_photo_url || "",
    card_last_four: profile?.card_last_four || "",
    card_type: profile?.card_type || "",
    card_expiry_month: profile?.card_expiry_month || "",
    card_expiry_year: profile?.card_expiry_year || "",
    billing_address: profile?.billing_address || {}
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('client-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: signed } = await supabase.storage
        .from('client-photos')
        .createSignedUrl(fileName, 60 * 60 * 24 * 7); // 7 days

      setFormData(prev => ({
        ...prev,
        profile_photo_url: signed?.signedUrl || ''
      }));

      toast({
        title: "Image uploaded successfully",
        description: "Your profile photo has been updated"
      });
    } catch (error) {
      console.error('Image upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEmailChange = async (newEmail: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      toast({
        title: "Email update initiated",
        description: "Please check both your old and new email for confirmation links",
      });
    } catch (error: any) {
      toast({
        title: "Email update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    try {
      // Update profile data
      const profileUpdates: any = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        profile_photo_url: formData.profile_photo_url,
        card_last_four: formData.card_last_four,
        card_type: formData.card_type,
        card_expiry_month: formData.card_expiry_month ? parseInt(formData.card_expiry_month.toString()) : null,
        card_expiry_year: formData.card_expiry_year ? parseInt(formData.card_expiry_year.toString()) : null,
        billing_address: formData.billing_address
      };

      await updateProfile(profileUpdates);

      // Handle email change separately if changed
      if (formData.email !== user?.email) {
        await handleEmailChange(formData.email);
      }

      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated"
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const maskCardNumber = (lastFour: string) => {
    return lastFour ? `•••• •••• •••• ${lastFour}` : "No card on file";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Profile Settings</h2>
          <p className="text-muted-foreground">
            Manage your personal information and preferences
          </p>
        </div>
        <Button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isUploading}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {/* Profile Photo Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Profile Photo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={formData.profile_photo_url} />
              <AvatarFallback className="text-lg">
                {formData.first_name?.[0]}{formData.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <div>
                <Label htmlFor="photo-upload" className="cursor-pointer">
                  <Button variant="outline" disabled={isUploading} asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? "Uploading..." : "Upload Photo"}
                    </span>
                  </Button>
                </Label>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
            />
            {isEditing && (
              <p className="text-xs text-muted-foreground mt-1">
                Changing your email will require verification
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
              placeholder="+44 20 7946 0958"
            />
          </div>
        </CardContent>
      </Card>

      {/* Payment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Information
            <Badge variant="outline" className="ml-auto">
              <Shield className="h-3 w-3 mr-1" />
              Secure
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Payment Method</p>
              <p className="text-sm text-muted-foreground">
                {maskCardNumber(formData.card_last_four)}
              </p>
              {formData.card_type && (
                <Badge variant="secondary" className="mt-1">
                  {formData.card_type}
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCardDetails(!showCardDetails)}
            >
              {showCardDetails ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  {isEditing ? "Edit" : "View"}
                </>
              )}
            </Button>
          </div>

          {showCardDetails && isEditing && (
            <>
              <Separator />
              <div className="space-y-4">
                <div>
                  <Label htmlFor="card_type">Card Type</Label>
                  <Select
                    value={formData.card_type}
                    onValueChange={(value) => handleInputChange('card_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select card type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                      <SelectItem value="amex">American Express</SelectItem>
                      <SelectItem value="discover">Discover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="card_last_four">Last 4 Digits</Label>
                  <Input
                    id="card_last_four"
                    value={formData.card_last_four}
                    onChange={(e) => handleInputChange('card_last_four', e.target.value)}
                    placeholder="1234"
                    maxLength={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="card_expiry_month">Expiry Month</Label>
                    <Select
                      value={formData.card_expiry_month.toString()}
                      onValueChange={(value) => handleInputChange('card_expiry_month', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <SelectItem key={month} value={month.toString()}>
                            {month.toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="card_expiry_year">Expiry Year</Label>
                    <Select
                      value={formData.card_expiry_year.toString()}
                      onValueChange={(value) => handleInputChange('card_expiry_year', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Full card details are processed securely and not stored in our database. 
                    Only the last 4 digits are saved for reference.
                  </p>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => {
            setIsEditing(false);
            setFormData({
              first_name: profile?.first_name || "",
              last_name: profile?.last_name || "",
              email: user?.email || "",
              phone: profile?.phone || "",
              profile_photo_url: profile?.profile_photo_url || "",
              card_last_four: profile?.card_last_four || "",
              card_type: profile?.card_type || "",
              card_expiry_month: profile?.card_expiry_month || "",
              card_expiry_year: profile?.card_expiry_year || "",
              billing_address: profile?.billing_address || {}
            });
          }}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}