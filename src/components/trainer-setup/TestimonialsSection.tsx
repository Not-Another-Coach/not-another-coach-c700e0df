import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Upload, Plus, Trash2, Image, Quote, Star, Edit, X, Check, Save, Sparkles, RefreshCw } from "lucide-react";
import { EnhancedImageUpload } from "./EnhancedImageUpload";
import { SectionHeader } from './SectionHeader';
import { TestimonialAIHelper } from './TestimonialAIHelper';
import { TestimonialEditModal } from './TestimonialEditModal';
import { toast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";

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
  
  // Modal state for editing
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  
  // AI Helper state
  const [aiHelperOpen, setAiHelperOpen] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Sync testimonials from parent formData changes
  useEffect(() => {
    setTestimonials(formData.testimonials || []);
  }, [formData.testimonials]);

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
      
      console.log('Added testimonial:', testimonial);
      console.log('Updated testimonials array:', updatedTestimonials);
      
      toast({
        title: "Testimonial added!",
        description: `Successfully added testimonial from ${testimonial.clientName}${testimonial.showImages ? ' with images' : ''}`,
      });
      
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

  // Modal functions for editing
  const openEditModal = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingTestimonial(null);
  };

  const handleEditSave = (updatedTestimonial: Testimonial) => {
    const updatedTestimonials = testimonials.map(t => 
      t.id === updatedTestimonial.id ? updatedTestimonial : t
    );
    setTestimonials(updatedTestimonials);
    updateFormData({ testimonials: updatedTestimonials });
  };

  // Image upload for new testimonials only
  const handleImageUpload = (imageUrl: string, type: 'before' | 'after') => {
    setNewTestimonial(prev => ({
      ...prev,
      [type === 'before' ? 'beforeImage' : 'afterImage']: imageUrl
    }));
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
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Quote className="h-4 w-4 text-primary" />
                        <span className="font-medium">{testimonial.clientName}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {testimonial.outcomeTags?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(testimonial)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTestimonial(testimonial.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
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
                               const target = e.currentTarget;
                               target.style.backgroundColor = '#f3f4f6';
                               target.style.display = 'flex';
                               target.style.alignItems = 'center';
                               target.style.justifyContent = 'center';
                               target.style.color = '#6b7280';
                               target.style.fontSize = '12px';
                               target.innerHTML = 'Image unavailable';
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
                               const target = e.currentTarget;
                               target.style.backgroundColor = '#f3f4f6';
                               target.style.display = 'flex';
                               target.style.alignItems = 'center';
                               target.style.justifyContent = 'center';
                               target.style.color = '#6b7280';
                               target.style.fontSize = '12px';
                               target.innerHTML = 'Image unavailable';
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

      {/* Add New Testimonial */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Client Testimonial
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
              <div className="flex items-center justify-between">
                <Label htmlFor="outcome_tags">Outcome Tags</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add tags
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    className="w-56 max-h-64 overflow-y-auto"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                  >
                    {outcomeTags.map((tag) => {
                      const selected = (newTestimonial.outcomeTags || []).includes(tag);
                      return (
                        <DropdownMenuCheckboxItem
                          key={tag}
                          checked={selected}
                          onSelect={(e) => e.preventDefault()}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              const updated = [...(newTestimonial.outcomeTags || []), tag];
                              setNewTestimonial({ ...newTestimonial, outcomeTags: updated });
                            } else {
                              const updated = (newTestimonial.outcomeTags || []).filter(t => t !== tag);
                              setNewTestimonial({ ...newTestimonial, outcomeTags: updated });
                            }
                          }}
                        >
                          {tag}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="border border-input bg-background rounded-md p-2 min-h-[40px]">
                {(newTestimonial.outcomeTags || []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(newTestimonial.outcomeTags || []).map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => {
                            const updatedTags = (newTestimonial.outcomeTags || []).filter(t => t !== tag);
                            setNewTestimonial({ ...newTestimonial, outcomeTags: updatedTags });
                          }}
                          className="text-xs hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tags selected</p>
                )}
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="achievement">What did this client achieve? *</Label>
              <Button
                variant="ai"
                size="sm"
                onClick={() => setAiHelperOpen(!aiHelperOpen)}
                disabled={isAiGenerating || (!newTestimonial.clientQuote?.trim() && !newTestimonial.outcomeTags?.length)}
              >
                {isAiGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Helper
                  </>
                )}
              </Button>
            </div>
            
            {/* AI Helper - positioned below label, matching Tab 1 pattern */}
            {aiHelperOpen && (
              <TestimonialAIHelper
                clientQuote={newTestimonial.clientQuote || ""}
                outcomeTags={newTestimonial.outcomeTags || []}
                onSuggestionSelect={(suggestion) => {
                  setNewTestimonial({ ...newTestimonial, achievement: suggestion });
                  setAiHelperOpen(false);
                }}
                isOpen={aiHelperOpen}
                autoGenerate={true}
                onGeneratingChange={setIsAiGenerating}
              />
            )}
            
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
                    
                    {/* Preview of uploaded images */}
                    <div className="flex gap-4 mt-3">
                      {newTestimonial.beforeImage && (
                        <div className="text-center">
                          <img 
                            src={newTestimonial.beforeImage} 
                            alt="Before preview"
                            className="w-20 h-20 object-cover rounded border-2 border-green-300"
                            onError={(e) => {
                              console.error('Error loading before image preview:', newTestimonial.beforeImage);
                            }}
                          />
                          <p className="text-xs text-green-600 mt-1">Before</p>
                        </div>
                      )}
                      {newTestimonial.afterImage && (
                        <div className="text-center">
                          <img 
                            src={newTestimonial.afterImage} 
                            alt="After preview"
                            className="w-20 h-20 object-cover rounded border-2 border-green-300"
                            onError={(e) => {
                              console.error('Error loading after image preview:', newTestimonial.afterImage);
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
          
          <Button 
            variant="secondary"
            onClick={addTestimonial}
            disabled={!newTestimonial.clientName || !newTestimonial.clientQuote || !newTestimonial.achievement || !newTestimonial.consentGiven}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Testimonial
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

      {/* Edit Modal */}
      <TestimonialEditModal
        testimonial={editingTestimonial}
        isOpen={editModalOpen}
        onClose={closeEditModal}
        onSave={handleEditSave}
      />
    </div>
  );
}
