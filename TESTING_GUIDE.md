# Testing Guide: "Choose this Coach" Feature

## 🧪 How to Test the Coach Selection System

### 1. **Setup Test Environment**

#### Option A: Use Bulk Upload (Recommended)
```bash
# Call the bulk-create-users edge function with test data
POST /functions/v1/bulk-create-users
```

#### Option B: Manual Creation
- Create 3-5 trainer accounts via signup
- Create 3-5 client accounts via signup
- Complete surveys for all accounts

### 2. **Testing Flow - Route 1 (Chat → Choose → Package)**
1. **As Client:**
   - Complete client survey
   - Browse trainers in dashboard
   - Like a trainer (moves to "liked" stage)
   - Click "Choose This Coach" button
   - Select package from modal
   - Submit request with optional message

2. **As Trainer:**
   - Go to trainer dashboard
   - Check "Prospects" tab for pending requests
   - Click on request to view details
   - Respond with Accept/Decline/Suggest Alternative

3. **Back as Client:**
   - Check status updates
   - If accepted: "Proceed to Payment" button appears
   - If declined: Can send new request
   - If alternative suggested: Review suggestion

### 3. **Testing Flow - Route 2 (Discovery Call → Choose → Package)**
1. **As Client:**
   - Book discovery call with trainer
   - Mark call as completed (for testing)
   - Click "Choose This Coach" button
   - Complete package selection

2. **Continue with same trainer response flow**

---

## 📊 Client Survey Questions & Matching Criteria

### **Client Survey Structure (8 Steps)**

#### **Step 1: Goals**
- **Primary Goals:** (required, multiple selection)
  - `weight_loss` - Weight Loss & Fat Loss
  - `strength_training` - Strength & Muscle Building
  - `fitness_health` - General Fitness & Health
  - `energy_confidence` - Energy & Confidence
  - `injury_prevention` - Injury Prevention & Recovery
  - `specific_sport` - Sport-Specific Training
  - `muscle_gain` - Muscle Gain
  - `endurance` - Endurance & Cardio
  - `flexibility` - Flexibility & Mobility
  - `general_fitness` - General Fitness
  - `rehabilitation` - Rehabilitation

- **Secondary Goals:** (optional, multiple selection)

#### **Step 2: Training Location**
- **Location Preference:** (required, single selection)
  - `in-person` - In-Person Only
  - `online` - Online Only  
  - `hybrid` - Both In-Person & Online
- **Open to Virtual Coaching:** (boolean)

#### **Step 3: Scheduling**
- **Training Frequency:** (required, number)
  - 1-7 times per week
- **Preferred Time Slots:** (required, multiple selection)
  - `early_morning`, `morning`, `lunch`, `afternoon`, `evening`, `late_evening`
- **Start Timeline:** (required, single selection)
  - `urgent`, `next_month`, `flexible`

#### **Step 4: Coaching Style**
- **Preferred Coaching Style:** (required, multiple selection)
  - `nurturing` - Supportive & Encouraging
  - `tough_love` - Direct & Challenging
  - `high_energy` - Energetic & Motivating
  - `analytical` - Technical & Data-Driven
  - `social` - Fun & Interactive
  - `calm` - Calm & Mindful
- **Motivation Factors:** (optional, multiple selection)

#### **Step 5: About You**
- **Personality Type:** (required, multiple selection)
  - Various personality descriptors
- **Experience Level:** (required, single selection)
  - `beginner`, `intermediate`, `advanced`

#### **Step 6: Package Preferences**
- **Package Type:** (required, single selection)
  - `ongoing` - Long-term Ongoing
  - `short_term` - Short-term Program
  - `single_session` - Single Sessions

#### **Step 7: Budget**
- **Budget Range:** (required)
  - `budget_range_min` (number)
  - `budget_range_max` (number)
- **Budget Flexibility:** (required, single selection)
  - `strict`, `flexible`, `negotiable`

#### **Step 8: Availability**
- **Waitlist Preference:** (required, single selection)
  - `asap` - Start ASAP
  - `quality_over_speed` - Quality over Speed
- **Flexible Scheduling:** (boolean)

---

## 🎯 Matching Algorithm & Scoring

### **Weighted Scoring System (Total: 100%)**

