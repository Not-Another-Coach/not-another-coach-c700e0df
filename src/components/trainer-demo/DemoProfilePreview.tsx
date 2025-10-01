import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrainerProfilePreview } from '@/components/TrainerProfilePreview';
import { Loader2 } from 'lucide-react';

// Hardcoded demo trainer profile for consistent demo experience
const DEMO_TRAINER_DATA = {
  firstName: 'Alex',
  lastName: 'Johnson',
  profilePhotoUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
  profileImagePosition: 'center',
  tagline: 'Transform Your Body, Transform Your Life',
  bio: `With over 8 years of experience in personal training and nutrition coaching, I've helped hundreds of clients achieve their fitness goals and maintain lasting results. My approach combines evidence-based training methods with sustainable nutrition strategies tailored to your lifestyle.

I specialize in working with busy professionals who want to get in shape without sacrificing their career or family time. Whether you're looking to lose weight, build muscle, or simply feel more confident in your body, I'll create a personalized plan that fits your schedule and preferences.

My qualifications include NASM-CPT, Precision Nutrition Level 1, and certifications in corrective exercise and performance enhancement. I believe in making fitness enjoyable and sustainable - no crash diets or unsustainable workout routines.`,
  location: 'London, UK',
  experience: '8+ years',
  hourlyRate: 65,
  rating: 4.9,
  totalRatings: 127,
  isVerified: true,
  status: 'accepting',
  instagram_handle: '@alexjohnson_pt',
  instagram_connected: true,
  instagram_posts: [
    {
      id: 'demo-ig-1',
      media_url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&h=600&fit=crop',
      media_type: 'IMAGE',
      caption: '💪 Client transformation alert! Sarah lost 15kg in 4 months and gained incredible strength. Consistency beats perfection every time! 🎯\n\n#transformation #fitnessmotivation #personaltrainer',
      permalink: 'https://instagram.com/p/demo1',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-ig-2',
      media_url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&h=600&fit=crop',
      media_type: 'IMAGE',
      caption: '🔥 Quick home workout you can do anywhere! No equipment needed - just your bodyweight and determination.\n\nSave this for later! 💾\n\n#homeworkout #fitnessjourney #trainwithme',
      permalink: 'https://instagram.com/p/demo2',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-ig-3',
      media_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&h=600&fit=crop',
      media_type: 'IMAGE',
      caption: '🥗 Nutrition tip: You don\'t need to eat "clean" 100% of the time. Aim for balance, not perfection. Here\'s my go-to high-protein meal prep.\n\n#nutritioncoach #mealprep #healthyeating',
      permalink: 'https://instagram.com/p/demo3',
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-ig-4',
      media_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=600&fit=crop',
      media_type: 'IMAGE',
      caption: '🏋️ Form check: Deadlifts! This exercise is a game-changer for building full-body strength. Swipe for key technique cues.\n\n#deadlift #strengthtraining #formcheck',
      permalink: 'https://instagram.com/p/demo4',
      timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-ig-5',
      media_url: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=600&h=600&fit=crop',
      media_type: 'IMAGE',
      caption: '✨ Mindset Monday: Your body can stand almost anything. It\'s your mind that you need to convince.\n\nWhat\'s your fitness goal for this week? 👇\n\n#mondaymotivation #fitnessmindset #goalsetting',
      permalink: 'https://instagram.com/p/demo5',
      timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-ig-6',
      media_url: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=600&h=600&fit=crop',
      media_type: 'IMAGE',
      caption: '🎯 Taking on new clients for online and in-person training! Limited spots available. DM me to chat about your goals!\n\n#personaltrainer #londonpt #onlinecoaching',
      permalink: 'https://instagram.com/p/demo6',
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  specializations: [
    'Weight Loss',
    'Strength Training',
    'Nutrition Coaching',
    'Body Transformation',
    'Functional Fitness'
  ],
  trainingTypes: ['In-Person', 'Online', 'Hybrid'],
  packageOptions: [
    {
      id: 'demo-pkg-1',
      name: 'Kickstart Package',
      description: '4 weeks of personalized training and nutrition guidance',
      price: 399,
      currency: 'GBP',
      duration: '4 weeks',
      sessions: 8,
      features: [
        '8 personal training sessions',
        'Custom nutrition plan',
        'Weekly progress check-ins',
        'Exercise library access'
      ]
    },
    {
      id: 'demo-pkg-2',
      name: 'Transformation Package',
      description: '12 weeks of comprehensive coaching for serious results',
      price: 999,
      currency: 'GBP',
      duration: '12 weeks',
      sessions: 24,
      features: [
        '24 personal training sessions',
        'Personalized meal plans',
        'Bi-weekly body composition analysis',
        'Unlimited messaging support',
        'Custom workout programs for gym/home'
      ],
      isPromotional: true,
      promotionPrice: 899,
      promotionStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      promotionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-pkg-3',
      name: 'Online Coaching',
      description: 'Flexible online-only training for remote clients',
      price: 249,
      currency: 'GBP',
      duration: '4 weeks',
      sessions: 0,
      features: [
        'Custom workout program',
        'Nutrition guidance & meal planning',
        'Weekly video check-ins',
        'Form review via video',
        'WhatsApp support'
      ]
    }
  ],
  testimonials: [
    {
      id: 'demo-test-1',
      client_name: 'Sarah Mitchell',
      rating: 5,
      text: 'Alex completely transformed my relationship with fitness. Lost 15kg in 4 months and gained so much confidence. The nutrition advice was game-changing!',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-test-2',
      client_name: 'James Chen',
      rating: 5,
      text: 'Best investment I\'ve made in myself. Alex\'s approach is practical and sustainable. Down 2 suit sizes and feeling stronger than ever.',
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-test-3',
      client_name: 'Emma Thompson',
      rating: 5,
      text: 'As a busy mum of two, I thought I\'d never have time for fitness. Alex created a plan that fits my life perfectly. Highly recommend!',
      created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

export function DemoProfilePreview() {
  const [trainerData, setTrainerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a brief loading state for better UX
    const timer = setTimeout(() => {
      setTrainerData(DEMO_TRAINER_DATA);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Profile Preview</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!trainerData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Profile Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Unable to load demo profile
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Profile Preview</span>
          <span className="text-sm font-normal text-muted-foreground">
            How clients see you
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center p-3 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm font-medium text-primary">
            ✨ This is how your profile will appear to clients on NAC
          </p>
        </div>
        <TrainerProfilePreview formData={trainerData} />
      </CardContent>
    </Card>
  );
}
