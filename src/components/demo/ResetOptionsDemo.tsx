import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuickResetMenu } from "@/components/ui/QuickResetMenu";
import { ResetOptionsButton } from "@/components/ui/ResetOptionsButton";
import { Badge } from "@/components/ui/badge";
import { useUserIntent } from "@/hooks/useUserIntent";
import { useAnonymousSession } from "@/hooks/useAnonymousSession";

export const ResetOptionsDemo = () => {
  const { userIntent } = useUserIntent();
  const { session } = useAnonymousSession();

  const hasSavedData = session && (
    (session.savedTrainers && session.savedTrainers.length > 0) || 
    session.quizResults
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Reset Options Demo</h2>
        <p className="text-muted-foreground">
          Try different ways to reset your browsing session
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Session Status</CardTitle>
          <CardDescription>Your current anonymous browsing state</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant={userIntent ? "default" : "secondary"}>
              {userIntent ? `Looking as ${userIntent}` : "No intent set"}
            </Badge>
            {session?.savedTrainers && session.savedTrainers.length > 0 && (
              <Badge variant="outline">
                {session.savedTrainers.length} saved trainers
              </Badge>
            )}
            {session?.quizResults && (
              <Badge variant="outline">Quiz completed</Badge>
            )}
            {session?.sessionId && (
              <Badge variant="outline" className="font-mono text-xs">
                Session: {session.sessionId.slice(-8)}
              </Badge>
            )}
          </div>
          
          {!hasSavedData && !userIntent && (
            <p className="text-sm text-muted-foreground mt-2">
              Complete the quiz or save some trainers to see reset options in action!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Demo Components */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Reset Menu */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Reset Menu</CardTitle>
            <CardDescription>
              Dropdown menu with both reset options - great for headers and compact spaces
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <QuickResetMenu variant="outline" size="sm" />
              <QuickResetMenu variant="ghost" size="sm">
                Custom Text
              </QuickResetMenu>
            </div>
            
            <div className="text-xs text-muted-foreground">
              • Shows current status in dropdown<br/>
              • Quick access to both options<br/>
              • Minimal space usage
            </div>
          </CardContent>
        </Card>

        {/* Reset Options Button */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reset Options Modal</CardTitle>
            <CardDescription>
              Full modal with detailed explanations - perfect for settings pages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <ResetOptionsButton variant="outline" size="sm" />
              <ResetOptionsButton variant="default" size="sm">
                Reset My Data
              </ResetOptionsButton>
            </div>
            
            <div className="text-xs text-muted-foreground">
              • Detailed explanation of each option<br/>
              • Shows what will be kept vs cleared<br/>
              • Warning for data loss
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage Examples</CardTitle>
          <CardDescription>Where to use each component</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">QuickResetMenu:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• Navigation headers</li>
                <li>• User profile dropdowns</li>
                <li>• Toolbar/compact UIs</li>
                <li>• Mobile interfaces</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">ResetOptionsButton:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li>• Settings pages</li>
                <li>• Account management</li>
                <li>• Help/support sections</li>
                <li>• When explanation is needed</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};