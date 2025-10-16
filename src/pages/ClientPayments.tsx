import { useAuth } from "@/hooks/useAuth";
import { useClientProfile } from "@/hooks/useClientProfile";
import { useClientJourneyProgress } from "@/hooks/useClientJourneyProgress";
import { useDiscoveryCallNotifications } from "@/hooks/useDiscoveryCallNotifications";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ClientCustomHeader } from "@/components/layout/ClientCustomHeader";
import { MessagingPopup } from "@/components/MessagingPopup";
import { FloatingMessageButton } from "@/components/FloatingMessageButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, DollarSign, Calendar, Clock, FileText } from "lucide-react";
import { useState } from "react";

export default function ClientPayments() {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useClientProfile();
  const { progress: journeyProgress } = useClientJourneyProgress();
  const { notifications, upcomingCalls } = useDiscoveryCallNotifications();
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

  // Fetch real payment data
  const { data: paymentsData } = useQuery({
    queryKey: ['client-payments', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: payments, error } = await supabase
        .from('customer_payments')
        .select(`
          *,
          payment_packages (
            id,
            name,
            trainer_id,
            profiles:trainer_id (
              first_name,
              last_name
            )
          )
        `)
        .eq('payment_packages.customer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate totals
      const totalSpent = payments?.reduce((sum, p) => sum + Number(p.amount_value), 0) || 0;
      const activePlans = payments?.filter(p => {
        const metadata = p.metadata as any;
        return metadata?.stripe_subscription_id && p.status === 'succeeded';
      }).length || 0;

      return {
        payments: payments || [],
        totalSpent,
        activePlans,
      };
    },
    enabled: !!user?.id,
  });

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!profile || !user || profile.user_type !== 'client') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <ClientCustomHeader
        currentPage="dashboard"
        profile={profile}
        journeyProgress={journeyProgress}
        notifications={notifications}
        upcomingCalls={upcomingCalls}
        onMessagingOpen={() => setIsMessagingOpen(true)}
      />

      {/* Main Content */}
      <main className="mx-auto px-6 lg:px-8 xl:px-12 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Payment Management</h1>
          <Badge variant="outline" className="text-sm">
            Client Account
          </Badge>
        </div>

        {/* Payment Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">£{(paymentsData?.totalSpent || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{paymentsData?.activePlans || 0}</div>
              <p className="text-xs text-muted-foreground">Current subscriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">No upcoming payments</p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Payment Methods Added</h3>
              <p className="text-muted-foreground mb-4">
                Add a payment method to start purchasing training packages
              </p>
              <Button>Add Payment Method</Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!paymentsData?.payments || paymentsData.payments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Payment History</h3>
                <p className="text-muted-foreground">
                  Your payment history will appear here once you make your first purchase
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentsData.payments.map((payment: any) => (
                  <div key={payment.id} className="flex justify-between items-center border-b pb-3 last:border-0">
                    <div>
                      <p className="font-medium">{payment.payment_packages?.name || 'Training Package'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.paid_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                      {payment.payment_packages?.profiles && (
                        <p className="text-xs text-muted-foreground">
                          with {payment.payment_packages.profiles.first_name} {payment.payment_packages.profiles.last_name}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">
                        {payment.amount_currency} {Number(payment.amount_value).toFixed(2)}
                      </p>
                      <Badge variant={payment.status === 'succeeded' ? 'default' : 'secondary'} className="capitalize">
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Floating Message Button */}
      <FloatingMessageButton />

      {/* Messaging Popup */}
      <MessagingPopup 
        isOpen={isMessagingOpen}
        onClose={() => setIsMessagingOpen(false)}
      />
    </div>
  );
}