import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useMatchingConfig, DEFAULT_MATCHING_CONFIG, MatchingAlgorithmConfig as ConfigType } from "@/hooks/useMatchingConfig";
import { HARD_EXCLUSION_RULES } from "@/hooks/useHardExclusions";
import { AlertTriangle, Save, RotateCcw, Sparkles, Target, Scale, Clock, Settings2, Ban, User, MapPin, DollarSign, Lock, Code, ChevronDown, Percent, Zap, Layers } from "lucide-react";

// Hardcoded scoring logic constants for read-only display
const HARDCODED_WEIGHTS = [
  { category: "Goals → Specialties", weight: 25, configKey: "goals_specialties" },
  { category: "Location / Format", weight: 20, configKey: "location_format" },
  { category: "Coaching Style", weight: 20, configKey: "coaching_style" },
  { category: "Schedule / Frequency", weight: 15, configKey: "schedule_frequency" },
  { category: "Budget Fit", weight: 10, configKey: "budget_fit" },
  { category: "Experience Level", weight: 10, configKey: "experience_level" },
];

const GOAL_SPECIALTY_MAPPINGS = [
  { goal: "Weight Loss", specialties: ["Weight Loss", "Fat Loss", "Body Composition", "Nutrition"] },
  { goal: "Muscle Building", specialties: ["Strength Training", "Bodybuilding", "Muscle Building", "Hypertrophy"] },
  { goal: "Strength Training", specialties: ["Strength Training", "Powerlifting", "Muscle Building", "Bodybuilding"] },
  { goal: "General Fitness", specialties: ["General Fitness", "Health & Wellness", "Functional Training"] },
  { goal: "Sports Performance", specialties: ["Sports Performance", "Athletic Training", "Speed & Agility"] },
  { goal: "Flexibility & Mobility", specialties: ["Flexibility", "Mobility", "Yoga", "Stretching"] },
  { goal: "Endurance", specialties: ["Cardio", "Endurance Training", "Running", "HIIT"] },
  { goal: "Rehabilitation", specialties: ["Rehabilitation", "Injury Prevention", "Corrective Exercise"] },
  { goal: "Prenatal/Postnatal", specialties: ["Pre/Postnatal", "Women's Fitness", "Core Training"] },
  { goal: "Senior Fitness", specialties: ["Senior Fitness", "Balance", "Functional Training"] },
  { goal: "Competition Prep", specialties: ["Competition Prep", "Bodybuilding", "Physique"] },
];

const COACHING_STYLE_MAPPINGS = [
  { style: "Nurturing / Supportive", keywords: ["supportive", "patient", "encouraging", "nurturing", "empathetic"] },
  { style: "Tough Love", keywords: ["challenging", "direct", "accountability", "strict", "no-excuses"] },
  { style: "High Energy", keywords: ["energetic", "motivating", "enthusiastic", "dynamic", "upbeat"] },
  { style: "Calm & Methodical", keywords: ["calm", "methodical", "structured", "analytical", "precise"] },
  { style: "Educational", keywords: ["educational", "teaching", "science-based", "informative", "detailed"] },
  { style: "Flexible / Adaptive", keywords: ["flexible", "adaptive", "personalized", "intuitive", "responsive"] },
];

const EXPERIENCE_LEVEL_CRITERIA = [
  { level: "Beginner", criteria: "Trainers with rating ≥ 4.7 (patient, highly rated)", ratingMin: 4.7, yearsMin: null },
  { level: "Intermediate", criteria: "Trainers with rating ≥ 4.5", ratingMin: 4.5, yearsMin: null },
  { level: "Advanced", criteria: "Trainers with 5+ years experience AND rating ≥ 4.5", ratingMin: 4.5, yearsMin: 5 },
];

const SCORE_MODIFIERS = [
  { condition: "Gender mismatch (when client has preference)", modifier: -70, type: "penalty" },
  { condition: "Discovery call required but trainer doesn't offer", modifier: -20, type: "penalty" },
  { condition: "Discovery call preference alignment", modifier: 10, type: "bonus" },
  { condition: "Minimum baseline score (all trainers)", modifier: 45, type: "baseline" },
];

