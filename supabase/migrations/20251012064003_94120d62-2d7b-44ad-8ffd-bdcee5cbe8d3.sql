-- Revert Trainer 5 Ways of Working to match existing package id
UPDATE package_ways_of_working 
SET 
  package_id = '1757643596345',
  package_name = '10 Week Transformation Package',
  updated_at = now()
WHERE 
  trainer_id = '5193e290-0570-4d77-b46a-e0e21ea0aac3' 
  AND package_id = '1757055749378';