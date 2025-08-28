import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  Link as LinkIcon,
  Video,
  Upload,
  FileText,
  Search
} from 'lucide-react';
import { useEnhancedActivities, EnhancedActivity } from '@/hooks/useEnhancedActivities';
import { EnhancedActivityBuilder } from '@/components/onboarding/EnhancedActivityBuilder';
import { useToast } from '@/hooks/use-toast';

const activityTypeIcons = {
  task: FileText,
  appointment: Calendar,
  survey: LinkIcon,
  training_content: Video,
  file_upload: Upload
};

const activityTypeColors = {
  task: 'bg-blue-100 text-blue-800',
  appointment: 'bg-green-100 text-green-800', 
  survey: 'bg-purple-100 text-purple-800',
  training_content: 'bg-orange-100 text-orange-800',
  file_upload: 'bg-pink-100 text-pink-800'
};

export const EnhancedActivityManagement = () => {
  const { activities, loading, createActivity, updateActivity, error } = useEnhancedActivities();
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingActivity, setEditingActivity] = useState<EnhancedActivity | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { toast } = useToast();

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.activity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || activity.category === categoryFilter;
    const matchesType = typeFilter === 'all' || activity.activity_type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const categories = [...new Set(activities.map(a => a.category))];

  const handleCreateActivity = async (activityData: Partial<EnhancedActivity>) => {
    try {
      await createActivity(activityData);
      setShowBuilder(false);
    } catch (error) {
      console.error('Failed to create activity:', error);
    }
  };

  const handleEditActivity = async (activityData: Partial<EnhancedActivity>) => {
    if (!editingActivity) return;
    
    try {
      await updateActivity(editingActivity.id, activityData);
      setEditingActivity(null);
      setShowBuilder(false);
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  };

  const openEditDialog = (activity: EnhancedActivity) => {
    setEditingActivity(activity);
    setShowBuilder(true);
  };

  const closeBuilder = () => {
    setShowBuilder(false);
    setEditingActivity(null);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-destructive">
            Error loading activities: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Enhanced Activities
            </CardTitle>
            <Button onClick={() => setShowBuilder(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Activity
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="task">Regular Task</SelectItem>
                <SelectItem value="appointment">Appointment</SelectItem>
                <SelectItem value="survey">Survey/Form</SelectItem>
                <SelectItem value="training_content">Training Content</SelectItem>
                <SelectItem value="file_upload">File Upload</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Activities List */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading activities...
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {activities.length === 0 ? (
                <>
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No activities created yet.</p>
                  <p className="text-sm">Create your first enhanced activity to get started.</p>
                </>
              ) : (
                <p>No activities match your current filters.</p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => {
                const Icon = activityTypeIcons[activity.activity_type];
                const typeColor = activityTypeColors[activity.activity_type];
                
                return (
                  <div 
                    key={activity.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <Icon className="h-5 w-5 text-primary" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{activity.activity_name}</h4>
                          <Badge className={typeColor}>
                            {activity.activity_type.replace('_', ' ')}
                          </Badge>
                          <Badge variant="secondary">
                            {activity.category}
                          </Badge>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(activity)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <EnhancedActivityBuilder
        isOpen={showBuilder}
        onClose={closeBuilder}
        onSave={editingActivity ? handleEditActivity : handleCreateActivity}
        activity={editingActivity || undefined}
        isEditing={!!editingActivity}
      />
    </>
  );
};