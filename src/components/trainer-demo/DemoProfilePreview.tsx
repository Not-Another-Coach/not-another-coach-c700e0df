import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedTrainerCard } from '@/components/trainer-cards/EnhancedTrainerCard';
import { Loader2 } from 'lucide-react';
import type { AnyTrainer } from '@/types/trainer';
import demoBeforeFemale from '@/assets/demo-before-female.png';
import demoAfterFemale from '@/assets/demo-after-female.png';
import demoBeforeMale from '@/assets/demo-before-male.png';
import demoAfterMale from '@/assets/demo-after-male.png';
import demoBeforeMaleSkinny from '@/assets/demo-before-male-skinny.jpg';
import demoAfterMaleMuscular from '@/assets/demo-after-male-muscular.jpg';
import demoBeforeMaleDad from '@/assets/demo-before-male-dad.jpg';
import demoAfterMaleAthletic from '@/assets/demo-after-male-athletic.jpg';

// Hardcoded demo trainer profile for consistent demo experience
const DEMO_TRAINER_DATA = {
  id: 'demo-trainer-alex-johnson',
  name: 'Alex Johnson',
  firstName: 'Alex',
  lastName: 'Johnson',
  profilePhotoUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop',
  profileImagePosition: { x: 50, y: 50, scale: 1 },
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
      clientName: 'Sarah M.',
      rating: 5,
      text: 'Alex completely transformed my relationship with fitness. Lost 15kg in 4 months and gained so much confidence. The nutrition advice was game-changing!',
      clientQuote: 'The structured approach and constant support made all the difference. I finally found a sustainable way to reach my goals.',
      achievement: 'Lost 15kg & gained confidence',
      outcomeTag: '12 Week Transformation',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      showImages: true,
      consentGiven: true,
      beforeImage: demoBeforeFemale,
      afterImage: demoAfterFemale
    },
    {
      id: 'demo-test-2',
      client_name: 'James Chen',
      clientName: 'James T.',
      rating: 5,
      text: 'Best investment I\'ve made in myself. Alex\'s approach is practical and sustainable. Down 2 suit sizes and feeling stronger than ever.',
      clientQuote: 'The personalized programming and nutrition guidance helped me break through plateaus I\'d been stuck at for years.',
      achievement: 'Built muscle & strength',
      outcomeTag: '16 Week Transformation',
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      showImages: true,
      consentGiven: true,
      beforeImage: demoBeforeMale,
      afterImage: demoAfterMale
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

// Male-focused demo trainer profile for muscle building
const DEMO_TRAINER_DATA_MALE = {
  id: 'demo-trainer-marcus-steel',
  name: 'Marcus Steel',
  firstName: 'Marcus',
  lastName: 'Steel',
  profilePhotoUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&h=400&fit=crop',
  profileImagePosition: { x: 50, y: 50, scale: 1 },
  tagline: 'Build Muscle, Build Confidence',
  bio: `Specialized in helping skinny guys pack on serious muscle mass. With 10 years of competitive bodybuilding experience and professional coaching, I've transformed hundreds of hardgainers into confident, muscular athletes.

I focus on progressive overload training, optimized nutrition for muscle growth, and sustainable lifestyle changes that stick. Whether you're a complete beginner or stuck at a plateau, I'll help you break through and achieve the physique you've always wanted.

My approach combines science-based training protocols with practical nutrition strategies. Certified Personal Trainer (CPT), Sports Nutrition Specialist, and former natural bodybuilding competitor. I believe in building real, functional strength - not just for the mirror, but for life.`,
  location: 'Manchester, UK',
  experience: '10+ years',
  hourlyRate: 70,
  rating: 4.8,
  totalRatings: 156,
  isVerified: true,
  status: 'accepting',
  instagram_handle: '@marcussteel_coach',
  instagram_connected: true,
  instagram_posts: [
    {
      id: 'demo-ig-male-1',
      media_url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=600&fit=crop',
      media_type: 'IMAGE',
      caption: '💪 Transformation Tuesday! Tom went from 65kg to 80kg in 6 months. Progressive overload and consistent surplus = gains! 🔥\n\n#musclebuilding #bulking #transformation',
      permalink: 'https://instagram.com/p/demo-male1',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-ig-male-2',
      media_url: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=600&fit=crop',
      media_type: 'IMAGE',
      caption: '🏋️ Progressive overload is the key! Here\'s how to add weight safely and effectively. Swipe for my weekly progression guide.\n\n#strengthtraining #progressive #gainz',
      permalink: 'https://instagram.com/p/demo-male2',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-ig-male-3',
      media_url: 'https://images.unsplash.com/photo-1623874514711-0f321325f318?w=600&h=600&fit=crop',
      media_type: 'IMAGE',
      caption: '🥩 High protein meal prep for muscle growth. Aiming for 2g per kg bodyweight? Here\'s how I structure my meals.\n\n#mealprep #bulking #proteinmeals',
      permalink: 'https://instagram.com/p/demo-male3',
      timestamp: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-ig-male-4',
      media_url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&h=600&fit=crop',
      media_type: 'IMAGE',
      caption: '🔥 Compound movements = maximum gains. Squat, bench, deadlift, overhead press. Master these four.\n\n#compoundlifts #strengthtraining #bigthree',
      permalink: 'https://instagram.com/p/demo-male4',
      timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-ig-male-5',
      media_url: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=600&fit=crop',
      media_type: 'IMAGE',
      caption: '💯 Mindset Monday: Your body won\'t go where your mind doesn\'t push it. Stay consistent, stay hungry.\n\n#mindset #motivation #nevergiveup',
      permalink: 'https://instagram.com/p/demo-male5',
      timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-ig-male-6',
      media_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
      media_type: 'IMAGE',
      caption: '🎯 Taking on new clients! Limited spots for online and in-person muscle building programs. DM for info!\n\n#personaltrainer #manchesterpt #musclebuilding',
      permalink: 'https://instagram.com/p/demo-male6',
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  specializations: [
    'Muscle Building',
    'Strength Training',
    'Body Recomposition',
    'Nutrition for Gains',
    'Progressive Overload'
  ],
  trainingTypes: ['In-Person', 'Online', 'Hybrid'],
  packageOptions: [
    {
      id: 'demo-pkg-male-1',
      name: 'Muscle Kickstart',
      description: '4 weeks of intensive muscle building training',
      price: 449,
      currency: 'GBP',
      duration: '4 weeks',
      sessions: 8,
      features: [
        '8 strength training sessions',
        'Custom bulking nutrition plan',
        'Weekly progress photos & measurements',
        'Exercise library access'
      ]
    },
    {
      id: 'demo-pkg-male-2',
      name: 'Mass Builder Program',
      description: '12 weeks of comprehensive muscle building coaching',
      price: 1099,
      currency: 'GBP',
      duration: '12 weeks',
      sessions: 24,
      features: [
        '24 personal training sessions',
        'Personalized meal plans for gains',
        'Bi-weekly body composition analysis',
        'Unlimited messaging support',
        'Custom progressive overload programming'
      ],
      isPromotional: true,
      promotionPrice: 999,
      promotionStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      promotionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'demo-pkg-male-3',
      name: 'Online Muscle Coaching',
      description: 'Flexible online-only training for remote muscle building',
      price: 299,
      currency: 'GBP',
      duration: '4 weeks',
      sessions: 0,
      features: [
        'Custom muscle building program',
        'Bulking nutrition guidance',
        'Weekly video check-ins',
        'Form review via video',
        'WhatsApp support'
      ]
    }
  ],
  testimonials: [
    {
      id: 'demo-test-male-1',
      client_name: 'Tom Richardson',
      clientName: 'Tom R.',
      rating: 5,
      text: 'Marcus helped me go from skinny to strong. Gained 15kg of lean muscle in 6 months. His programming and nutrition advice are spot on!',
      clientQuote: 'I was a hardgainer my whole life. Marcus showed me exactly how to eat and train to actually build muscle. Game changer.',
      achievement: 'Gained 15kg lean muscle',
      outcomeTag: '6 Month Bulk',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      showImages: true,
      consentGiven: true,
      beforeImage: demoBeforeMaleSkinny,
      afterImage: demoAfterMaleMuscular
    },
    {
      id: 'demo-test-male-2',
      client_name: 'David Khan',
      clientName: 'David K.',
      rating: 5,
      text: 'At 45, I thought I was past my prime. Marcus proved me wrong. Lost the dad bod, gained muscle and confidence. Feel 10 years younger.',
      clientQuote: 'The structured approach to recomposition was exactly what I needed. Lost fat while building muscle simultaneously.',
      achievement: 'Lost 12kg fat, gained 8kg muscle',
      outcomeTag: '12 Week Recomp',
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      showImages: true,
      consentGiven: true,
      beforeImage: demoBeforeMaleDad,
      afterImage: demoAfterMaleAthletic
    },
    {
      id: 'demo-test-male-3',
      client_name: 'James Morrison',
      rating: 5,
      text: 'Best investment in myself. Marcus\'s no-BS approach to muscle building got me results I\'d been chasing for years. Highly recommend!',
      created_at: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

export function DemoProfilePreview() {
  const [selectedProfile, setSelectedProfile] = useState<'female' | 'male'>('female');
  const [trainerData, setTrainerData] = useState<AnyTrainer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a brief loading state for better UX
    setLoading(true);
    const timer = setTimeout(() => {
      const currentDemoData = selectedProfile === 'female' ? DEMO_TRAINER_DATA : DEMO_TRAINER_DATA_MALE;
      setTrainerData(currentDemoData as AnyTrainer);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedProfile]);

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
        <div className="flex items-center justify-between">
          <CardTitle>Your Profile Preview</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant={selectedProfile === 'female' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedProfile('female')}
            >
              Female Focus
            </Button>
            <Button 
              variant={selectedProfile === 'male' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedProfile('male')}
            >
              Male Focus
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          How clients see you
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-w-md mx-auto">
          <EnhancedTrainerCard
            trainer={trainerData}
            config="anonymous"
            initialView="transformations"
            showComparisonCheckbox={false}
            allowViewSwitching={true}
            onViewProfile={() => {}}
            onMessage={() => {}}
            onBookDiscoveryCall={() => {}}
          />
        </div>
      </CardContent>
    </Card>
  );
}
