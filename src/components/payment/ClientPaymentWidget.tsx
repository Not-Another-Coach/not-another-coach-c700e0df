import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Package, Calendar, MapPin } from "lucide-react";
import { usePaymentStatements } from "@/hooks/usePaymentStatements";

const formatCurrency = (amount: number, currency: string) => {
  const currencySymbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€';
  return `${currencySymbol}${amount.toFixed(2)}`;
};

export function ClientPaymentWidget() {
  const { packages, loading } = usePaymentStatements();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            My Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (packages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            My Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">No payment packages yet</p>
        </CardContent>
      </Card>
    );
  }

  const totalPaid = packages.reduce((sum, pkg) => sum + pkg.final_price_amount, 0);
  const activePackages = packages.filter(pkg => pkg.status === 'active').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          My Payments
        </CardTitle>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(totalPaid, packages[0]?.final_price_currency || 'GBP')}
            </p>
            <p className="text-sm text-muted-foreground">Total Investment</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{activePackages}</p>
            <p className="text-sm text-muted-foreground">Active Programs</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {packages.map((pkg) => (
          <div key={pkg.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{pkg.title}</span>
              </div>
              <Badge variant={pkg.status === 'active' ? 'default' : 'secondary'}>
                {pkg.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Started: {new Date(pkg.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{pkg.duration_weeks} weeks program</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Investment</span>
                <span className="font-medium">
                  {formatCurrency(pkg.final_price_amount, pkg.final_price_currency)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Payment Frequency</span>
                <span className="capitalize">{pkg.payout_frequency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Payment Mode</span>
                <span className="capitalize">{pkg.customer_payment_mode}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}