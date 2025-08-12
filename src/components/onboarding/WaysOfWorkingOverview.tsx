import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePackageWaysOfWorking } from '@/hooks/usePackageWaysOfWorking';

export function WaysOfWorkingOverview() {
  const { packageWorkflows, loading: workflowsLoading } = usePackageWaysOfWorking();

  if (workflowsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ways of Working Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderWaysOfWorkingOverview = () => {
    if (!packageWorkflows || packageWorkflows.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No package workflows found.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Set up your Ways of Working in the profile setup to see the breakdown here.
          </p>
        </div>
      );
    }

    const sections = [
      { 
        title: 'Getting Started', 
        items: [
          { name: 'Onboarding Process', key: 'onboarding_items' },
          { name: 'What I Bring', key: 'what_i_bring_items' }
        ]
      },
      { 
        title: 'First Week', 
        items: [
          { name: 'First Week Structure', key: 'first_week_items' }
        ]
      },
      { 
        title: 'Ongoing Structure', 
        items: [
          { name: 'Ongoing Process', key: 'ongoing_structure_items' },
          { name: 'Tracking Tools', key: 'tracking_tools_items' },
          { name: 'Client Expectations', key: 'client_expectations_items' }
        ]
      }
    ];

    // Collect all unique action items across all packages and sections
    const allActionItems: Array<{
      header1: string;
      header2: string;
      actionItem: string;
      description?: string;
      packages: { [packageName: string]: boolean };
    }> = [];

    sections.forEach(section => {
      section.items.forEach(item => {
        const itemsAcrossPackages: { [actionItem: string]: { packages: string[]; description?: string } } = {};
        
        // Collect items from all packages for this section/item combination
        packageWorkflows.forEach(workflow => {
          const items = (workflow[item.key as keyof typeof workflow] as any[]) || [];
          items.forEach((listItem: any) => {
            const actionText = typeof listItem === 'string' ? listItem : listItem.text;
            const description = typeof listItem === 'object' ? listItem.description : undefined;
            
            if (!itemsAcrossPackages[actionText]) {
              itemsAcrossPackages[actionText] = { packages: [], description };
            }
            itemsAcrossPackages[actionText].packages.push(workflow.package_name);
          });
        });

        // Convert to our format
        Object.entries(itemsAcrossPackages).forEach(([actionText, data]) => {
          const packageFlags: { [packageName: string]: boolean } = {};
          packageWorkflows.forEach(workflow => {
            packageFlags[workflow.package_name] = data.packages.includes(workflow.package_name);
          });

          allActionItems.push({
            header1: section.title,
            header2: item.name,
            actionItem: actionText,
            description: data.description,
            packages: packageFlags
          });
        });
      });
    });

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left p-3 font-semibold bg-muted/50">Category</th>
              <th className="text-left p-3 font-semibold bg-muted/50">Section</th>
              <th className="text-left p-3 font-semibold bg-muted/50">Action Item</th>
              <th className="text-left p-3 font-semibold bg-muted/50">Description</th>
              {packageWorkflows.map(workflow => (
                <th key={workflow.id} className="text-center p-3 font-semibold bg-primary/10 min-w-24">
                  {workflow.package_name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allActionItems.length === 0 ? (
              <tr>
                <td colSpan={4 + packageWorkflows.length} className="text-center py-8 text-muted-foreground">
                  No action items found. Add items to your Ways of Working sections.
                </td>
              </tr>
            ) : (
              allActionItems.map((item, index) => {
                const isFirstInSection = index === 0 || allActionItems[index - 1].header1 !== item.header1;
                const isFirstInSubsection = index === 0 || 
                  allActionItems[index - 1].header1 !== item.header1 || 
                  allActionItems[index - 1].header2 !== item.header2;
                
                return (
                  <tr key={index} className="border-b border-border hover:bg-muted/20">
                    <td className="p-3 font-medium text-primary">
                      {isFirstInSection ? item.header1 : ''}
                    </td>
                    <td className="p-3 font-medium">
                      {isFirstInSubsection ? item.header2 : ''}
                    </td>
                    <td className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{item.actionItem}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {item.description || '-'}
                    </td>
                    {packageWorkflows.map(workflow => (
                      <td key={workflow.id} className="text-center p-3">
                        {item.packages[workflow.package_name] ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <div className="w-5 h-5 border border-muted-foreground/30 rounded-full mx-auto"></div>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ways of Working Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {renderWaysOfWorkingOverview()}
      </CardContent>
    </Card>
  );
}