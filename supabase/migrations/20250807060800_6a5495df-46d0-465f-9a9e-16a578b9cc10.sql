-- Update specific discovery calls to completed status for Lou Whitton
UPDATE discovery_calls 
SET status = 'completed'
WHERE id IN (
  '825ea036-8177-456c-8413-0f02e3e7a705',
  'c0fb3eed-6857-4161-80b2-9f9cd517c422'
);