
-- Create storage bucket for medical reports
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-reports', 'medical-reports', false);

-- RLS policies for storage
CREATE POLICY "Users can upload own reports" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own reports" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own reports" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'medical-reports' AND (storage.foldername(name))[1] = auth.uid()::text);
