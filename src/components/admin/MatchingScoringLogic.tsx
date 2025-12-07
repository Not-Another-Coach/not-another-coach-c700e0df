import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, Code, Lock, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Hardcoded matching logic constants - these are baked into useEnhancedTrainerMatching.tsx
const HARDCODED_WEIGHTS = {
  goals_specialties: { base: 25, description: "Client goals matched to trainer specialties" },
  location_format: { base: 20, description: "Training location and format compatibility" },
  coaching_style: { base: 20, description: "Coaching approach alignment" },
  schedule_frequency: { base: 15, description: "Availability and session frequency" },
  budget_fit: { base: 5, description: "Price range compatibility" },
  experience_level: { base: 5, description: "Client experience vs trainer expertise" },
  ideal_client_type: { base: 5, description: "Trainer's preferred client profile" },
  package_alignment: { base: 3, description: "Package type preferences" },
  discovery_call: { base: 2, description: "Discovery call offering" },
};

const GOAL_SPECIALTY_MAPPINGS = [
  { goal: "weight_loss", specialties: ["Weight Loss", "Nutrition", "HIIT"], weight: 1.0 },
  { goal: "muscle_building", specialties: ["Strength Training", "Bodybuilding", "Hypertrophy"], weight: 1.0 },
  { goal: "general_fitness", specialties: ["General Fitness", "Functional Training"], weight: 0.8 },
  { goal: "sports_performance", specialties: ["Sports Conditioning", "Athletic Training"], weight: 1.0 },
  { goal: "flexibility", specialties: ["Yoga", "Pilates", "Mobility"], weight: 1.0 },
  { goal: "rehabilitation", specialties: ["Rehabilitation", "Corrective Exercise", "Post-Injury"], weight: 1.0 },
  { goal: "endurance", specialties: ["Cardio", "Running", "Endurance Training"], weight: 1.0 },
];

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
  { tier: "Top Match", range: "75-100%", color: "emerald" },
  { tier: "Good Match", range: "50-74%", color: "blue" },
  { tier: "Potential Match", range: "30-49%", color: "amber" },
];

export function MatchingScoringLogic() {
  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This tab shows the <strong>hardcoded scoring logic</strong> that cannot be changed via configuration. 
          These rules are built into the matching algorithm code. To modify them, code changes are required.
        </AlertDescription>
      </Alert>

      <Collapsible defaultOpen>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Base Category Weights</CardTitle>
              </div>
              <ChevronDown className="w-4 h-4" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Base Weight</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(HARDCODED_WEIGHTS).map(([key, val]) => (
                    <TableRow key={key}>
                      <TableCell className="font-mono text-sm">{key}</TableCell>
                      <TableCell><Badge variant="outline">{val.base}%</Badge></TableCell>
                      <TableCell className="text-muted-foreground">{val.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Goal → Specialty Mappings</CardTitle>
              </div>
              <ChevronDown className="w-4 h-4" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <CardDescription className="mb-4">
                How client fitness goals are matched to trainer specialties.
              </CardDescription>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Goal</TableHead>
                    <TableHead>Matched Specialties</TableHead>
                    <TableHead>Weight</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {GOAL_SPECIALTY_MAPPINGS.map((mapping) => (
                    <TableRow key={mapping.goal}>
                      <TableCell className="font-mono text-sm">{mapping.goal}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {mapping.specialties.map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{mapping.weight * 100}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Coaching Style Mappings</CardTitle>
              </div>
              <ChevronDown className="w-4 h-4" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
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

      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Experience Level Criteria</CardTitle>
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

      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Score Modifiers & Penalties</CardTitle>
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

      <Collapsible>
        <Card>
          <CollapsibleTrigger className="w-full">
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-muted-foreground" />
                <CardTitle className="text-base">Diversity Tiers</CardTitle>
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
                    <div className={`w-3 h-3 rounded-full bg-${tier.color}-500`} />
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
