-- Create trigger to automatically create alerts when a coach selection request is made
CREATE TRIGGER trigger_coach_selection_alert
  AFTER INSERT ON public.coach_selection_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.create_coach_selection_alert();