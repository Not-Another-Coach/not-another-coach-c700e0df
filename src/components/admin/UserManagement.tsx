import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useUserRoles, AppRole, UserWithRoles, LoginHistory, AdminAction } from '@/hooks/useUserRoles';
import { 
  User, 
  Shield, 
  Crown, 
  UserCheck, 
  UserX, 
  AlertTriangle, 
  Clock, 
  MessageSquareOff, 
  Eye, 
  MoreHorizontal,
  Edit,
  Ban,
  CheckCircle,
  XCircle,
  StickyNote,
  History,
  KeyRound,
  Trash2,
  UserCog
} from 'lucide-react';

const roleColors = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  trainer: 'bg-blue-100 text-blue-800 border-blue-200', 
  client: 'bg-green-100 text-green-800 border-green-200'
};

const roleIcons = {
  admin: Crown,
  trainer: UserCheck,
  client: User
};

const statusColors = {
  active: 'bg-green-100 text-green-800',
  suspended: 'bg-orange-100 text-orange-800',
  locked: 'bg-red-100 text-red-800',
  deactivated: 'bg-gray-100 text-gray-800',
  banned: 'bg-red-200 text-red-900'
};

const statusIcons = {
  active: CheckCircle,
  suspended: Clock,
  locked: Ban,
  deactivated: UserX,
  banned: XCircle
};

