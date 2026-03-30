-- Add INSERT policy for certificates so users can create their own certificates
CREATE POLICY "Users can create their own certificates" 
ON public.certificates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);