const DIVERSITY_TIERS = [
  { tier: "High Scorers", scoreRange: "≥75%", description: "Top tier matches, shown first" },
  { tier: "Medium Scorers", scoreRange: "60-74%", description: "Good potential matches" },
  { tier: "Lower Scorers", scoreRange: "<60%", description: "Included for variety/diversity" },
];

export function MatchingAlgorithmConfig() {
  const { config, isConfigured, isLoading, saveConfig, isSaving } = useMatchingConfig();
  const [localConfig, setLocalConfig] = useState<ConfigType>(DEFAULT_MATCHING_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (config) {
      setLocalConfig(config);
    }
  }, [config]);

  const totalWeight = useMemo(() => {
    return Object.values(localConfig.weights).reduce((sum, w) => sum + w.value, 0);
  }, [localConfig.weights]);

  const isValidTotal = totalWeight === 100;

  const handleWeightChange = (key: keyof typeof localConfig.weights, value: number) => {
    setLocalConfig(prev => ({
      ...prev,
      weights: {
        ...prev.weights,
        [key]: { ...prev.weights[key], value }
      }
    }));
    setHasChanges(true);
  };

  const handleThresholdChange = (key: keyof typeof localConfig.thresholds, value: number) => {
    setLocalConfig(prev => ({
      ...prev,
      thresholds: { ...prev.thresholds, [key]: value }
    }));
    setHasChanges(true);
  };

  const handleBudgetChange = (key: keyof typeof localConfig.budget, value: number) => {
    setLocalConfig(prev => ({
      ...prev,
      budget: { ...prev.budget, [key]: value }
    }));
    setHasChanges(true);
  };

  const handleFeatureFlagChange = (key: keyof typeof localConfig.feature_flags, value: boolean) => {
    setLocalConfig(prev => ({
      ...prev,
      feature_flags: { ...prev.feature_flags, [key]: value }
    }));
    setHasChanges(true);
  };

  const handlePackageBoundaryChange = (
    packageType: keyof typeof localConfig.package_boundaries,
    field: string,
    value: number
  ) => {
    setLocalConfig(prev => ({
      ...prev,
      package_boundaries: {
        ...prev.package_boundaries,
        [packageType]: {
          ...prev.package_boundaries[packageType],
          [field]: value
        }
      }
    }));
    setHasChanges(true);
  };

  const handleInitialize = () => {
    saveConfig(DEFAULT_MATCHING_CONFIG);
    setLocalConfig(DEFAULT_MATCHING_CONFIG);
    setHasChanges(false);
  };

  const handleSave = () => {
    if (!isValidTotal) return;
    saveConfig(localConfig);
    setHasChanges(false);
  };

  const handleReset = () => {
    if (config) {
      setLocalConfig(config);
    } else {
      setLocalConfig(DEFAULT_MATCHING_CONFIG);
    }
    setHasChanges(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const weightLabels: Record<keyof typeof localConfig.weights, { label: string; description: string }> = {
    goals_specialties: { label: "Goals → Specialties", description: "How well trainer specialties match client fitness goals" },
    location_format: { label: "Location / Format", description: "In-person, online, or hybrid compatibility" },
    coaching_style: { label: "Coaching Style", description: "Personality and communication style alignment" },
    schedule_frequency: { label: "Schedule / Frequency", description: "Training cadence and availability window" },
    budget_fit: { label: "Budget Fit", description: "Budget tolerance using soft banding" },
    experience_level: { label: "Experience Level", description: "Beginner/intermediate/advanced matching" },
    ideal_client_type: { label: "Ideal Client Type (Bonus)", description: "Age group, goal type, niche client persona" },
    package_alignment: { label: "Package Alignment", description: "Short-term, single sessions, ongoing support" },
    discovery_call: { label: "Discovery Call Preference", description: "Trainer's process alignment with client expectation" }
  };

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {!isConfigured && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Matching Algorithm Not Configured</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>No match scores will be calculated until configuration is initialised. Clients can still explore all trainers.</span>
            <Button onClick={handleInitialize} size="sm" className="ml-4">
              <Sparkles className="h-4 w-4 mr-2" />
              Initialise with Defaults
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isConfigured && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              Version {localConfig.version}
            </Badge>
            <Badge variant={localConfig.is_active ? "default" : "outline"}>
              {localConfig.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || !isValidTotal || isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}

      {isConfigured && (
        <Tabs defaultValue="exclusions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="exclusions" className="flex items-center gap-2">
              <Ban className="h-4 w-4" />
              Exclusions
            </TabsTrigger>
            <TabsTrigger value="scoring-logic" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Scoring Logic
            </TabsTrigger>
            <TabsTrigger value="weights" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Weights
            </TabsTrigger>
            <TabsTrigger value="thresholds" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Thresholds
            </TabsTrigger>
            <TabsTrigger value="boundaries" className="flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Boundaries
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Features
            </TabsTrigger>
          </TabsList>

          {/* Hard Exclusion Rules Tab (Read-Only) */}
          <TabsContent value="exclusions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5 text-destructive" />
                  Hard Exclusion Rules
                  <Badge variant="outline" className="ml-2 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Read-Only
                  </Badge>
                </CardTitle>
                <CardDescription>
                  These rules are enforced before scoring when hard exclusions are enabled. 
                  Trainers who fail these criteria are completely excluded from results.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!localConfig.feature_flags.enable_hard_exclusions && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Hard Exclusions Disabled</AlertTitle>
                    <AlertDescription>
                      Enable hard exclusions in the Features tab to activate these rules.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-3">
                  {/* Gender Mismatch Rule */}
                  <div className={`flex items-start gap-3 p-4 rounded-lg border ${
                    localConfig.feature_flags.enable_hard_exclusions 
                      ? 'bg-destructive/5 border-destructive/20' 
                      : 'bg-muted/50 border-muted'
                  }`}>
                    <User className={`h-5 w-5 mt-0.5 ${
                      localConfig.feature_flags.enable_hard_exclusions 
                        ? 'text-destructive' 
                        : 'text-muted-foreground'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Trainer Gender Mismatch</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        If client specifies "Male" or "Female" preference, trainers of other genders are excluded.
                      </p>
                    </div>
                    <Badge variant={localConfig.feature_flags.enable_hard_exclusions ? "destructive" : "secondary"}>
                      {localConfig.feature_flags.enable_hard_exclusions ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Format Incompatibility Rule */}
                  <div className={`flex items-start gap-3 p-4 rounded-lg border ${
                    localConfig.feature_flags.enable_hard_exclusions 
                      ? 'bg-destructive/5 border-destructive/20' 
                      : 'bg-muted/50 border-muted'
                  }`}>
                    <MapPin className={`h-5 w-5 mt-0.5 ${
                      localConfig.feature_flags.enable_hard_exclusions 
                        ? 'text-destructive' 
                        : 'text-muted-foreground'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Training Format Incompatibility</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        If client requires in-person only and trainer only offers online (or vice versa), trainer is excluded.
                      </p>
                    </div>
                    <Badge variant={localConfig.feature_flags.enable_hard_exclusions ? "destructive" : "secondary"}>
                      {localConfig.feature_flags.enable_hard_exclusions ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Budget Hard Ceiling Rule */}
                  <div className={`flex items-start gap-3 p-4 rounded-lg border ${
                    localConfig.feature_flags.enable_hard_exclusions 
                      ? 'bg-destructive/5 border-destructive/20' 
                      : 'bg-muted/50 border-muted'
                  }`}>
                    <DollarSign className={`h-5 w-5 mt-0.5 ${
                      localConfig.feature_flags.enable_hard_exclusions 
                        ? 'text-destructive' 
                        : 'text-muted-foreground'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Budget Hard Ceiling</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        If trainer's minimum price exceeds client's max budget by more than{" "}
                        <span className="font-semibold text-foreground">{localConfig.budget.hard_exclusion_percent}%</span>, 
                        trainer is excluded.
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1 italic">
                        Configure threshold in the Boundaries tab
                      </p>
                    </div>
                    <Badge variant={localConfig.feature_flags.enable_hard_exclusions ? "destructive" : "secondary"}>
                      {localConfig.feature_flags.enable_hard_exclusions ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  {/* Availability Mismatch Rule */}
                  <div className={`flex items-start gap-3 p-4 rounded-lg border ${
                    localConfig.feature_flags.enable_hard_exclusions 
                      ? 'bg-destructive/5 border-destructive/20' 
                      : 'bg-muted/50 border-muted'
                  }`}>
                    <Clock className={`h-5 w-5 mt-0.5 ${
                      localConfig.feature_flags.enable_hard_exclusions 
                        ? 'text-destructive' 
                        : 'text-muted-foreground'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Availability Mismatch</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        If client timeline is "ASAP" and trainer is not accepting new clients, trainer is excluded.
                      </p>
                    </div>
                    <Badge variant={localConfig.feature_flags.enable_hard_exclusions ? "destructive" : "secondary"}>
                      {localConfig.feature_flags.enable_hard_exclusions ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scoring Logic Tab (Read-Only) */}
          <TabsContent value="scoring-logic" className="space-y-4">
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertTitle className="text-amber-600">Hardcoded Logic Reference</AlertTitle>
              <AlertDescription className="text-amber-600/80">
                The values below are currently hardcoded in the matching algorithm. They cannot be changed from this panel. 
                To modify these values, a code update is required.
              </AlertDescription>
            </Alert>

            {/* Hardcoded Weights */}
            <Collapsible defaultOpen>
              <Card>
                <CardHeader className="pb-3">
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Percent className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">Category Weights (Hardcoded)</CardTitle>
                      <Badge variant="outline" className="ml-2 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Read-Only
                      </Badge>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                  </CollapsibleTrigger>
                  <CardDescription>
                    These weights are used in the scoring algorithm regardless of the configurable weights above.
                  </CardDescription>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-4 py-2 text-left font-medium">Category</th>
                            <th className="px-4 py-2 text-center font-medium">Hardcoded</th>
                            <th className="px-4 py-2 text-center font-medium">Config Value</th>
                            <th className="px-4 py-2 text-center font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {HARDCODED_WEIGHTS.map((item) => {
                            const configValue = localConfig.weights[item.configKey as keyof typeof localConfig.weights]?.value;
                            const matches = configValue === item.weight;
                            return (
                              <tr key={item.configKey} className="border-b last:border-0">
                                <td className="px-4 py-2">{item.category}</td>
                                <td className="px-4 py-2 text-center">
                                  <Badge variant="secondary">{item.weight}%</Badge>
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <Badge variant="outline">{configValue}%</Badge>
                                </td>
                                <td className="px-4 py-2 text-center">
                                  <Badge variant={matches ? "default" : "destructive"}>
                                    {matches ? "Synced" : "Override"}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Goal → Specialty Mappings */}
            <Collapsible>
              <Card>
                <CardHeader className="pb-3">
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">Goal → Specialty Mappings</CardTitle>
                      <Badge variant="outline" className="ml-2 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Read-Only
                      </Badge>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                  </CollapsibleTrigger>
                  <CardDescription>
                    Client goals are matched to trainer specialties using these mappings.
                  </CardDescription>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {GOAL_SPECIALTY_MAPPINGS.map((mapping) => (
                        <div key={mapping.goal} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                          <Badge variant="secondary" className="mt-0.5 shrink-0">{mapping.goal}</Badge>
                          <div className="flex flex-wrap gap-1">
                            {mapping.specialties.map((specialty) => (
                              <Badge key={specialty} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Coaching Style Mappings */}
            <Collapsible>
              <Card>
                <CardHeader className="pb-3">
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">Coaching Style Mappings</CardTitle>
                      <Badge variant="outline" className="ml-2 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Read-Only
                      </Badge>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                  </CollapsibleTrigger>
                  <CardDescription>
                    Client coaching style preferences are matched using these keywords in trainer profiles.
                  </CardDescription>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {COACHING_STYLE_MAPPINGS.map((mapping) => (
                        <div key={mapping.style} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                          <Badge variant="secondary" className="mt-0.5 shrink-0">{mapping.style}</Badge>
                          <div className="flex flex-wrap gap-1">
                            {mapping.keywords.map((keyword) => (
                              <Badge key={keyword} variant="outline" className="text-xs italic">
                                "{keyword}"
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Experience Level Criteria */}
            <Collapsible>
              <Card>
                <CardHeader className="pb-3">
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">Experience Level Criteria</CardTitle>
                      <Badge variant="outline" className="ml-2 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Read-Only
                      </Badge>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                  </CollapsibleTrigger>
                  <CardDescription>
                    Trainers are matched based on client experience level using these criteria.
                  </CardDescription>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-4 py-2 text-left font-medium">Client Level</th>
                            <th className="px-4 py-2 text-left font-medium">Trainer Criteria</th>
                          </tr>
                        </thead>
                        <tbody>
                          {EXPERIENCE_LEVEL_CRITERIA.map((item) => (
                            <tr key={item.level} className="border-b last:border-0">
                              <td className="px-4 py-2">
                                <Badge variant="secondary">{item.level}</Badge>
                              </td>
                              <td className="px-4 py-2 text-muted-foreground">{item.criteria}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Score Modifiers & Penalties */}
            <Collapsible>
              <Card>
                <CardHeader className="pb-3">
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">Score Modifiers & Penalties</CardTitle>
                      <Badge variant="outline" className="ml-2 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Read-Only
                      </Badge>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                  </CollapsibleTrigger>
                  <CardDescription>
                    These modifiers are applied to scores based on specific conditions.
                  </CardDescription>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {SCORE_MODIFIERS.map((item, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            item.type === 'penalty' 
                              ? 'bg-destructive/5 border-destructive/20' 
                              : item.type === 'bonus'
                              ? 'bg-green-500/5 border-green-500/20'
                              : 'bg-muted/30'
                          }`}
                        >
                          <span className="text-sm">{item.condition}</span>
                          <Badge 
                            variant={item.type === 'penalty' ? 'destructive' : item.type === 'bonus' ? 'default' : 'secondary'}
                            className={item.type === 'bonus' ? 'bg-green-600 hover:bg-green-700' : ''}
                          >
                            {item.type === 'baseline' ? `${item.modifier} pts` : `${item.modifier > 0 ? '+' : ''}${item.modifier}%`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>

            {/* Diversity Tiers */}
            <Collapsible>
              <Card>
                <CardHeader className="pb-3">
                  <CollapsibleTrigger className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Layers className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">Diversity Algorithm Tiers</CardTitle>
                      <Badge variant="outline" className="ml-2 flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Read-Only
                      </Badge>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
                  </CollapsibleTrigger>
                  <CardDescription>
                    Results are interleaved from these tiers to ensure variety in displayed trainers.
                  </CardDescription>
                </CardHeader>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="rounded-md border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-4 py-2 text-left font-medium">Tier</th>
                            <th className="px-4 py-2 text-center font-medium">Score Range</th>
                            <th className="px-4 py-2 text-left font-medium">Purpose</th>
                          </tr>
                        </thead>
                        <tbody>
                          {DIVERSITY_TIERS.map((tier) => (
                            <tr key={tier.tier} className="border-b last:border-0">
                              <td className="px-4 py-2">
                                <Badge variant="secondary">{tier.tier}</Badge>
                              </td>
                              <td className="px-4 py-2 text-center">
                                <Badge variant="outline">{tier.scoreRange}</Badge>
                              </td>
                              <td className="px-4 py-2 text-muted-foreground">{tier.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </TabsContent>

          {/* Weights Tab */}
          <TabsContent value="weights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Category Weights</span>
                  <Badge variant={isValidTotal ? "default" : "destructive"} className="text-lg px-3">
                    Total: {totalWeight}%
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Adjust how much each category contributes to the overall match score. Total must equal 100%.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(localConfig.weights).map(([key, weight]) => {
                  const typedKey = key as keyof typeof localConfig.weights;
                  const labelInfo = weightLabels[typedKey];
                  
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">{labelInfo.label}</Label>
                          <p className="text-xs text-muted-foreground">{labelInfo.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-12 justify-center">
                            {weight.value}%
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            ({weight.min}-{weight.max})
                          </span>
                        </div>
                      </div>
                      <Slider
                        value={[weight.value]}
                        min={weight.min}
                        max={weight.max}
                        step={1}
                        onValueChange={([v]) => handleWeightChange(typedKey, v)}
                        className="w-full"
                      />
                    </div>
                  );
                })}

                {!isValidTotal && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Total weight must equal 100%. Currently at {totalWeight}%. 
                      {totalWeight > 100 ? ` Reduce by ${totalWeight - 100}%.` : ` Increase by ${100 - totalWeight}%.`}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Thresholds Tab */}
          <TabsContent value="thresholds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Match Thresholds</CardTitle>
                <CardDescription>
                  Configure minimum scores and labeling thresholds for match quality.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Minimum Match to Show (%)</Label>
                    <p className="text-xs text-muted-foreground">Trainers below this score won't appear in results</p>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={localConfig.thresholds.min_match_to_show}
                      onChange={(e) => handleThresholdChange('min_match_to_show', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Top Match Label (%)</Label>
                    <p className="text-xs text-muted-foreground">Scores above this get "Top Match" badge</p>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={localConfig.thresholds.top_match_label}
                      onChange={(e) => handleThresholdChange('top_match_label', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Good Match Label (%)</Label>
                    <p className="text-xs text-muted-foreground">Scores above this get "Good Match" badge</p>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={localConfig.thresholds.good_match_label}
                      onChange={(e) => handleThresholdChange('good_match_label', Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Boundaries Tab */}
          <TabsContent value="boundaries" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Package Boundaries */}
              <Card>
                <CardHeader>
                  <CardTitle>Package Boundaries</CardTitle>
                  <CardDescription>
                    Define what constitutes single session, short-term, and ongoing packages.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Single Session</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Max Sessions</Label>
                        <Input
                          type="number"
                          min={1}
                          value={localConfig.package_boundaries.single_session.max_sessions}
                          onChange={(e) => handlePackageBoundaryChange('single_session', 'max_sessions', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Max Weeks</Label>
                        <Input
                          type="number"
                          min={1}
                          value={localConfig.package_boundaries.single_session.max_weeks}
                          onChange={(e) => handlePackageBoundaryChange('single_session', 'max_weeks', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Short Term</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Min Sessions</Label>
                        <Input
                          type="number"
                          min={1}
                          value={localConfig.package_boundaries.short_term.min_sessions}
                          onChange={(e) => handlePackageBoundaryChange('short_term', 'min_sessions', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Max Sessions</Label>
                        <Input
                          type="number"
                          min={1}
                          value={localConfig.package_boundaries.short_term.max_sessions}
                          onChange={(e) => handlePackageBoundaryChange('short_term', 'max_sessions', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Max Weeks</Label>
                        <Input
                          type="number"
                          min={1}
                          value={localConfig.package_boundaries.short_term.max_weeks}
                          onChange={(e) => handlePackageBoundaryChange('short_term', 'max_weeks', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Ongoing</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs">Min Sessions</Label>
                        <Input
                          type="number"
                          min={1}
                          value={localConfig.package_boundaries.ongoing.min_sessions}
                          onChange={(e) => handlePackageBoundaryChange('ongoing', 'min_sessions', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Min Months</Label>
                        <Input
                          type="number"
                          min={1}
                          value={localConfig.package_boundaries.ongoing.min_months}
                          onChange={(e) => handlePackageBoundaryChange('ongoing', 'min_months', Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Budget Tolerance */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget Tolerance</CardTitle>
                  <CardDescription>
                    Configure how strictly budget matching is enforced.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Soft Tolerance (%)</Label>
                        <Badge variant="outline">{localConfig.budget.soft_tolerance_percent}%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Trainers up to this % above client's max budget get reduced scores
                      </p>
                      <Slider
                        value={[localConfig.budget.soft_tolerance_percent]}
                        min={0}
                        max={50}
                        step={5}
                        onValueChange={([v]) => handleBudgetChange('soft_tolerance_percent', v)}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Hard Exclusion (%)</Label>
                        <Badge variant="outline">{localConfig.budget.hard_exclusion_percent}%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Trainers more than this % above client's max budget are excluded
                      </p>
                      <Slider
                        value={[localConfig.budget.hard_exclusion_percent]}
                        min={10}
                        max={100}
                        step={5}
                        onValueChange={([v]) => handleBudgetChange('hard_exclusion_percent', v)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>
                  Enable or disable specific matching algorithm features.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label>Ideal Client Type Bonus</Label>
                        <Badge variant="secondary" className="text-xs">
                          {localConfig.weights.ideal_client_type.value}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Apply bonus scoring when client matches trainer's ideal client profile
                      </p>
                      <p className="text-xs text-muted-foreground/70 italic">
                        When enabled, contributes up to {localConfig.weights.ideal_client_type.value}% to the total match score
                      </p>
                    </div>
                    <Switch
                      checked={localConfig.feature_flags.use_ideal_client_bonus}
                      onCheckedChange={(v) => handleFeatureFlagChange('use_ideal_client_bonus', v)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Label>Discovery Call Penalty</Label>
                        <Badge variant="secondary" className="text-xs">
                          {localConfig.weights.discovery_call.value}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Reduce score when trainer's discovery call preference doesn't match client's
                      </p>
                      <p className="text-xs text-muted-foreground/70 italic">
                        When enabled, contributes up to {localConfig.weights.discovery_call.value}% to the total match score
                      </p>
                    </div>
                    <Switch
                      checked={localConfig.feature_flags.use_discovery_call_penalty}
                      onCheckedChange={(v) => handleFeatureFlagChange('use_discovery_call_penalty', v)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Hard Exclusions</Label>
                      <p className="text-xs text-muted-foreground">
                        Exclude trainers who fail hard requirements (gender, format, budget ceiling)
                      </p>
                    </div>
                    <Switch
                      checked={localConfig.feature_flags.enable_hard_exclusions}
                      onCheckedChange={(v) => handleFeatureFlagChange('enable_hard_exclusions', v)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Availability Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Availability Scoring
                  <Badge variant="secondary" className="text-xs">
                    Part of Schedule/Frequency ({localConfig.weights.schedule_frequency.value}%)
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Configure how availability timing affects match scores. These settings are calculated as part of the Schedule/Frequency weight.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">ASAP Timeline</h4>
                    <div className="space-y-2">
                      <Label className="text-xs">Max Days for Full Score</Label>
                      <Input
                        type="number"
                        min={1}
                        value={localConfig.availability.asap.max_days_full_score}
                        onChange={(e) => setLocalConfig(prev => ({
                          ...prev,
                          availability: {
                            ...prev.availability,
                            asap: { ...prev.availability.asap, max_days_full_score: Number(e.target.value) }
                          }
                        }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Max Days for Partial Score</Label>
                      <Input
                        type="number"
                        min={1}
                        value={localConfig.availability.asap.max_days_partial}
                        onChange={(e) => {
                          setLocalConfig(prev => ({
                            ...prev,
                            availability: {
                              ...prev.availability,
                              asap: { ...prev.availability.asap, max_days_partial: Number(e.target.value) }
                            }
                          }));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">Within Month Timeline</h4>
                    <div className="space-y-2">
                      <Label className="text-xs">Max Days for Full Score</Label>
                      <Input
                        type="number"
                        min={1}
                        value={localConfig.availability.within_month.max_days_full_score}
                        onChange={(e) => {
                          setLocalConfig(prev => ({
                            ...prev,
                            availability: {
                              ...prev.availability,
                              within_month: { max_days_full_score: Number(e.target.value) }
                            }
                          }));
                          setHasChanges(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