export const UserManagement = () => {
  const { 
    users, 
    loading, 
    isAdmin, 
    fetchUsers, 
    addRole, 
    removeRole, 
    deleteUser,
    suspendUser,
    reactivateUser,
    updateAdminNotes,
    restrictCommunication,
    getLoginHistory,
    getAdminActions,
    updateProfile,
    forcePasswordReset
  } = useUserRoles();
  
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<AppRole>('client');
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [editingProfile, setEditingProfile] = useState<Partial<UserWithRoles>>({});
  const [suspensionForm, setSuspensionForm] = useState({ reason: '', duration: '' });
  const [notesForm, setNotesForm] = useState('');
  const [communicationForm, setCommunicationForm] = useState('');

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have admin privileges to access user management.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleAddRole = async (userId: string, role: AppRole) => {
    const result = await addRole(userId, role);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Role ${role} added successfully`
      });
    }
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    const result = await removeRole(userId, role);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: `Role ${role} removed successfully`
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await deleteUser(userId);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "User deleted successfully"
      });
    }
  };

  const handleSuspendUser = async () => {
    if (!selectedUser) return;
    
    const result = await suspendUser(
      selectedUser.id, 
      suspensionForm.reason,
      suspensionForm.duration ? parseInt(suspensionForm.duration) : undefined
    );
    
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "User suspended successfully"
      });
      setSuspensionForm({ reason: '', duration: '' });
    }
  };

  const handleReactivateUser = async (userId: string) => {
    const result = await reactivateUser(userId, 'Admin reactivation');
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "User reactivated successfully"
      });
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedUser) return;
    
    const result = await updateAdminNotes(selectedUser.id, notesForm);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Admin notes updated successfully"
      });
    }
  };

  const handleRestrictCommunication = async () => {
    if (!selectedUser) return;
    
    const result = await restrictCommunication(selectedUser.id, communicationForm);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Communication restricted successfully"
      });
    }
  };

  const handleUpdateProfile = async () => {
    if (!selectedUser) return;
    
    const result = await updateProfile(selectedUser.id, editingProfile);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      setEditingProfile({});
    }
  };

  const handleForcePasswordReset = async (userId: string) => {
    const result = await forcePasswordReset(userId);
    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Password reset will be required on next login"
      });
    }
  };

  const openUserDetails = async (user: UserWithRoles) => {
    setSelectedUser(user);
    setEditingProfile({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      user_type: user.user_type
    });
    setNotesForm(user.admin_notes || '');
    
    // Fetch login history and admin actions
    const history = await getLoginHistory(user.id);
    const actions = await getAdminActions(user.id);
    setLoginHistory(history);
    setAdminActions(actions);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading users...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="w-5 h-5" />
          User Management
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage user accounts, roles, and permissions
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Users Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const StatusIcon = statusIcons[user.account_status as keyof typeof statusIcons] || CheckCircle;
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {user.first_name && user.last_name 
                            ? `${user.first_name} ${user.last_name}`
                            : 'Unnamed User'
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email || 'No email'}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {user.id.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleColors[user.user_type as keyof typeof roleColors]}>
                        {user.user_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${statusColors[user.account_status as keyof typeof statusColors] || statusColors.active} flex items-center gap-1 w-fit`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {user.account_status || 'active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => {
                          const RoleIcon = roleIcons[role];
                          return (
                            <Badge 
                              key={role} 
                              variant="outline" 
                              className={`${roleColors[role]} flex items-center gap-1`}
                            >
                              <RoleIcon className="w-3 h-3" />
                              {role}
                              <button
                                onClick={() => handleRemoveRole(user.id, role)}
                                className="ml-1 hover:text-red-600"
                              >
                                ×
                              </button>
                            </Badge>
                          );
                        })}
                        
                        {/* Add Role Dropdown */}
                        <div className="flex items-center gap-1">
                          <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AppRole)}>
                            <SelectTrigger className="w-20 h-6 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="trainer">Trainer</SelectItem>
                              <SelectItem value="client">Client</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddRole(user.id, selectedRole)}
                            className="h-6 px-2 text-xs"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {user.last_login_at 
                          ? new Date(user.last_login_at).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* Quick Actions */}
                        {user.account_status === 'suspended' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReactivateUser(user.id)}
                            className="h-8 px-2"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        ) : null}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleForcePasswordReset(user.id)}
                          className="h-8 px-2"
                        >
                          <KeyRound className="w-3 h-3" />
                        </Button>

                        {/* View Details Dialog */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openUserDetails(user)}
                              className="h-8 px-2"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>User Management: {user.first_name} {user.last_name}</DialogTitle>
                            </DialogHeader>
                            
                            <Tabs defaultValue="profile" className="space-y-4">
                              <TabsList className="grid grid-cols-5 w-full">
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                <TabsTrigger value="status">Status</TabsTrigger>
                                <TabsTrigger value="notes">Notes</TabsTrigger>
                                <TabsTrigger value="history">History</TabsTrigger>
                                <TabsTrigger value="actions">Actions</TabsTrigger>
                              </TabsList>

                              <TabsContent value="profile" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input
                                      value={editingProfile.first_name || ''}
                                      onChange={(e) => setEditingProfile(prev => ({ ...prev, first_name: e.target.value }))}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input
                                      value={editingProfile.last_name || ''}
                                      onChange={(e) => setEditingProfile(prev => ({ ...prev, last_name: e.target.value }))}
                                    />
                                  </div>
                                  <div className="space-y-2 col-span-2">
                                    <Label>Email Address</Label>
                                    <Input
                                      type="email"
                                      value={editingProfile.email || ''}
                                      onChange={(e) => setEditingProfile(prev => ({ ...prev, email: e.target.value }))}
                                      placeholder="user@example.com"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>User Type</Label>
                                    <Select 
                                      value={editingProfile.user_type} 
                                      onValueChange={(value) => setEditingProfile(prev => ({ ...prev, user_type: value }))}
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="client">Client</SelectItem>
                                        <SelectItem value="trainer">Trainer</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <Button onClick={handleUpdateProfile}>Update Profile</Button>
                              </TabsContent>

                              <TabsContent value="status" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm">Suspend User</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <Input
                                        placeholder="Reason for suspension"
                                        value={suspensionForm.reason}
                                        onChange={(e) => setSuspensionForm(prev => ({ ...prev, reason: e.target.value }))}
                                      />
                                      <Input
                                        placeholder="Duration (days, optional)"
                                        type="number"
                                        value={suspensionForm.duration}
                                        onChange={(e) => setSuspensionForm(prev => ({ ...prev, duration: e.target.value }))}
                                      />
                                      <Button 
                                        onClick={handleSuspendUser}
                                        variant="destructive"
                                        disabled={!suspensionForm.reason}
                                      >
                                        Suspend User
                                      </Button>
                                    </CardContent>
                                  </Card>
                                  
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm">Communication</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <Textarea
                                        placeholder="Reason for restricting communication"
                                        value={communicationForm}
                                        onChange={(e) => setCommunicationForm(e.target.value)}
                                      />
                                      <Button 
                                        onClick={handleRestrictCommunication}
                                        variant="outline"
                                        disabled={!communicationForm}
                                      >
                                        <MessageSquareOff className="w-4 h-4 mr-2" />
                                        Restrict Communication
                                      </Button>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>

                              <TabsContent value="notes" className="space-y-4">
                                <div className="space-y-2">
                                  <Label>Admin Notes</Label>
                                  <Textarea
                                    placeholder="Internal admin notes about this user..."
                                    value={notesForm}
                                    onChange={(e) => setNotesForm(e.target.value)}
                                    rows={6}
                                  />
                                </div>
                                <Button onClick={handleUpdateNotes}>
                                  <StickyNote className="w-4 h-4 mr-2" />
                                  Update Notes
                                </Button>
                              </TabsContent>

                              <TabsContent value="history" className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm">Login History</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {loginHistory.map((entry) => (
                                          <div key={entry.id} className="flex justify-between items-center text-sm border-b pb-2">
                                            <div>
                                              <div className={entry.success ? 'text-green-600' : 'text-red-600'}>
                                                {entry.success ? '✓' : '✗'} {new Date(entry.login_at).toLocaleString()}
                                              </div>
                                              {!entry.success && entry.failure_reason && (
                                                <div className="text-muted-foreground text-xs">{entry.failure_reason}</div>
                                              )}
                                            </div>
                                            <div className="text-muted-foreground text-xs">
                                              {entry.ip_address && typeof entry.ip_address === 'string' ? entry.ip_address : 'Unknown IP'}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              </TabsContent>

                              <TabsContent value="actions" className="space-y-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-sm">Admin Actions Log</CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                      {adminActions.map((action) => (
                                        <div key={action.id} className="border-b pb-2 text-sm">
                                          <div className="flex justify-between">
                                            <span className="font-medium">{action.action_type}</span>
                                            <span className="text-muted-foreground">
                                              {new Date(action.created_at).toLocaleString()}
                                            </span>
                                          </div>
                                          {action.reason && (
                                            <div className="text-muted-foreground">{action.reason}</div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>
                            </Tabs>
                          </DialogContent>
                        </Dialog>

                        {/* Delete User */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete {user.first_name} {user.last_name} and all associated data. 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};