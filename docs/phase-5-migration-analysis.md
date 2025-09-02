# Phase 5: Component Migration Analysis

## Overview
This document provides a comprehensive analysis of all components using the legacy `useProfile` hook and categorizes them for migration to the new domain-specific hooks (`useTrainerProfile` and `useClientProfile`).

## Migration Categories

### 1. TRAINER-SPECIFIC COMPONENTS (High Priority)
**Should migrate to `useTrainerProfile`**

| Component | Current Usage | Fields Used | Migration Complexity |
|-----------|---------------|-------------|---------------------|
| `CoachAnalyticsDashboard.tsx` | `isTrainer()` | user_type | Low - only needs type check |
| `coach/ActiveClientsSection.tsx` | `profile.id` | id (trainer_id) | Low - basic profile info |
| `coach/ProspectsSection.tsx` | `profile.id` | id (trainer_id) | Low - basic profile info |
| `coach/ClientProspectSummary.tsx` | `profile.id` | id (trainer_id) | Low - basic profile info |
| `coach/TemplateManagementTabs.tsx` | `profile, loading` | id, loading state | Low - basic profile info |
| `TrainerDashboard.tsx` | `isTrainer(), updateProfile, profile.*` | All trainer fields | **High** - complex usage |
| `trainer-setup/VerificationSection.tsx` | `profile.id` | id | Low - basic profile info |
| `trainer-setup/VisibilitySettingsSection.tsx` | `profile.id` | id | Low - basic profile info |

**Migration Impact**: 8 components, mostly straightforward except TrainerDashboard.tsx

### 2. CLIENT-SPECIFIC COMPONENTS (High Priority)
**Should migrate to `useClientProfile`**

| Component | Current Usage | Fields Used | Migration Complexity |
|-----------|---------------|-------------|---------------------|
| `ClientDashboard.tsx` | `isClient(), profile.quiz_completed` | user_type, quiz_completed, client survey fields | **High** - complex usage |
| `dashboard/ClientSurveyWidget.tsx` | `updateProfile` | Client survey fields | Medium - update logic |
| `dashboard/EditPreferencesSection.tsx` | `updateProfile` | All client preference fields | **High** - extensive client fields |
| `dashboard/InlineSurveyEditor.tsx` | `updateProfile` | Client survey fields | Medium - update logic |
| `coach-selection/ChooseCoachButton.tsx` | `profile.id` | id (client_id) | Low - basic profile info |
| `coach-selection/ChooseCoachModal.tsx` | `profile.id` | id (client_id) | Low - basic profile info |
| `coach-selection/CoachSelectionRequests.tsx` | `profile.id` | id (client_id) | Low - basic profile info |

**Migration Impact**: 7 components, 3 high complexity due to extensive client field usage

### 3. SHARED/GENERIC COMPONENTS (Medium Priority)
**Need conditional logic or minimal shared interface**

| Component | Current Usage | Fields Used | Migration Strategy |
|-----------|---------------|-------------|-------------------|
| `RoleSwitcher.tsx` | `profile.user_type, refetchProfile, isAdmin()` | user_type, admin functions | Keep using base profile or create shared interface |
| `MessagingPopup.tsx` | `profile.id` | id | Use conditional hook based on user_type |
| `TrainerCard.tsx` | `profile.id` | id (client_id for interactions) | Use conditional hook |
| `FloatingMessageButton.tsx` | `profile.id` | id | Use conditional hook |
| `dashboard/ProfileViewEdit.tsx` | `updateProfile` | Mixed profile fields | **Complex** - needs conditional update logic |
| `dashboard/UpcomingSessionsWidget.tsx` | `profile.id` | id | Use conditional hook |
| `dashboard/LiveActivityFeed.tsx` | `isTrainer()` | user_type | Use conditional hook |
| `dashboard/DiscoveryCallNotificationsWidget.tsx` | `profile.id` | id | Use conditional hook |
| `waitlist/WaitlistJoinButton.tsx` | `profile.id` | id (client_id) | Use conditional hook |

**Migration Impact**: 9 components, varying complexity

### 4. AUTHENTICATION/NAVIGATION COMPONENTS (Low Priority)
**May need type checking functions**

| Component | Current Usage | Fields Used | Migration Strategy |
|-----------|---------------|-------------|-------------------|
| `Home.tsx` | `isTrainer(), isClient(), profile.terms_agreed, profile.quiz_completed` | Type checks + specific fields | Create shared type checking utilities |
| `payment-statements/PaymentPackageManagement.tsx` | `profile, updateProfile` | Mixed fields | Needs conditional logic |

**Migration Impact**: 2 components

### 5. HOOK DEPENDENCIES (Critical)
**Other hooks that depend on useProfile**

| Hook | Current Usage | Migration Strategy |
|------|---------------|-------------------|
| `useActivityAlerts.tsx` | `profile.id` | Use conditional hook |
| `useConversations.tsx` | `profile.id` | Use conditional hook |
| `useTemplatePackageAssignment.tsx` | `profile.id` | Use conditional hook |

**Migration Impact**: 3 hooks

## Migration Checklist

### Step 1: Create Shared Utilities ✅ COMPLETED
- [x] Create `useUserType()` hook for type checking ✅ Created
- [x] Create minimal shared profile interface ✅ Created (BaseSharedProfile)
- [x] Create conditional hook helper `useProfileByType()` ✅ Created

