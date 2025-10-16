import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Archive, Users } from 'lucide-react';
import { useMembershipPlans } from '@/hooks/useMembershipPlans';
import { MembershipPlanDialog } from './MembershipPlanDialog';
import { MembershipPlanDefinition } from '@/services/admin/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const MembershipPlanManager = () => {
  const { plans, planStats, loading, createPlan, updatePlan, archivePlan } = useMembershipPlans();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlanDefinition | undefined>();
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [planToArchive, setPlanToArchive] = useState<MembershipPlanDefinition | undefined>();

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(cents / 100);
  };

  const formatCommission = (plan: MembershipPlanDefinition) => {
    if (!plan.has_package_commission) return 'None';
    
    if (plan.commission_fee_type === 'percentage') {
      return `${plan.commission_fee_value_percent}%`;
    } else {
      return formatCurrency(plan.commission_fee_value_flat_cents || 0);
    }
  };

  const handleCreateClick = () => {
    setSelectedPlan(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (plan: MembershipPlanDefinition) => {
    setSelectedPlan(plan);
    setDialogOpen(true);
  };

  const handleArchiveClick = (plan: MembershipPlanDefinition) => {
    setPlanToArchive(plan);
    setArchiveDialogOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (planToArchive) {
      await archivePlan(planToArchive.id);
      setArchiveDialogOpen(false);
      setPlanToArchive(undefined);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading membership plans...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Membership Plans</CardTitle>
              <CardDescription>
                Manage membership plan definitions, pricing, and commission structures
              </CardDescription>
            </div>
            <Button onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Monthly Price</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Active Trainers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stripe</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No membership plans found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                plans.map((plan) => (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{plan.display_name}</div>
                        <div className="text-xs text-muted-foreground">{plan.plan_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.plan_type === 'high' ? 'default' : 'secondary'}>
                        {plan.plan_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(plan.monthly_price_cents)}</TableCell>
                    <TableCell>{formatCommission(plan)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{planStats[plan.id] || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.is_available_to_new_trainers ? 'default' : 'outline'}>
                        {plan.is_available_to_new_trainers ? 'Available' : 'Archived'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.stripe_price_id ? 'default' : 'secondary'}>
                        {plan.stripe_price_id ? 'Linked' : 'Not Linked'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {plan.is_available_to_new_trainers && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleArchiveClick(plan)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MembershipPlanDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        plan={selectedPlan}
        onSave={async (request) => {
          if ('plan_id' in request) {
            return await updatePlan(request);
          } else {
            return await createPlan(request);
          }
        }}
      />

      <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Membership Plan</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive "{planToArchive?.display_name}"? This will hide it from new trainers, but existing trainers on this plan will retain access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchiveConfirm}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