#### **1. Goals Match (25% weight)**
```typescript
// Maps client goals to trainer specialties
const goalMapping = {
  'weight_loss': ['Weight Loss', 'Fat Loss', 'Body Composition', 'Nutrition'],
  'strength_training': ['Strength Training', 'Powerlifting', 'Muscle Building'],
  'fitness_health': ['General Fitness', 'Health & Wellness', 'Functional Training'],
  // ... etc
}

// Score = (matching_goals / total_client_goals) * 100
```

#### **2. Location & Format Match (20% weight)**
```typescript
// Matches client location preference with trainer delivery format
- hybrid clients: 100% (flexible)
- online preference: matches 'online', 'virtual' in trainer formats
- in-person preference: matches 'person', 'gym' in trainer formats
```

#### **3. Coaching Style Match (20% weight)**
```typescript
// Maps client style preferences to trainer attributes
const styleMapping = {
  'nurturing': ['supportive', 'patient', 'encouraging'],
  'tough_love': ['challenging', 'direct', 'accountability'],
  'high_energy': ['energetic', 'motivating', 'enthusiastic'],
  // ... etc
}
```

#### **4. Schedule & Frequency Match (15% weight)**
```typescript
// Basic availability matching
- Default: 85% (most trainers accommodate)
- Flexible clients: 100% bonus
```

#### **5. Budget Match (10% weight)**
```typescript
// Compares trainer hourly rate with client budget
- Within range: 100%
- Flexible budget: 20% tolerance
- Negotiable: 60% if outside range
```

#### **6. Experience & Client Fit (10% weight)**
```typescript
// Matches client experience level with trainer suitability
- beginner: highly rated trainers (4.7+ rating)
- intermediate: good trainers (4.5+ rating)  
- advanced: experienced trainers (5+ years, 4.5+ rating)
```

### **Compatibility Tiers**
- **Top Matches:** 70%+ compatibility
- **Good Matches:** 50-69% compatibility
- **Basic Matches:** <50% compatibility

---

## 📤 Bulk User Upload Format

### **JSON Format for bulk-create-users Function**

```json
{
  "users": [
    {
      "email": "client1@test.com",
      "password": "testpass123",
      "user_type": "client",
      "first_name": "Sarah",
      "last_name": "Johnson",
      "primary_goals": ["weight_loss", "fitness_health"],
      "secondary_goals": ["energy_confidence"],
      "training_location_preference": "hybrid",
      "open_to_virtual_coaching": true,
      "preferred_training_frequency": 3,
      "preferred_time_slots": ["morning", "evening"],
      "start_timeline": "flexible",
      "preferred_coaching_style": ["nurturing", "high_energy"],
      "motivation_factors": ["health", "confidence"],
      "client_personality_type": ["motivated", "consistent"],
      "experience_level": "beginner",
      "preferred_package_type": "ongoing",
      "budget_range_min": 50,
      "budget_range_max": 80,
      "budget_flexibility": "flexible",
      "waitlist_preference": "quality_over_speed",
      "flexible_scheduling": true
    },
    {
      "email": "trainer1@test.com", 
      "password": "testpass123",
      "user_type": "trainer",
      "first_name": "Mike",
      "last_name": "Davis",
      "bio": "Certified personal trainer specializing in weight loss and strength training.",
      "tagline": "Transform your body, transform your life",
      "location": "New York, NY",
      "training_types": ["Strength Training", "HIIT", "Cardio"],
      "specializations": ["Weight Loss", "Muscle Building", "General Fitness"],
      "qualifications": ["NASM-CPT", "Nutrition Specialist"],
      "ideal_client_types": ["Beginners", "Weight Loss Goals"],
      "coaching_styles": ["Supportive", "Motivating"],
      "hourly_rate": 65,
      "years_certified": 2020,
      "training_vibe": "Energetic and encouraging",
      "communication_style": "Direct but supportive",
      "max_clients": 20,
      "packages": [
        {
          "id": "basic",
          "name": "Basic Training", 
          "price": 200,
          "duration": "4 weeks",
          "description": "Perfect for beginners",
          "sessions": 8,
          "includes": ["Custom workout plan", "Nutrition guidance"]
        }
      ]
    }
  ]
}
```

### **Using the Bulk Upload**
```bash
# Call via HTTP client or curl
curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/bulk-create-users' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d @test-users.json
```

Now you have everything needed to test the coach selection system comprehensively! 🚀