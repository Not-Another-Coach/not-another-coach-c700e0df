import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfileByType } from "@/hooks/useProfileByType";
import { usePaymentStatements } from "@/hooks/usePaymentStatements";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PaymentStatementView } from "@/components/payment-statements/PaymentStatementView";
import { MembershipSettings } from "@/components/payment-statements/MembershipSettings";
import { 
  CreditCard, 
  Package, 
  Settings, 
  TrendingUp, 
  DollarSign,
  Calendar,
  ArrowLeft,
  ExternalLink 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const PaymentManagement = () => {
  const { user } = useAuth();
  const { profile } = useProfileByType();
  const { packages, loading } = usePaymentStatements();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("statements");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading payment data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/trainer/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Payment & Payouts</h1>
              <p className="text-muted-foreground">
                Manage your packages, view earnings, and configure payout settings
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Packages</p>
                  <p className="text-2xl font-bold">{packages?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-50">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">£2,450</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-50">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Payouts</p>
                  <p className="text-2xl font-bold">£520</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next Payout</p>
                  <p className="text-2xl font-bold">Sep 1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Package Management Quick Link */}
        <Card className="mb-6 border-dashed border-2 border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Package Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure your training packages, rates, and payment options in Profile Setup
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/trainer/profile-setup?tab=rates-packages')}
                className="flex items-center gap-2"
              >
                Manage Packages
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="statements" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payment Statements
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Payout History
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="statements">
            <Card>
              <CardHeader>
                <CardTitle>Payment Statements</CardTitle>
                <p className="text-sm text-muted-foreground">
                  View detailed payment statements and payout schedules for your packages
                </p>
              </CardHeader>
              <CardContent>
                {packages && packages.length > 0 ? (
                  <div className="space-y-4">
                    {packages.map((pkg) => (
                      <div key={pkg.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{(pkg as any).package_name || pkg.id}</h4>
                          <Badge variant="secondary">
                            £{(pkg as any).final_price?.amount || (pkg as any).price || 0}
                          </Badge>
                        </div>
                        <PaymentStatementView packageId={pkg.id} viewerRole="trainer" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No packages configured</h3>
                    <p className="text-muted-foreground mb-4">
                      Set up your first package to start viewing payment statements
                    </p>
                    <Button onClick={() => navigate('/trainer/profile-setup?tab=rates-packages')}>
                      Configure Packages
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Payout History</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track your completed payouts and earnings
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No payout history</h3>
                  <p className="text-muted-foreground">
                    Your payout history will appear here once you start receiving payments
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <MembershipSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};