import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ConditionalRule {
  step_id: string;
  condition_type: 'package_type' | 'previous_answer' | 'step_completed';
  field_name?: string;
  expected_value: any;
  dependency_step_id?: string;
  operator: 'AND' | 'OR';
}

interface ConditionalLogicBuilderProps {
  templateId: string;
  existingRules: ConditionalRule[];
  availableSteps: Array<{ id: string; name: string; }>;
  onRuleAdded: (rule: ConditionalRule) => void;
  onRuleRemoved: (ruleIndex: number) => void;
}

export function ConditionalLogicBuilder({
  templateId,
  existingRules,
  availableSteps,
  onRuleAdded,
  onRuleRemoved
}: ConditionalLogicBuilderProps) {
  const { toast } = useToast();
  const [newRule, setNewRule] = useState<Partial<ConditionalRule>>({
    operator: 'AND'
  });

  const handleAddRule = () => {
    if (!newRule.step_id || !newRule.condition_type) {
      toast({
        title: "Incomplete Rule",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const rule: ConditionalRule = {
      step_id: newRule.step_id!,
      condition_type: newRule.condition_type!,
      field_name: newRule.field_name,
      expected_value: newRule.expected_value,
      dependency_step_id: newRule.dependency_step_id,
      operator: newRule.operator || 'AND'
    };

    onRuleAdded(rule);
    setNewRule({ operator: 'AND' });
    
    toast({
      title: "Rule Added",
      description: "Conditional logic rule has been added successfully"
    });
  };

  const formatRuleDescription = (rule: ConditionalRule) => {
    const stepName = availableSteps.find(s => s.id === rule.step_id)?.name || rule.step_id;
    
    switch (rule.condition_type) {
      case 'package_type':
        return `Show "${stepName}" when package type is "${rule.expected_value}"`;
      case 'previous_answer':
        return `Show "${stepName}" when ${rule.field_name} equals "${rule.expected_value}"`;
      case 'step_completed':
        const depStep = availableSteps.find(s => s.id === rule.dependency_step_id)?.name || rule.dependency_step_id;
        return `Show "${stepName}" when "${depStep}" is completed`;
      default:
        return `Show "${stepName}" (unknown condition)`;
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Conditional Logic
        </CardTitle>
        <CardDescription>
          Configure when steps should appear based on client data or previous step completion
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Rules */}
        {existingRules.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Current Rules</Label>
            {existingRules.map((rule, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm">{formatRuleDescription(rule)}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {rule.operator}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRuleRemoved(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add New Rule */}
        <div className="space-y-4 p-4 border border-dashed border-border rounded-lg">
          <Label className="text-sm font-medium">Add New Rule</Label>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="step-select">Target Step</Label>
              <Select
                value={newRule.step_id || ''}
                onValueChange={(value) => setNewRule(prev => ({ ...prev, step_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select step" />
                </SelectTrigger>
                <SelectContent>
                  {availableSteps.map((step) => (
                    <SelectItem key={step.id} value={step.id}>
                      {step.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition-type">Condition Type</Label>
              <Select
                value={newRule.condition_type || ''}
                onValueChange={(value: ConditionalRule['condition_type']) => 
                  setNewRule(prev => ({ ...prev, condition_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="package_type">Package Type</SelectItem>
                  <SelectItem value="previous_answer">Previous Answer</SelectItem>
                  <SelectItem value="step_completed">Step Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Conditional Fields */}
          {newRule.condition_type === 'package_type' && (
            <div className="space-y-2">
              <Label htmlFor="package-value">Package Type Value</Label>
              <Input
                id="package-value"
                placeholder="e.g., premium, basic"
                value={newRule.expected_value || ''}
                onChange={(e) => setNewRule(prev => ({ ...prev, expected_value: e.target.value }))}
              />
            </div>
          )}

          {newRule.condition_type === 'previous_answer' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="field-name">Field Name</Label>
                <Input
                  id="field-name"
                  placeholder="e.g., training_experience"
                  value={newRule.field_name || ''}
                  onChange={(e) => setNewRule(prev => ({ ...prev, field_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expected-value">Expected Value</Label>
                <Input
                  id="expected-value"
                  placeholder="e.g., beginner"
                  value={newRule.expected_value || ''}
                  onChange={(e) => setNewRule(prev => ({ ...prev, expected_value: e.target.value }))}
                />
              </div>
            </div>
          )}

          {newRule.condition_type === 'step_completed' && (
            <div className="space-y-2">
              <Label htmlFor="dependency-step">Dependency Step</Label>
              <Select
                value={newRule.dependency_step_id || ''}
                onValueChange={(value) => setNewRule(prev => ({ ...prev, dependency_step_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select step" />
                </SelectTrigger>
                <SelectContent>
                  {availableSteps.map((step) => (
                    <SelectItem key={step.id} value={step.id}>
                      {step.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label htmlFor="operator">Logical Operator</Label>
              <Select
                value={newRule.operator || 'AND'}
                onValueChange={(value: 'AND' | 'OR') => 
                  setNewRule(prev => ({ ...prev, operator: value }))
                }
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AND">AND</SelectItem>
                  <SelectItem value="OR">OR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleAddRule} className="mt-6">
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
