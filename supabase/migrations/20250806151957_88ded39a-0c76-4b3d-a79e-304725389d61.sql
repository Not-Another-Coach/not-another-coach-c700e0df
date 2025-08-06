-- Add DELETE policy for clients to remove their own waitlist entries
CREATE POLICY "Clients can delete their own waitlist entries"
ON public.coach_waitlists
FOR DELETE
USING (auth.uid() = client_id);