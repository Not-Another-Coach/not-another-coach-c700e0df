import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, Code, Lock, Info, Database, ExternalLink, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { useActiveClientGoals, ClientGoal } from "@/hooks/useClientGoals";
import { useAllGoalMappings, GoalSpecialtyMapping } from "@/hooks/useClientGoalMappings";
import { MatchingAlgorithmConfig } from "@/types/matching";

interface MatchingScoringLogicProps {
  currentConfig?: MatchingAlgorithmConfig;
  liveConfig?: MatchingAlgorithmConfig;
  isDraft?: boolean;
}

// Hardcoded matching logic constants - these are baked into useEnhancedTrainerMatching.tsx
const COACHING_STYLE_MAPPINGS = [
  { clientStyle: "motivational", trainerStyles: ["Motivational", "Encouraging", "Positive"], score: 100 },
  { clientStyle: "structured", trainerStyles: ["Structured", "Methodical", "Data-Driven"], score: 100 },
  { clientStyle: "flexible", trainerStyles: ["Adaptive", "Flexible", "Personalized"], score: 100 },
  { clientStyle: "tough_love", trainerStyles: ["Direct", "Challenging", "No-Nonsense"], score: 100 },
];

const EXPERIENCE_LEVEL_CRITERIA = [
  { clientLevel: "beginner", trainerPreference: "Beginners", bonus: 20, description: "Full bonus for matching" },
  { clientLevel: "intermediate", trainerPreference: "Intermediate", bonus: 15, description: "Good match" },
  { clientLevel: "advanced", trainerPreference: "Advanced", bonus: 20, description: "Full bonus for matching" },
];

const SCORE_MODIFIERS = [
  { name: "Gender Preference Match", modifier: "+10", condition: "Client's gender preference matches trainer's gender" },
  { name: "Discovery Call Mismatch", modifier: "-5", condition: "Client wants discovery call but trainer doesn't offer" },
  { name: "Virtual Training Bonus", modifier: "+5", condition: "Client open to virtual, trainer offers online" },
  { name: "Budget Over Soft Tolerance", modifier: "-10 to -30", condition: "Trainer price exceeds client budget by 20-40%" },
  { name: "Ideal Client Match", modifier: "+10", condition: "Client matches trainer's ideal client type" },
];

const DIVERSITY_TIERS = [
  { tier: "Top Match", range: "75-100%", color: "bg-emerald-500" },
  { tier: "Good Match", range: "50-74%", color: "bg-blue-500" },
  { tier: "Potential Match", range: "30-49%", color: "bg-amber-500" },
];

// Weight categories with descriptions
const WEIGHT_CATEGORIES = [
  { key: "goals_specialties", label: "Goals & Specialties", description: "Client goals matched to trainer specialties" },
  { key: "location_format", label: "Location & Format", description: "Training location and format compatibility" },
  { key: "coaching_style", label: "Coaching Style", description: "Coaching approach alignment" },
  { key: "schedule_frequency", label: "Schedule & Frequency", description: "Availability and session frequency" },
  { key: "budget_fit", label: "Budget Fit", description: "Price range compatibility" },
  { key: "experience_level", label: "Experience Level", description: "Client experience vs trainer expertise" },
  { key: "ideal_client_type", label: "Ideal Client Type", description: "Trainer's preferred client profile" },
  { key: "package_alignment", label: "Package Alignment", description: "Package type preferences" },
  { key: "discovery_call", label: "Discovery Call", description: "Discovery call offering" },
];

// Helper component to show weight comparison
function WeightChangeIndicator({ liveWeight, draftWeight }: { liveWeight: number; draftWeight: number }) {
  const diff = draftWeight - liveWeight;
  
  if (diff === 0) {
    return <span className="text-muted-foreground flex items-center gap-1"><Minus className="w-3 h-3" /> —</span>;
  }
  
  if (diff > 0) {
    return <span className="text-emerald-600 flex items-center gap-1"><ArrowUp className="w-3 h-3" /> +{diff}</span>;
  }
  
  return <span className="text-destructive flex items-center gap-1"><ArrowDown className="w-3 h-3" /> {diff}</span>;
}

