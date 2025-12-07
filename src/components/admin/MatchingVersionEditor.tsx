import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Save, 
  Rocket, 
  Copy, 
  CheckCircle, 
  FileEdit, 
  Archive,
  Loader2,
  Lock
} from "lucide-react";
import { MatchingVersion, MatchingAlgorithmConfig, WeightConfig } from "@/types/matching";
import { 
  useUpdateMatchingVersion, 
  usePublishMatchingVersion, 
  useCloneMatchingVersion,
  useLiveMatchingVersion
} from "@/hooks/useMatchingVersions";
import { MatchingScoringLogic } from "./MatchingScoringLogic";

interface MatchingVersionEditorProps {
  version: MatchingVersion;
  mode: 'view' | 'edit';
  onBack: () => void;
  onVersionCreated?: (version: MatchingVersion) => void;
}

export function MatchingVersionEditor({ version, mode, onBack, onVersionCreated }: MatchingVersionEditorProps) {
  const [config, setConfig] = useState<MatchingAlgorithmConfig>(version.config);
  const [name, setName] = useState(version.name);
  const [notes, setNotes] = useState(version.notes || "");
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const updateMutation = useUpdateMatchingVersion();
  const publishMutation = usePublishMatchingVersion();
  const cloneMutation = useCloneMatchingVersion();
  const { data: liveVersion } = useLiveMatchingVersion();

  const isReadOnly = mode === 'view' || version.status !== 'draft';
  const isDraft = version.status === 'draft';
  const liveConfig = liveVersion?.config;

  useEffect(() => {
    setConfig(version.config);
    setName(version.name);
    setNotes(version.notes || "");
    setHasChanges(false);
  }, [version]);

  const handleConfigChange = (newConfig: MatchingAlgorithmConfig) => {
    setConfig(newConfig);
    setHasChanges(true);
  };

  const handleWeightChange = (key: keyof MatchingAlgorithmConfig['weights'], value: number) => {
    handleConfigChange({
      ...config,
      weights: {
        ...config.weights,
        [key]: { ...config.weights[key], value }
      }
    });
  };

  const handleThresholdChange = (key: keyof MatchingAlgorithmConfig['thresholds'], value: number) => {
    handleConfigChange({
      ...config,
      thresholds: { ...config.thresholds, [key]: value }
    });
  };

  const handleFeatureFlagChange = (key: keyof MatchingAlgorithmConfig['feature_flags'], value: boolean) => {
    handleConfigChange({
      ...config,
      feature_flags: { ...config.feature_flags, [key]: value }
    });
  };

  const handleSave = () => {
    updateMutation.mutate(
      { id: version.id, config, name, notes },
      { onSuccess: () => setHasChanges(false) }
    );
  };

  const handlePublish = () => {
    // Save first if there are changes
    if (hasChanges) {
      updateMutation.mutate(
        { id: version.id, config, name, notes },
        {
          onSuccess: () => {
            publishMutation.mutate(version.id, {
              onSuccess: () => {
                setShowPublishDialog(false);
                onBack();
              },
            });
          },
        }
      );
    } else {
      publishMutation.mutate(version.id, {
        onSuccess: () => {
          setShowPublishDialog(false);
          onBack();
        },
      });
    }
  };

  const handleClone = () => {
    cloneMutation.mutate(
      { sourceVersionId: version.id },
      {
        onSuccess: (newVersion) => {
          onVersionCreated?.(newVersion);
        },
      }
    );
  };

  const getStatusBadge = () => {
    switch (version.status) {
      case 'live':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"><CheckCircle className="w-3 h-3 mr-1" /> Live</Badge>;
      case 'draft':
        return <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20"><FileEdit className="w-3 h-3 mr-1" /> Draft</Badge>;
      case 'archived':
        return <Badge variant="outline" className="text-muted-foreground"><Archive className="w-3 h-3 mr-1" /> Archived</Badge>;
    }
  };

  const totalWeight = Object.values(config.weights).reduce((sum, w) => sum + w.value, 0);

  const WeightSlider = ({ 
    label, 
    weightKey, 
    weight 
  }: { 
    label: string; 
    weightKey: keyof MatchingAlgorithmConfig['weights']; 
    weight: WeightConfig;
  }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="text-sm">{label}</Label>
        <span className="text-sm font-mono text-muted-foreground">{weight.value}%</span>
      </div>
      <Slider
        value={[weight.value]}
        min={weight.min}
        max={weight.max}
        step={1}
        onValueChange={([v]) => handleWeightChange(weightKey, v)}
        disabled={isReadOnly}
        className={isReadOnly ? "opacity-60" : ""}
      />
      <p className="text-xs text-muted-foreground">Range: {weight.min}–{weight.max}%</p>
    </div>
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Version {version.version_number}</h2>
                {getStatusBadge()}
                {isReadOnly && !isDraft && (
                  <Badge variant="outline" className="text-muted-foreground">
                    <Lock className="w-3 h-3 mr-1" /> Read-only
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isDraft && (
              <Button variant="outline" onClick={handleClone} disabled={cloneMutation.isPending}>
                {cloneMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Copy className="w-4 h-4 mr-2" />}
                Clone as New Version
              </Button>
            )}
            {isDraft && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleSave} 
                  disabled={!hasChanges || updateMutation.isPending}
                >
                  {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Draft
                </Button>
                <Button 
                  onClick={() => setShowPublishDialog(true)} 
                  disabled={publishMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {publishMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Rocket className="w-4 h-4 mr-2" />}
                  Publish
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Version Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Version Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => { setName(e.target.value); setHasChanges(true); }}
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setHasChanges(true); }}
                disabled={isReadOnly}
                placeholder="Describe changes in this version..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuration Tabs */}
        <Tabs defaultValue="weights" className="space-y-4">
          <TabsList>
            <TabsTrigger value="weights">Weights</TabsTrigger>
            <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
            <TabsTrigger value="features">Feature Flags</TabsTrigger>
            <TabsTrigger value="scoring-logic">Scoring Logic</TabsTrigger>
          </TabsList>

          <TabsContent value="weights">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Category Weights</CardTitle>
                <CardDescription>
                  Adjust how much each category contributes to the overall match score.
                  Total: <span className={totalWeight === 100 ? "text-emerald-500" : "text-destructive"}>{totalWeight}%</span>
                  {totalWeight !== 100 && " (should be 100%)"}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <WeightSlider label="Goals & Specialties" weightKey="goals_specialties" weight={config.weights.goals_specialties} />
                <WeightSlider label="Location & Format" weightKey="location_format" weight={config.weights.location_format} />
                <WeightSlider label="Coaching Style" weightKey="coaching_style" weight={config.weights.coaching_style} />
                <WeightSlider label="Schedule & Frequency" weightKey="schedule_frequency" weight={config.weights.schedule_frequency} />
                <WeightSlider label="Budget Fit" weightKey="budget_fit" weight={config.weights.budget_fit} />
                <WeightSlider label="Experience Level" weightKey="experience_level" weight={config.weights.experience_level} />
                <WeightSlider label="Ideal Client Type" weightKey="ideal_client_type" weight={config.weights.ideal_client_type} />
                <WeightSlider label="Package Alignment" weightKey="package_alignment" weight={config.weights.package_alignment} />
                <WeightSlider label="Discovery Call" weightKey="discovery_call" weight={config.weights.discovery_call} />
                <WeightSlider label="Motivation Alignment" weightKey="motivation_alignment" weight={config.weights.motivation_alignment} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="thresholds">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Match Thresholds</CardTitle>
                <CardDescription>
                  Configure the score thresholds for displaying and labeling matches.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Minimum Baseline Score</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[config.thresholds.minimum_baseline_score ?? 45]}
                        min={0}
                        max={60}
                        step={5}
                        onValueChange={([v]) => handleThresholdChange('minimum_baseline_score', v)}
                        disabled={isReadOnly}
                        className={isReadOnly ? "opacity-60 flex-1" : "flex-1"}
                      />
                      <span className="font-mono text-sm w-12">{config.thresholds.minimum_baseline_score ?? 45}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Floor for all scores - no trainer scores below this</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum Score to Show</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[config.thresholds.min_match_to_show]}
                        min={0}
                        max={50}
                        step={5}
                        onValueChange={([v]) => handleThresholdChange('min_match_to_show', v)}
                        disabled={isReadOnly}
                        className={isReadOnly ? "opacity-60 flex-1" : "flex-1"}
                      />
                      <span className="font-mono text-sm w-12">{config.thresholds.min_match_to_show}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Trainers below this score are hidden</p>
                  </div>
                  <div className="space-y-2">
                    <Label>"Good Match" Label</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[config.thresholds.good_match_label]}
                        min={30}
                        max={70}
                        step={5}
                        onValueChange={([v]) => handleThresholdChange('good_match_label', v)}
                        disabled={isReadOnly}
                        className={isReadOnly ? "opacity-60 flex-1" : "flex-1"}
                      />
                      <span className="font-mono text-sm w-12">{config.thresholds.good_match_label}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Minimum for "Good Match" badge</p>
                  </div>
                  <div className="space-y-2">
                    <Label>"Top Match" Label</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        value={[config.thresholds.top_match_label]}
                        min={50}
                        max={95}
                        step={5}
                        onValueChange={([v]) => handleThresholdChange('top_match_label', v)}
                        disabled={isReadOnly}
                        className={isReadOnly ? "opacity-60 flex-1" : "flex-1"}
                      />
                      <span className="font-mono text-sm w-12">{config.thresholds.top_match_label}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Minimum for "Top Match" badge</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Budget Tolerance</h4>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Soft Tolerance</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[config.budget.soft_tolerance_percent]}
                          min={0}
                          max={50}
                          step={5}
                          onValueChange={([v]) => handleConfigChange({
                            ...config,
                            budget: { ...config.budget, soft_tolerance_percent: v }
                          })}
                          disabled={isReadOnly}
                          className={isReadOnly ? "opacity-60 flex-1" : "flex-1"}
                        />
                        <span className="font-mono text-sm w-12">{config.budget.soft_tolerance_percent}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Trainers within this % of budget get partial score</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Hard Exclusion</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          value={[config.budget.hard_exclusion_percent]}
                          min={20}
                          max={100}
                          step={5}
                          onValueChange={([v]) => handleConfigChange({
                            ...config,
                            budget: { ...config.budget, hard_exclusion_percent: v }
                          })}
                          disabled={isReadOnly}
                          className={isReadOnly ? "opacity-60 flex-1" : "flex-1"}
                        />
                        <span className="font-mono text-sm w-12">{config.budget.hard_exclusion_percent}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Trainers beyond this % of budget are excluded</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Feature Flags</CardTitle>
                <CardDescription>
                  Toggle specific matching behaviors on or off.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Ideal Client Bonus</Label>
                    <p className="text-sm text-muted-foreground">
                      Give bonus points when client matches trainer's ideal client type
                    </p>
                  </div>
                  <Switch
                    checked={config.feature_flags.use_ideal_client_bonus}
                    onCheckedChange={(v) => handleFeatureFlagChange('use_ideal_client_bonus', v)}
                    disabled={isReadOnly}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Hard Exclusions</Label>
                    <p className="text-sm text-muted-foreground">
                      Completely exclude trainers who fail critical criteria (e.g., way over budget)
                    </p>
                  </div>
                  <Switch
                    checked={config.feature_flags.enable_hard_exclusions}
                    onCheckedChange={(v) => handleFeatureFlagChange('enable_hard_exclusions', v)}
                    disabled={isReadOnly}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scoring-logic">
            <MatchingScoringLogic 
              currentConfig={config}
              liveConfig={liveConfig}
              isDraft={isDraft}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Publish Confirmation Dialog */}
      <AlertDialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Version {version.version_number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make v{version.version_number} the live version used for all trainer matching. 
              The current live version will be archived.
              <br /><br />
              <strong>This action cannot be undone.</strong> You can always clone the archived version to create a new draft if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePublish} 
              disabled={publishMutation.isPending || updateMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {(publishMutation.isPending || updateMutation.isPending) ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4 mr-2" />
              )}
              Publish v{version.version_number}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
