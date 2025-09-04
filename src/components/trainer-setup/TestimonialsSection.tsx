import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Upload, Plus, Trash2, Image, Quote, Star, Edit, X, Check } from "lucide-react";
import { EnhancedImageUpload } from "./EnhancedImageUpload";
import { SectionHeader } from './SectionHeader';
import { TestimonialAIHelper } from './TestimonialAIHelper';

interface TestimonialsSectionProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

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

export function TestimonialsSection({ formData, updateFormData }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(formData.testimonials || []);
  const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({
    clientName: "",
    clientQuote: "",
    achievement: "",
    outcomeTags: [],
    consentGiven: false,
    showImages: false
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const addTestimonial = () => {
    if (newTestimonial.clientName && newTestimonial.clientQuote && newTestimonial.achievement) {
      const testimonial: Testimonial = {
        id: Date.now().toString(),
        clientName: newTestimonial.clientName || "",
        clientQuote: newTestimonial.clientQuote || "",
        achievement: newTestimonial.achievement || "",
        outcomeTags: newTestimonial.outcomeTags || [],
        consentGiven: newTestimonial.consentGiven || false,
        showImages: newTestimonial.showImages || false,
        beforeImage: newTestimonial.beforeImage,
        afterImage: newTestimonial.afterImage
      };
      
      const updatedTestimonials = [...testimonials, testimonial];
      setTestimonials(updatedTestimonials);
      updateFormData({ testimonials: updatedTestimonials });
      
      setNewTestimonial({
        clientName: "",
        clientQuote: "",
        achievement: "",
        outcomeTags: [],
        consentGiven: false,
        showImages: false
      });
    }
  };

  const removeTestimonial = (id: string) => {
    const updatedTestimonials = testimonials.filter(testimonial => testimonial.id !== id);
    setTestimonials(updatedTestimonials);
    updateFormData({ testimonials: updatedTestimonials });
  };

  const handleImageUpload = (imageUrl: string, type: 'before' | 'after') => {
    if (editingId) {
      const updatedTestimonials = testimonials.map(t => 
        t.id === editingId
          ? { ...t, [type === 'before' ? 'beforeImage' : 'afterImage']: imageUrl }
          : t
      );
      setTestimonials(updatedTestimonials);
      updateFormData({ testimonials: updatedTestimonials });
    } else {
      setNewTestimonial(prev => ({
        ...prev,
        [type === 'before' ? 'beforeImage' : 'afterImage']: imageUrl
      }));
    }
  };

  const startEditing = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setNewTestimonial({
      clientName: testimonial.clientName,
      clientQuote: testimonial.clientQuote,
      achievement: testimonial.achievement,
      outcomeTags: testimonial.outcomeTags || [],
      consentGiven: testimonial.consentGiven,
      showImages: testimonial.showImages,
      beforeImage: testimonial.beforeImage,
      afterImage: testimonial.afterImage
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewTestimonial({
      clientName: "",
      clientQuote: "",
      achievement: "",
      outcomeTags: [],
      consentGiven: false,
      showImages: false
    });
  };

  const saveEdit = () => {
    if (newTestimonial.clientName && newTestimonial.clientQuote && newTestimonial.achievement && editingId) {
      const updatedTestimonials = testimonials.map(t => 
        t.id === editingId
          ? {
              ...t,
              clientName: newTestimonial.clientName || "",
              clientQuote: newTestimonial.clientQuote || "",
              achievement: newTestimonial.achievement || "",
              outcomeTags: newTestimonial.outcomeTags || [],
              consentGiven: newTestimonial.consentGiven || false,
              showImages: newTestimonial.showImages || false,
              beforeImage: newTestimonial.beforeImage,
              afterImage: newTestimonial.afterImage
            }
          : t
      );
      setTestimonials(updatedTestimonials);
      updateFormData({ testimonials: updatedTestimonials });
      cancelEditing();
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        icons={[Quote, Star]}
        title="Testimonials & Case Studies"
        description="Showcase your client success stories and transformations"
      />
      
      {/* Existing Testimonials */}
      {testimonials.length > 0 && (
        <div className="space-y-4">
          <Label>Client Testimonials</Label>
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Quote className="h-4 w-4 text-primary" />
                      <span className="font-medium">{testimonial.clientName}</span>
                      {testimonial.outcomeTags?.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(testimonial)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs sm:text-sm w-full sm:w-auto"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTestimonial(testimonial.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm w-full sm:w-auto"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                        <span className="hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <blockquote className="text-sm italic border-l-4 border-primary pl-4">
                    "{testimonial.clientQuote}"
                  </blockquote>
                  <p className="text-sm font-medium">Achievement: {testimonial.achievement}</p>
                   {testimonial.showImages && (testimonial.beforeImage || testimonial.afterImage) && (
                     <div className="flex gap-6 mt-4">
                       {testimonial.beforeImage && (
                         <div className="text-center">
                           <img 
                             src={testimonial.beforeImage} 
                             alt="Before transformation"
                             className="w-32 h-32 object-cover rounded-lg border-2 cursor-pointer hover:scale-105 transition-transform"
                             onClick={() => window.open(testimonial.beforeImage, '_blank')}
                             onError={(e) => {
                               console.error('Error loading before image:', testimonial.beforeImage);
                               e.currentTarget.style.display = 'none';
                             }}
                           />
                           <p className="text-xs text-muted-foreground mt-2 font-medium">Before</p>
                         </div>
                       )}
                       {testimonial.afterImage && (
                         <div className="text-center">
                           <img 
                             src={testimonial.afterImage} 
                             alt="After transformation"
                             className="w-32 h-32 object-cover rounded-lg border-2 cursor-pointer hover:scale-105 transition-transform"
                             onClick={() => window.open(testimonial.afterImage, '_blank')}
                             onError={(e) => {
                               console.error('Error loading after image:', testimonial.afterImage);
                               e.currentTarget.style.display = 'none';
                             }}
                           />
                           <p className="text-xs text-muted-foreground mt-2 font-medium">After</p>
                         </div>
                       )}
                     </div>
                   )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>✅ Consent given</span>
                    {testimonial.showImages && <span>📸 Images included</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Testimonial */}
      <Card className={editingId ? "border-blue-200 bg-blue-50/50" : ""}>
        {editingId && (
          <div className="bg-blue-100 border-b border-blue-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700">
                <Edit className="h-4 w-4" />
                <span className="font-medium">Editing testimonial</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEditing}
                className="text-blue-600 hover:text-blue-700"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {editingId ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {editingId ? "Edit Client Testimonial" : "Add Client Testimonial"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name (First name only)</Label>
              <Input
                id="client_name"
                value={newTestimonial.clientName || ""}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, clientName: e.target.value })}
                placeholder="e.g., Sarah M."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="outcome_tags">Outcome Tags</Label>
              <div className="border border-input bg-background rounded-md p-2 min-h-[40px]">
                <div className="flex flex-wrap gap-2 mb-2">
                  {(newTestimonial.outcomeTags || []).map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const updatedTags = (newTestimonial.outcomeTags || []).filter(t => t !== tag);
                          setNewTestimonial({ ...newTestimonial, outcomeTags: updatedTags });
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
                    if (e.target.value && !(newTestimonial.outcomeTags || []).includes(e.target.value)) {
                      const updatedTags = [...(newTestimonial.outcomeTags || []), e.target.value];
                      setNewTestimonial({ ...newTestimonial, outcomeTags: updatedTags });
                    }
                  }}
                  className="w-full text-sm bg-transparent border-none outline-none"
                >
                  <option value="">Add outcome tag...</option>
                  {outcomeTags.filter(tag => !(newTestimonial.outcomeTags || []).includes(tag)).map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client_quote">Client Quote *</Label>
            <Textarea
              id="client_quote"
              value={newTestimonial.clientQuote || ""}
              onChange={(e) => setNewTestimonial({ ...newTestimonial, clientQuote: e.target.value })}
              placeholder="What did this client say about working with you? Keep it authentic and specific."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* AI Helper for Achievement */}
          <TestimonialAIHelper
            clientQuote={newTestimonial.clientQuote || ""}
            outcomeTags={newTestimonial.outcomeTags || []}
            onSuggestionSelect={(suggestion) => 
              setNewTestimonial({ ...newTestimonial, achievement: suggestion })
            }
          />
          
          <div className="space-y-2">
            <Label htmlFor="achievement">What did this client achieve? *</Label>
            <Input
              id="achievement"
              value={newTestimonial.achievement || ""}
              onChange={(e) => setNewTestimonial({ ...newTestimonial, achievement: e.target.value })}
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
                checked={newTestimonial.showImages || false}
                onCheckedChange={(checked) => setNewTestimonial({ ...newTestimonial, showImages: checked })}
              />
            </div>

            {newTestimonial.showImages && (
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
                    before: newTestimonial.beforeImage,
                    after: newTestimonial.afterImage
                  }}
                />
                {(newTestimonial.beforeImage || newTestimonial.afterImage) && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Images ready!</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      {newTestimonial.beforeImage && newTestimonial.afterImage 
                        ? "Both before and after images uploaded successfully"
                        : newTestimonial.beforeImage 
                          ? "Before image uploaded - add an after image to complete the transformation" 
                          : "After image uploaded - add a before image to show the transformation"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Consent Confirmation */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={newTestimonial.consentGiven || false}
              onCheckedChange={(checked) => setNewTestimonial({ ...newTestimonial, consentGiven: checked as boolean })}
            />
            <div className="space-y-1 leading-none">
              <Label
                htmlFor="consent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Client Consent Confirmation *
              </Label>
              <p className="text-xs text-muted-foreground">
                I confirm that I have obtained explicit consent from this client to use their testimonial
                {newTestimonial.showImages && " and images"} for marketing purposes.
              </p>
            </div>
          </div>
          
          {editingId && (
            <div className="flex gap-2 mb-4">
              <Button
                variant="outline" 
                size="sm"
                onClick={cancelEditing}
                className="text-gray-600 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Edit
              </Button>
            </div>
          )}
          
          <Button 
            onClick={editingId ? saveEdit : addTestimonial}
            disabled={!newTestimonial.clientName || !newTestimonial.clientQuote || !newTestimonial.achievement || !newTestimonial.consentGiven}
            className="w-full"
          >
            {editingId ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Testimonial
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <h4 className="font-medium text-green-900 mb-2">⭐ Testimonial Tips</h4>
          <ul className="text-xs text-green-700 space-y-1">
            <li>• Ask clients for feedback at their biggest wins (goal achievement, PRs, etc.)</li>
            <li>• Specific results are more compelling than generic praise</li>
            <li>• Before/after photos greatly increase testimonial impact</li>
            <li>• Always get written consent before using client content</li>
            <li>• Use first name only or initials to protect privacy</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
