import { 
  Dumbbell, 
  Scale, 
  Baby, 
  Heart, 
  Users, 
  Zap, 
  Activity, 
  Target, 
  Bike,
  TreePine,
  Home,
  Calendar,
  Trophy,
  Flame,
  LucideIcon
} from "lucide-react";

// Service icon mapping for specialties and training types
export const serviceIconMap: Record<string, LucideIcon> = {
  // Weight & Strength Training
  'strength training': Dumbbell,
  'strength': Dumbbell,
  'weight training': Dumbbell,
  'weightlifting': Dumbbell,
  'powerlifting': Dumbbell,
  'bodybuilding': Dumbbell,
  'resistance training': Dumbbell,
  
  // Weight Loss & Body Composition
  'weight loss': Scale,
  'fat loss': Scale,
  'body composition': Scale,
  'weight management': Scale,
  'body transformation': Scale,
  
  // Maternal & Family Fitness
  'pre/postnatal': Baby,
  'prenatal': Baby,
  'postnatal': Baby,
  'pre-natal': Baby,
  'post-natal': Baby,
  'pregnancy fitness': Baby,
  'postpartum': Baby,
  
  // Cardiovascular & Endurance
  'cardio': Heart,
  'cardiovascular': Heart,
  'endurance': Heart,
  'running': Activity,
  'marathon training': Activity,
  'hiit': Zap,
  'high intensity': Zap,
  
  // Group & Personal Training
  'personal training': Users,
  '1-on-1': Users,
  'small group': Users,
  'group training': Users,
  'team training': Users,
  
  // Specialized Training
  'functional training': Activity,
  'functional fitness': Activity,
  'athletic performance': Trophy,
  'sports performance': Trophy,
  'rehabilitation': Heart,
  'injury prevention': Heart,
  
  // Lifestyle & Wellness
  'nutrition': Flame,
  'wellness': Heart,
  'lifestyle coaching': Heart,
  'habit coaching': Target,
  
  // Activity-Specific
  'cycling': Bike,
  'outdoor training': TreePine,
  'home workouts': Home,
  'online training': Calendar,
  
  // Default fallback
  'default': Target
};

// Service name standardization
export const standardizeServiceName = (serviceName: string): string => {
  const normalized = serviceName.toLowerCase().trim();
  
  const standardizations: Record<string, string> = {
    'weight loss': 'Weight Loss Coaching',
    'pre/postnatal': 'Pre & Postnatal Fitness',
    'prenatal': 'Prenatal Fitness',
    'postnatal': 'Postnatal Fitness',
    'strength training': 'Strength Training',
    'cardio': 'Cardiovascular Training',
    'hiit': 'HIIT Training',
    'personal training': '1-on-1 Personal Training',
    '1-on-1 personal training & small group training (2–4 people)': '1-on-1 & Small Group Training',
    'group training': 'Small Group Training',
    'functional training': 'Functional Fitness',
    'nutrition': 'Nutrition Coaching',
    'online training': 'Online Training',
    'home workouts': 'Home Workouts'
  };
  
  return standardizations[normalized] || serviceName;
};

// Get appropriate icon for a service
export const getServiceIcon = (serviceName: string): LucideIcon => {
  const normalized = serviceName.toLowerCase().trim();
  
  // Check for exact matches first
  if (serviceIconMap[normalized]) {
    return serviceIconMap[normalized];
  }
  
  // Check for partial matches
  for (const [key, icon] of Object.entries(serviceIconMap)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return icon;
    }
  }
  
  return serviceIconMap.default;
};

// Determine if a service should be highlighted
// Now prioritizes database highlight_type over keyword matching
export const getServiceHighlight = (
  serviceName: string, 
  allServices: string[] = [], 
  databaseHighlightType?: 'popular' | 'specialist' | null
): 'popular' | 'specialist' | null => {
  // Prioritize database value if available
  if (databaseHighlightType) {
    return databaseHighlightType;
  }
  
  // Fallback to keyword-based logic for backward compatibility
  const normalized = serviceName.toLowerCase().trim();
  
  // Popular services (common, foundational)
  const popularServices = [
    'strength training',
    'weight loss',
    'personal training',
    '1-on-1',
    'cardio'
  ];
  
  // Specialist services (niche, specialized)
  const specialistServices = [
    'pre/postnatal',
    'prenatal',
    'postnatal',
    'rehabilitation',
    'sports performance',
    'athletic performance',
    'injury prevention'
  ];
  
  if (popularServices.some(popular => normalized.includes(popular) || popular.includes(normalized))) {
    return 'popular';
  }
  
  if (specialistServices.some(specialist => normalized.includes(specialist) || specialist.includes(normalized))) {
    return 'specialist';
  }
  
  return null;
};