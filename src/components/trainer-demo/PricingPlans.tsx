import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PricingPlans() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: '£9.99',
      period: '/month',
      commission: '10% per sale',
      highlight: 'You keep 90% of each sale',
      bestFor: 'Best for getting started',
      features: [
        'Full profile customization',
        'Client discovery calls',
        'Package management',
        'Payment processing',
        '10% commission per sale'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Builder',
      price: '£50',
      period: '/month',
      commission: '0% commission',
      highlight: 'You keep 100% of each sale',
      bestFor: 'Best for growing trainers',
      features: [
        'Everything in Starter',
        'Zero commission on sales',
        'Priority support',
        'Advanced analytics',
        'Upgrade anytime'
      ],
      cta: 'Start Free',
      popular: true
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start for free and choose the plan that grows with your business
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-sm">{plan.bestFor}</CardDescription>
                
                <div className="mt-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{plan.commission}</p>
                </div>

                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-semibold text-primary">{plan.highlight}</p>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className="w-full" 
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => navigate('/auth?signup=trainer')}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          <Badge variant="secondary" className="mr-2">Founder Note</Badge>
          Early members keep their price for life
        </p>
      </div>
    </section>
  );
}
