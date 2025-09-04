import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Archive, 
  CheckCircle, 
  XCircle, 
  Eye, 
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';
import { 
  useAllQualifications, 
  useCustomQualificationRequests, 
  useCreateQualification,
  useUpdateQualification,
  useReviewCustomQualification,
  PopularQualification 
} from '@/hooks/useQualifications';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'personal_training', label: 'Personal Training' },
  { value: 'strength_training', label: 'Strength Training' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'pilates', label: 'Pilates' },
  { value: 'crossfit', label: 'CrossFit' },
  { value: 'functional_training', label: 'Functional Training' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'dance_fitness', label: 'Dance Fitness' },
  { value: 'barre', label: 'Barre' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'massage_therapy', label: 'Massage Therapy' },
  { value: 'hiit', label: 'HIIT' },
  { value: 'movement_assessment', label: 'Movement Assessment' },
  { value: 'specialty', label: 'Specialty' },
  { value: 'corrective_exercise', label: 'Corrective Exercise' },
  { value: 'performance', label: 'Performance' },
  { value: 'group_fitness', label: 'Group Fitness' },
  { value: 'martial_arts', label: 'Martial Arts' },
  { value: 'general', label: 'General' },
];

interface QualificationFormData {
  name: string;
  category: string;
  description: string;
  requires_verification: boolean;
  is_active: boolean;
}

const QualificationForm = ({ 
  qualification, 
  onSubmit, 
  onClose 
}: { 
  qualification?: PopularQualification;
  onSubmit: (data: QualificationFormData) => void;
  onClose: () => void;
}) => {
  const [formData, setFormData] = useState<QualificationFormData>({
    name: qualification?.name || '',
    category: qualification?.category || 'general',
    description: qualification?.description || '',
    requires_verification: qualification?.requires_verification || false,
    is_active: qualification?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Qualification name is required');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Qualification Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., NASM Certified Personal Trainer"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Optional description of the qualification"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="requires_verification"
          checked={formData.requires_verification}
          onCheckedChange={(checked) => setFormData({ ...formData, requires_verification: checked })}
        />
        <Label htmlFor="requires_verification">Requires certificate verification</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active (visible to trainers)</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">
          {qualification ? 'Update' : 'Create'} Qualification
        </Button>
      </div>
    </form>
  );
};

export const QualificationManagement = () => {
  const [selectedQualification, setSelectedQualification] = useState<PopularQualification | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  const { data: qualifications, isLoading: qualificationsLoading } = useAllQualifications();
  const { data: pendingRequests, isLoading: requestsLoading } = useCustomQualificationRequests('pending');
  
  const createQualification = useCreateQualification();
  const updateQualification = useUpdateQualification();
  const reviewRequest = useReviewCustomQualification();

  const handleCreateQualification = (data: QualificationFormData) => {
    const maxOrder = Math.max(...(qualifications?.map(q => q.display_order) || [0]));
    createQualification.mutate({
      ...data,
      display_order: maxOrder + 1,
    });
    setIsFormOpen(false);
  };

  const handleUpdateQualification = (data: QualificationFormData) => {
    if (selectedQualification) {
      updateQualification.mutate({
        id: selectedQualification.id,
        updates: data,
      });
      setIsFormOpen(false);
      setSelectedQualification(null);
    }
  };

  const handleReviewRequest = (requestId: string, status: 'approved' | 'rejected', adminNotes?: string, promoteToPopular?: boolean) => {
    reviewRequest.mutate({
      id: requestId,
      status,
      admin_notes: adminNotes,
      promote_to_popular: promoteToPopular,
    });
    setReviewDialogOpen(false);
    setSelectedRequest(null);
  };

  const openEditForm = (qualification: PopularQualification) => {
    setSelectedQualification(qualification);
    setIsFormOpen(true);
  };

  const openReviewDialog = (request: any) => {
    setSelectedRequest(request);
    setReviewDialogOpen(true);
  };

  if (qualificationsLoading) {
    return <div>Loading qualifications...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Qualification Management</h1>
          <p className="text-muted-foreground">
            Manage popular qualifications and review trainer requests
          </p>
        </div>
      </div>

      <Tabs defaultValue="qualifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="qualifications" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Qualifications
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Custom Requests
            {pendingRequests && pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-1">
                {pendingRequests.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qualifications" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Popular Qualifications</h2>
            <Dialog open={isFormOpen && !selectedQualification} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setSelectedQualification(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Qualification
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add New Qualification</DialogTitle>
                </DialogHeader>
                <QualificationForm
                  onSubmit={handleCreateQualification}
                  onClose={() => setIsFormOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qualifications?.map((qualification) => (
                    <TableRow key={qualification.id}>
                      <TableCell className="font-medium">{qualification.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {CATEGORIES.find(c => c.value === qualification.category)?.label || qualification.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={qualification.is_active ? "default" : "secondary"}>
                          {qualification.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {qualification.requires_verification ? (
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Required
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            Optional
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditForm(qualification)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Edit Form Dialog */}
          <Dialog open={isFormOpen && !!selectedQualification} onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setSelectedQualification(null);
          }}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Qualification</DialogTitle>
              </DialogHeader>
              {selectedQualification && (
                <QualificationForm
                  qualification={selectedQualification}
                  onSubmit={handleUpdateQualification}
                  onClose={() => {
                    setIsFormOpen(false);
                    setSelectedQualification(null);
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <h2 className="text-lg font-semibold">Custom Qualification Requests</h2>
          
          {requestsLoading ? (
            <div>Loading requests...</div>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Qualification</TableHead>
                      <TableHead>Trainer</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests?.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.qualification_name}</TableCell>
                        <TableCell>
                          Trainer #{request.trainer_id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {CATEGORIES.find(c => c.value === request.category)?.label || request.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(request.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openReviewDialog(request)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Review Request Dialog */}
          <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Review Qualification Request</DialogTitle>
              </DialogHeader>
              {selectedRequest && (
                <div className="space-y-4">
                  <div>
                    <Label>Qualification Name</Label>
                    <p className="font-medium">{selectedRequest.qualification_name}</p>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <p>{CATEGORIES.find(c => c.value === selectedRequest.category)?.label}</p>
                  </div>
                  {selectedRequest.description && (
                    <div>
                      <Label>Description</Label>
                      <p>{selectedRequest.description}</p>
                    </div>
                  )}
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => handleReviewRequest(selectedRequest.id, 'rejected')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleReviewRequest(selectedRequest.id, 'approved')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Only
                    </Button>
                    <Button
                      onClick={() => handleReviewRequest(selectedRequest.id, 'approved', undefined, true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Approve & Add to Popular
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <h2 className="text-lg font-semibold">Qualification Analytics</h2>
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Analytics dashboard showing qualification usage, trends, and verification rates will be available here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};