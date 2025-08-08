import { stageWaitlistPriorityAccessArticle } from './stageWaitlistPriorityArticle';

// Execute the staging - this will add the article to the knowledge base for review
export const executeStaging = async () => {
  try {
    const result = await stageWaitlistPriorityAccessArticle();
    console.log('Successfully staged waitlist priority access article:', result);
    return result;
  } catch (error) {
    console.error('Failed to stage article:', error);
    throw error;
  }
};

// Call immediately to stage the article
executeStaging();