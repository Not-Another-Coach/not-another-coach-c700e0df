/**
 * Demo Trainer Configuration
 * 
 * Specifies which real trainer profiles should be displayed as demo profiles
 * on the homepage for non-authenticated users.
 */

export const DEMO_TRAINER_IDS = [
  '1051dd7c-ee79-48fd-b287-2cbe7483f9f7', // Trainer4 Surname4
  '5193e290-0570-4d77-b46a-e0e21ea0aac3'  // Trainer5 Surname5
];

/**
 * Check if a trainer ID is designated as a demo profile
 */
export const isDemoTrainerId = (id: string): boolean => {
  return DEMO_TRAINER_IDS.includes(id);
};
