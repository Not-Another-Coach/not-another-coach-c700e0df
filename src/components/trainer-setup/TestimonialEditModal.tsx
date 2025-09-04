import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, Save, X } from "lucide-react";
import { EnhancedImageUpload } from "./EnhancedImageUpload";
import { TestimonialAIHelper } from './TestimonialAIHelper';
import { toast } from "@/hooks/use-toast";

interface Testimonial {
  id: string;
  clientName: string;
  clientQuote: string;
  achievement: string;
  beforeImage?: string;
  afterImage?: string;
  outcomeTags: string[];
  consentGiven: boolean;
  showImages: boolean;
}

interface TestimonialEditModalProps {
  testimonial: Testimonial | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTestimonial: Testimonial) => void;
}

const outcomeTags = [
  "Lost 20kg",
  "Lost 10kg", 
  "Lost 5kg",
  "Gained strength",
  "Increased confidence",
  "Improved mobility",
  "Better sleep",
  "Reduced pain",
  "Built muscle",
  "Improved endurance",
  "Better mental health",
  "Lifestyle change",
  "Increased energy",
  "Better posture",
  "Injury recovery",
  "Competition ready",
  "Personal best achieved",
  "Habit formation"
];

export function TestimonialEditModal({ testimonial, isOpen, onClose, onSave }: TestimonialEditModalProps) {
  const [editData, setEditData] = useState<Partial<Testimonial>>({
    clientName: "",
    clientQuote: "",
    achievement: "",
    outcomeTags: [],
    consentGiven: false,
    showImages: false
  });

  // Update form data when testimonial prop changes
  useEffect(() => {
    if (testimonial && isOpen) {
      setEditData({
        clientName: testimonial.clientName,
        clientQuote: testimonial.clientQuote,
        achievement: testimonial.achievement,
        outcomeTags: testimonial.outcomeTags || [],
        consentGiven: testimonial.consentGiven,
        showImages: testimonial.showImages,
        beforeImage: testimonial.beforeImage,
        afterImage: testimonial.afterImage
      });
    }
  }, [testimonial, isOpen]);

  const handleImageUpload = (imageUrl: string, type: 'before' | 'after') => {
    setEditData(prev => ({
      ...prev,
      [type === 'before' ? 'beforeImage' : 'afterImage']: imageUrl
    }));
  };

  const handleSave = () => {
    if (!testimonial || !editData.clientName || !editData.clientQuote || !editData.achievement || !editData.consentGiven) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields and confirm consent.",
        variant: "destructive"
      });
      return;
    }

    const updatedTestimonial: Testimonial = {
      ...testimonial,
      clientName: editData.clientName || "",
      clientQuote: editData.clientQuote || "",
      achievement: editData.achievement || "",
      outcomeTags: editData.outcomeTags || [],
      consentGiven: editData.consentGiven || false,
      showImages: editData.showImages || false,
      beforeImage: editData.beforeImage,
      afterImage: editData.afterImage
    };

    onSave(updatedTestimonial);
    onClose();
    
    toast({
      title: "Testimonial updated!",
      description: `Successfully updated testimonial from ${editData.clientName}${editData.showImages ? ' with images' : ''}`,
    });
  };

  const handleClose = () => {
    onClose();
  };

  if (!testimonial) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Edit Testimonial for {testimonial.clientName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_client_name">Client Name (First name only) *</Label>
              <Input
                id="edit_client_name"
                value={editData.clientName || ""}
                onChange={(e) => setEditData({ ...editData, clientName: e.target.value })}
                placeholder="e.g., Sarah M."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit_outcome_tags">Outcome Tags</Label>
              <div className="border border-input bg-background rounded-md p-2 min-h-[40px]">
                <div className="flex flex-wrap gap-2 mb-2">
                  {(editData.outcomeTags || []).map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const updatedTags = (editData.outcomeTags || []).filter(t => t !== tag);
                          setEditData({ ...editData, outcomeTags: updatedTags });
                        }}
                        className="text-xs hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !(editData.outcomeTags || []).includes(e.target.value)) {
                      const updatedTags = [...(editData.outcomeTags || []), e.target.value];
                      setEditData({ ...editData, outcomeTags: updatedTags });
                    }
                  }}
                  className="w-full text-sm bg-transparent border-none outline-none"
                >
                  <option value="">Add outcome tag...</option>
                  {outcomeTags.filter(tag => !(editData.outcomeTags || []).includes(tag)).map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="edit_client_quote">Client Quote *</Label>
            <Textarea
              id="edit_client_quote"
              value={editData.clientQuote || ""}
              onChange={(e) => setEditData({ ...editData, clientQuote: e.target.value })}
              placeholder="What did this client say about working with you? Keep it authentic and specific."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* AI Helper for Achievement */}
          <TestimonialAIHelper
            clientQuote={editData.clientQuote || ""}
            outcomeTags={editData.outcomeTags || []}
            onSuggestionSelect={(suggestion) => 
              setEditData({ ...editData, achievement: suggestion })
            }
          />
          
          <div className="space-y-2">
            <Label htmlFor="edit_achievement">What did this client achieve? *</Label>
            <Input
              id="edit_achievement"
              value={editData.achievement || ""}
              onChange={(e) => setEditData({ ...editData, achievement: e.target.value })}
              placeholder="e.g., Lost 15kg and gained confidence to wear a bikini again"
            />
          </div>

          {/* Before/After Images Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Include Before/After Images</Label>
                <p className="text-sm text-muted-foreground">
                  Visual progress can be very compelling for potential clients
                </p>
              </div>
              <Switch
                checked={editData.showImages || false}
                onCheckedChange={(checked) => setEditData({ ...editData, showImages: checked })}
              />
            </div>

            {editData.showImages && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Client Before/After Images</Label>
                  <p className="text-xs text-muted-foreground mb-4">
                    Visual transformations are powerful for showcasing your results. Images will be stored securely.
                  </p>
                </div>
                <EnhancedImageUpload
                  onImageUpload={handleImageUpload}
                  existingImages={{
                    before: editData.beforeImage,
                    after: editData.afterImage
                  }}
                />
                {(editData.beforeImage || editData.afterImage) && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Images ready!</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      {editData.beforeImage && editData.afterImage 
                        ? "Both before and after images uploaded successfully"
                        : editData.beforeImage 
                          ? "Before image uploaded - add an after image to complete the transformation" 
                          : "After image uploaded - add a before image to show the transformation"}
                    </p>
                    
                    {/* Preview of uploaded images */}
                    <div className="flex gap-4 mt-3">
                      {editData.beforeImage && (
                        <div className="text-center">
                          <img 
                            src={editData.beforeImage} 
                            alt="Before preview"
                            className="w-20 h-20 object-cover rounded border-2 border-green-300"
                            onError={(e) => {
                              console.error('Error loading before image preview:', editData.beforeImage);
                            }}
                          />
                          <p className="text-xs text-green-600 mt-1">Before</p>
                        </div>
                      )}
                      {editData.afterImage && (
                        <div className="text-center">
                          <img 
                            src={editData.afterImage} 
                            alt="After preview"
                            className="w-20 h-20 object-cover rounded border-2 border-green-300"
                            onError={(e) => {
                              console.error('Error loading after image preview:', editData.afterImage);
                            }}
                          />
                          <p className="text-xs text-green-600 mt-1">After</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Consent Confirmation */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="edit_consent"
              checked={editData.consentGiven || false}
              onCheckedChange={(checked) => setEditData({ ...editData, consentGiven: checked as boolean })}
            />
            <div className="space-y-1 leading-none">
              <Label
                htmlFor="edit_consent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Client Consent Confirmation *
              </Label>
              <p className="text-xs text-muted-foreground">
                I confirm that I have obtained explicit consent from this client to use their testimonial
                {editData.showImages && " and images"} for marketing purposes.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!editData.clientName || !editData.clientQuote || !editData.achievement || !editData.consentGiven}
          >
            <Check className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}