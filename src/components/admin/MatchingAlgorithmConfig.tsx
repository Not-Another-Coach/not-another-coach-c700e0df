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
import { useMatchingConfig, DEFAULT_MATCHING_CONFIG, MatchingAlgorithmConfig as ConfigType } from "@/hooks/useMatchingConfig";
import { AlertTriangle, Save, RotateCcw, Sparkles, Target, Scale, Clock, Settings2 } from "lucide-react";

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
        <Tabs defaultValue="weights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
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
