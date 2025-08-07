import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, User, Mail, Key, RefreshCw } from 'lucide-react';
import { useTestUsers, TestUser } from '@/hooks/useTestUsers';

interface TestUserSelectorProps {
  onUserSelect: (email: string, password: string) => void;
  onAutoLogin?: (email: string, password: string) => void; // Optional auto-login function
}

export const TestUserSelector: React.FC<TestUserSelectorProps> = ({ onUserSelect, onAutoLogin }) => {
  const { testUsers, loading, refreshTestUsers } = useTestUsers();
  const [isOpen, setIsOpen] = useState(false);

  const handleUserClick = (user: TestUser) => {
    if (user.email && user.password) {
      // First update the form fields
      onUserSelect(user.email, user.password);
      
      // Then trigger auto-login if available
      if (onAutoLogin) {
        // Small delay to ensure form is populated first
        setTimeout(() => {
          onAutoLogin(user.email, user.password);
        }, 100);
      }
    } else {
      alert(`Login credentials not available for this user.`);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'trainer': return 'default';
      default: return 'secondary';
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'admin': return 'destructive';
      case 'trainer': return 'default';
      case 'client': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  All Users
                </CardTitle>
                <CardDescription>
                  Click any user to auto-login (Development Mode)
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{testUsers.length} users</Badge>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-muted-foreground">
                Click any user to automatically log in with their credentials
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshTestUsers}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {testUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors hover:border-primary/50"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}`
                              : 'Test User'
                            }
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {user.displayEmail || user.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={getUserTypeColor(user.user_type)} className="text-xs">
                          {user.user_type}
                        </Badge>
                        {user.roles.map(role => (
                          <Badge key={role} variant={getRoleColor(role)} className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {user.password ? (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Key className="h-3 w-3" />
                        <span className="font-mono">●●●●●●●●●●</span>
                        <span className="ml-1">Try: {user.password}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Key className="h-3 w-3" />
                        <span className="italic">Password not available</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {testUsers.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No users available</p>
                    <p className="text-xs">Users will appear here once they sign up</p>
                  </div>
                )}
                
                {loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    <RefreshCw className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p>Loading users...</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Development Mode:</strong> All users use the standard password: Password123!
                Click any user to automatically log in with their credentials.
              </p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};