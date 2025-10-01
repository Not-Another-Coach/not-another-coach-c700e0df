import { useNavigate } from 'react-router-dom';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { UserCircle, Dumbbell } from 'lucide-react';
import { useUserIntent } from '@/hooks/useUserIntent';

export function UserModeToggle() {
  const { userIntent, setUserIntent } = useUserIntent();
  const navigate = useNavigate();

  const handleValueChange = (value: string) => {
    if (!value) return; // Prevent deselection
    
    const intent = value as 'client' | 'trainer';
    setUserIntent(intent);
    
    // Navigate to appropriate section based on selection
    if (intent === 'trainer') {
      navigate('/trainer/demo');
    } else {
      // Scroll to browse section for clients
      const browseSection = document.getElementById('browse-trainers');
      if (browseSection) {
        browseSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <ToggleGroup 
      type="single" 
      value={userIntent || undefined}
      onValueChange={handleValueChange}
      className="bg-muted/50 p-1 rounded-lg"
    >
      <ToggleGroupItem 
        value="client" 
        aria-label="Find a Coach"
        className="gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <UserCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Find a Coach</span>
        <span className="sm:hidden">Client</span>
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="trainer" 
        aria-label="I'm a Coach"
        className="gap-2 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
      >
        <Dumbbell className="h-4 w-4" />
        <span className="hidden sm:inline">I'm a Coach</span>
        <span className="sm:hidden">Coach</span>
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