// Component to render goal mappings from database
function GoalMappingsSection({ goals, mappingsByGoalId, loading }: { 
  goals: ClientGoal[]; 
  mappingsByGoalId: Record<string, GoalSpecialtyMapping[]>;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No goals configured yet.</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/admin/goals">Configure Goals →</Link>
        </Button>
      </div>
    );
  }

  const getMappingTypeBadge = (type: string) => {
    switch (type) {
      case 'primary':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">Primary</Badge>;
      case 'secondary':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">Secondary</Badge>;
      case 'optional':
        return <Badge variant="outline" className="text-xs">Optional</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {goals.map(goal => {
        const goalMappings = mappingsByGoalId[goal.id] || [];
        const primaryMappings = goalMappings.filter(m => m.mapping_type === 'primary');
        const secondaryMappings = goalMappings.filter(m => m.mapping_type === 'secondary');
        const optionalMappings = goalMappings.filter(m => m.mapping_type === 'optional');

        return (
          <div key={goal.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{goal.icon}</span>
                <span className="font-medium">{goal.label}</span>
                <Badge variant="secondary" className="text-xs">{goal.goal_type}</Badge>
              </div>
              <span className="text-sm text-muted-foreground font-mono">{goal.goal_key}</span>
            </div>
            
            {goalMappings.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No specialty mappings configured</p>
            ) : (
              <div className="space-y-2">
                {primaryMappings.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {getMappingTypeBadge('primary')}
                    {primaryMappings.map(m => (
                      <Badge key={m.id} variant="secondary" className="text-xs">
                        {m.specialty?.name || 'Unknown'} ({m.weight}%)
                      </Badge>
                    ))}
                  </div>
                )}
                {secondaryMappings.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {getMappingTypeBadge('secondary')}
                    {secondaryMappings.map(m => (
                      <Badge key={m.id} variant="secondary" className="text-xs">
                        {m.specialty?.name || 'Unknown'} ({m.weight}%)
                      </Badge>
                    ))}
                  </div>
                )}
                {optionalMappings.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    {getMappingTypeBadge('optional')}
                    {optionalMappings.map(m => (
                      <Badge key={m.id} variant="secondary" className="text-xs">
                        {m.specialty?.name || 'Unknown'} ({m.weight}%)
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function MatchingScoringLogic({ currentConfig, liveConfig, isDraft = false }: MatchingScoringLogicProps) {
  const { goals, loading: goalsLoading } = useActiveClientGoals();
  const { mappingsByGoalId, loading: mappingsLoading } = useAllGoalMappings();

  const showComparison = isDraft && liveConfig && currentConfig;

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This tab shows the scoring logic. Items marked with <Database className="w-3 h-3 inline mx-1" /> are 
          <strong> configurable via Admin</strong>, while items marked with <Lock className="w-3 h-3 inline mx-1" /> 
          are <strong> hardcoded</strong> and require code changes to modify.
        </AlertDescription>
      </Alert>

      {/* Base Category Weights - Configurable */}
      <Collapsible defaultOpen>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-base">Base Category Weights</CardTitle>
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-600/20">Configurable</Badge>
              </div>
              <ChevronDown className="w-4 h-4" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <CardDescription className="mb-4">
                These weights are configured per algorithm version. 
                {showComparison && " Comparing current draft to the live version."}
              </CardDescription>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    {showComparison ? (
                      <>
                        <TableHead className="text-center">Live</TableHead>
                        <TableHead className="text-center">Draft</TableHead>
                        <TableHead className="text-center">Change</TableHead>
                      </>
                    ) : (
                      <TableHead>Weight</TableHead>
                    )}
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {WEIGHT_CATEGORIES.map(cat => {
                    const configKey = cat.key as keyof MatchingAlgorithmConfig['weights'];
                    const currentWeight = currentConfig?.weights?.[configKey]?.value;
                    const liveWeight = liveConfig?.weights?.[configKey]?.value;
                    
                    return (
                      <TableRow key={cat.key}>
                        <TableCell className="font-medium">{cat.label}</TableCell>
                        {showComparison ? (
                          <>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="font-mono">{liveWeight ?? '—'}%</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="font-mono">{currentWeight ?? '—'}%</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {liveWeight !== undefined && currentWeight !== undefined && (
                                <WeightChangeIndicator liveWeight={liveWeight} draftWeight={currentWeight} />
                              )}
                            </TableCell>
                          </>
                        ) : (
                          <TableCell>
                            <Badge variant="outline">{currentWeight ?? liveWeight ?? '—'}%</Badge>
                          </TableCell>
                        )}
                        <TableCell className="text-muted-foreground">{cat.description}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Goal → Specialty Mappings - Database Driven */}
      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <CardTitle className="text-base">Goal → Specialty Mappings</CardTitle>
                <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-600/20">Configurable</Badge>
              </div>
              <ChevronDown className="w-4 h-4" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <CardDescription>
                  How client fitness goals are matched to trainer specialties. Configure these in Admin → Goals.
                </CardDescription>
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/goals" className="flex items-center gap-1">
                    Edit Mappings <ExternalLink className="w-3 h-3" />
                  </Link>
                </Button>
              </div>
              <GoalMappingsSection 
                goals={goals} 
                mappingsByGoalId={mappingsByGoalId} 
                loading={goalsLoading || mappingsLoading} 
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Coaching Style Mappings - Hardcoded */}
      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Coaching Style Mappings</CardTitle>
                <Badge variant="outline" className="text-xs">Hardcoded</Badge>
              </div>
              <ChevronDown className="w-4 h-4" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <CardDescription className="mb-4">
                <Code className="w-3 h-3 inline mr-1" />
                These mappings are defined in code. Changes require code modification.
              </CardDescription>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Preference</TableHead>
                    <TableHead>Trainer Styles</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {COACHING_STYLE_MAPPINGS.map((mapping) => (
                    <TableRow key={mapping.clientStyle}>
                      <TableCell className="font-mono text-sm">{mapping.clientStyle}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {mapping.trainerStyles.map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{mapping.score}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Experience Level Criteria - Hardcoded */}
      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Experience Level Criteria</CardTitle>
                <Badge variant="outline" className="text-xs">Hardcoded</Badge>
              </div>
              <ChevronDown className="w-4 h-4" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Level</TableHead>
                    <TableHead>Trainer Preference</TableHead>
                    <TableHead>Bonus</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {EXPERIENCE_LEVEL_CRITERIA.map((criteria) => (
                    <TableRow key={criteria.clientLevel}>
                      <TableCell className="font-mono text-sm">{criteria.clientLevel}</TableCell>
                      <TableCell>{criteria.trainerPreference}</TableCell>
                      <TableCell><Badge variant="outline">+{criteria.bonus}</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{criteria.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Score Modifiers - Hardcoded */}
      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Score Modifiers & Penalties</CardTitle>
                <Badge variant="outline" className="text-xs">Hardcoded</Badge>
              </div>
              <ChevronDown className="w-4 h-4" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Modifier</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Condition</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {SCORE_MODIFIERS.map((mod) => (
                    <TableRow key={mod.name}>
                      <TableCell className="font-medium">{mod.name}</TableCell>
                      <TableCell>
                        <Badge variant={mod.modifier.startsWith('-') ? 'destructive' : 'default'}>
                          {mod.modifier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{mod.condition}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Diversity Tiers - Hardcoded */}
      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Diversity Tiers</CardTitle>
                <Badge variant="outline" className="text-xs">Hardcoded</Badge>
              </div>
              <ChevronDown className="w-4 h-4" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <CardDescription className="mb-4">
                Results are interleaved from different score tiers to ensure diversity.
              </CardDescription>
              <div className="flex gap-4">
                {DIVERSITY_TIERS.map((tier) => (
                  <div key={tier.tier} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                    <span className="font-medium">{tier.tier}</span>
                    <span className="text-muted-foreground">{tier.range}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