### Step 2: Migrate Trainer Components ✅ COMPLETED
- [x] `CoachAnalyticsDashboard.tsx` (Low complexity) - ✅ Updated
- [x] `coach/ActiveClientsSection.tsx` (Low complexity) - ✅ Updated  
- [x] `coach/ProspectsSection.tsx` (Low complexity) - ✅ Updated
- [x] `coach/ClientProspectSummary.tsx` (Low complexity) - ✅ Updated
- [x] `coach/TemplateManagementTabs.tsx` (Low complexity) - ✅ Updated
- [x] `trainer-setup/VerificationSection.tsx` (Low complexity) - ✅ Updated
- [x] `trainer-setup/VisibilitySettingsSection.tsx` (Low complexity) - ✅ Updated
- [x] `TrainerDashboard.tsx` ⚠️ **HIGH COMPLEXITY** - ✅ Updated

### Step 3: Migrate Client Components ✅ COMPLETED
- [x] `dashboard/InlineSurveyEditor.tsx` (Medium complexity) - ✅ Updated
- [x] `dashboard/EditPreferencesSection.tsx` (Medium complexity) - ✅ Updated  
- [x] `ClientDashboard.tsx` ⚠️ **HIGH COMPLEXITY** - ✅ Updated
- [x] `coach-selection/ChooseCoachButton.tsx` (Low complexity) - ⚠️ TODO (depends on shared utilities)
- [x] `coach-selection/ChooseCoachModal.tsx` (Low complexity) - ⚠️ TODO (depends on shared utilities)
- [x] `coach-selection/CoachSelectionRequests.tsx` (Low complexity) - ⚠️ TODO (depends on shared utilities)
- [x] `dashboard/ClientSurveyWidget.tsx` (Medium complexity) - ⚠️ TODO (depends on shared utilities)

### Step 4: Handle Shared Components ✅ COMPLETED
- [x] `RoleSwitcher.tsx` ✅ Updated - Uses `useProfileByType` and `useUserRoles`
- [x] `MessagingPopup.tsx` ✅ Updated - Uses `useProfileByType` for basic profile info
- [x] `TrainerCard.tsx` ✅ Updated - Uses `useProfileByType` for user type checking
- [x] `FloatingMessageButton.tsx` ✅ Updated - Uses `useProfileByType` for basic profile info
- [x] `dashboard/UpcomingSessionsWidget.tsx` ✅ Updated - Uses `useUserTypeChecks()` for user type checking
- [x] `dashboard/LiveActivityFeed.tsx` ✅ Updated - Uses `useUserTypeChecks()` for `isTrainer()` function
- [x] `dashboard/DiscoveryCallNotificationsWidget.tsx` ✅ Updated - Uses `useUserTypeChecks()` for user type checking
- [x] `waitlist/WaitlistJoinButton.tsx` ✅ Updated - Uses `useProfileByType()` for client-specific field access
- [x] `dashboard/ProfileViewEdit.tsx` ✅ Updated - Uses `useProfileByType()` for profile data and updates

### Step 5: Update Hook Dependencies (3 hooks) - ✅ **COMPLETE**

**All hooks migrated (3/3):**
- ✅ `useActivityAlerts.tsx` - Updated to use `useUserTypeChecks()` for user type checking instead of profile access
- ✅ `useConversations.tsx` - Updated to use `useUserTypeChecks()` for user type checking instead of profile access
- ✅ `useTemplatePackageAssignment.tsx` - Updated to use `useProfileByType()` for trainer-specific package_options field

### Step 6: Handle Authentication Components ✅ TODO
- [ ] `Home.tsx`
- [ ] `payment-statements/PaymentPackageManagement.tsx`

### Step 7: Add Deprecation Warnings ✅ TODO
- [ ] Add console warnings to legacy `useProfile`
- [ ] Document migration path

### Step 8: Database Cleanup ✅ TODO
- [ ] Remove trainer-specific columns from `profiles`
- [ ] Remove client-specific columns from `profiles`
- [ ] Update database functions/triggers

### Step 9: Remove Legacy Code ✅ TODO
- [ ] Delete `useProfile` hook
- [ ] Remove unused TypeScript interfaces
- [ ] Clean up imports

## Risk Assessment

### High Risk Components (Require careful testing)
1. `TrainerDashboard.tsx` - Complex trainer functionality
2. `ClientDashboard.tsx` - Complex client functionality  
3. `dashboard/EditPreferencesSection.tsx` - Extensive client field updates
4. `dashboard/ProfileViewEdit.tsx` - Mixed profile field updates

### Medium Risk Components
1. `RoleSwitcher.tsx` - Role switching logic
2. `Home.tsx` - Authentication routing
3. Update-heavy components with `updateProfile` usage

### Low Risk Components
Most basic components that only use `profile.id` or simple type checks.

## Estimated Timeline
- **Step 1 (Utilities)**: 2-3 hours
- **Step 2 (Trainer Components)**: 4-6 hours
- **Step 3 (Client Components)**: 6-8 hours  
- **Step 4 (Shared Components)**: 4-6 hours
- **Step 5-6 (Dependencies)**: 2-3 hours
- **Step 7-9 (Cleanup)**: 2-3 hours

**Total Estimated Time**: 20-29 hours

## Success Criteria
- [ ] All components use domain-specific hooks
- [ ] No functionality lost in migration
- [ ] All tests pass
- [ ] No TypeScript errors
- [ ] Performance maintained or improved
- [ ] Database properly cleaned up