import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useUserRoles, AppRole, UserWithRoles } from '@/hooks/useUserRoles';
import { Plus, Trash2, UserCog, Shield, Users, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const roleColors = {
  admin: 'bg-red-100 text-red-800',
  trainer: 'bg-blue-100 text-blue-800',
  client: 'bg-green-100 text-green-800'
};

const roleIcons = {
  admin: Shield,
  trainer: UserCog,
  client: User
};

export const UserManagement = () => {
  const { users, loading, isAdmin, fetchUsers, addRole, removeRole, deleteUser } = useUserRoles();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<AppRole>('client');

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  const handleAddRole = async (userId: string, role: AppRole) => {
    const result = await addRole(userId, role);
    if (result.success) {
      toast({
        title: "Role added",
        description: `Successfully added ${role} role to user.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to add role.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveRole = async (userId: string, role: AppRole) => {
    const result = await removeRole(userId, role);
    if (result.success) {
      toast({
        title: "Role removed",
        description: `Successfully removed ${role} role from user.`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to remove role.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const result = await deleteUser(userId);
    if (result.success) {
      toast({
        title: "User deleted",
        description: "User has been successfully deleted.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <p>Loading users...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.id}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.user_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => {
                        const Icon = roleIcons[role];
                        return (
                          <Badge
                            key={role}
                            className={`${roleColors[role]} flex items-center gap-1`}
                          >
                            <Icon className="w-3 h-3" />
                            {role}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 ml-1 text-current hover:bg-transparent"
                              onClick={() => handleRemoveRole(user.id, role)}
                            >
                              ×
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Select
                          value={selectedRole}
                          onValueChange={(value) => setSelectedRole(value as AppRole)}
                        >
                          <SelectTrigger className="w-24">
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
                          disabled={user.roles.includes(selectedRole)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {user.first_name} {user.last_name}? 
                              This action cannot be undone and will remove all their data.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};