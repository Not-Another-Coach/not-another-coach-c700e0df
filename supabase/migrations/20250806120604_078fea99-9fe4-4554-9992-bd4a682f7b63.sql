-- Find a user that has engagement data to test with
SELECT DISTINCT 
  cte.client_id,
  au.email,
  p.first_name,
  p.last_name,
  COUNT(cte.trainer_id) as engagement_count
FROM client_trainer_engagement cte
JOIN auth.users au ON au.id = cte.client_id
JOIN profiles p ON p.id = cte.client_id
GROUP BY cte.client_id, au.email, p.first_name, p.last_name
ORDER BY engagement_count DESC;