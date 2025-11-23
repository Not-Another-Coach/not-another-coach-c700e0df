import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X } from 'lucide-react';

export function PlanComparison() {
  const comparisonData = [
    {
      feature: 'Monthly fee',
      starter: '£9.99',
      builder: '£50',
      isPrice: true
    },
    {
      feature: 'Commission per sale',
      starter: '10%',
      builder: '0%',
      isPrice: false
    },
    {
      feature: 'You keep (on £200 sale)',
      starter: '£180',
      builder: '£200',
      highlight: true
    },
    {
      feature: 'Full profile & listings',
      starter: true,
      builder: true,
      isBoolean: true
    },
    {
      feature: 'Client discovery calls',
      starter: true,
      builder: true,
      isBoolean: true
    },
    {
      feature: 'Payment processing',
      starter: true,
      builder: true,
      isBoolean: true
    },
    {
      feature: 'Priority support',
      starter: false,
      builder: true,
      isBoolean: true
    },
    {
      feature: 'Upgrade anytime',
      starter: true,
      builder: true,
      isBoolean: true
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Compare Plans</CardTitle>
            <p className="text-muted-foreground mt-2">
              See which plan fits your coaching business best
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4 font-semibold">Feature</th>
                    <th className="text-center py-4 px-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-lg">Starter</div>
                        <div className="text-sm text-muted-foreground font-normal">£9.99/mo</div>
                      </div>
                    </th>
                    <th className="text-center py-4 px-4">
                      <div className="space-y-1">
                        <div className="font-semibold text-lg">Builder</div>
                        <div className="text-sm text-muted-foreground font-normal">£50/mo</div>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr 
                      key={index} 
                      className={`border-b ${row.highlight ? 'bg-primary/5' : ''}`}
                    >
                      <td className="py-4 px-4">
                        <span className={row.highlight ? 'font-semibold' : ''}>
                          {row.feature}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.isBoolean ? (
                          row.starter ? (
                            <Check className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )
                        ) : (
                          <span className={row.highlight ? 'font-semibold text-primary' : ''}>
                            {row.starter}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {row.isBoolean ? (
                          row.builder ? (
                            <Check className="h-5 w-5 text-primary mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground mx-auto" />
                          )
                        ) : (
                          <span className={row.highlight ? 'font-semibold text-primary' : ''}>
                            {row.builder}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
