-- Fix missing RLS policies for tables that need them

-- Add RLS policies for case_participants
CREATE POLICY "Users can view case participants for their cases" ON public.case_participants
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM public.cases 
      WHERE created_by_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      ) OR
      assigned_judge_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      ) OR
      id IN (
        SELECT case_id FROM public.case_participants 
        WHERE user_id IN (
          SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
      )
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role IN ('ADMIN', 'CLERK', 'JUDGE')
    )
  );

CREATE POLICY "Admins and clerks can manage case participants" ON public.case_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role IN ('ADMIN', 'CLERK')
    )
  );

-- Add RLS policies for documents
CREATE POLICY "Users can view documents for their cases" ON public.documents
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM public.cases 
      WHERE created_by_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      ) OR
      assigned_judge_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      ) OR
      id IN (
        SELECT case_id FROM public.case_participants 
        WHERE user_id IN (
          SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
      )
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role IN ('ADMIN', 'CLERK', 'JUDGE')
    ) OR
    (visibility = 'PUBLIC')
  );

CREATE POLICY "Non-admin users can upload documents" ON public.documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('ATTORNEY', 'PUBLIC', 'CLERK', 'JUDGE')
      AND id = uploaded_by_id
    )
  );

-- Add RLS policies for hearings
CREATE POLICY "Users can view hearings for their cases" ON public.hearings
  FOR SELECT USING (
    case_id IN (
      SELECT id FROM public.cases 
      WHERE created_by_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      ) OR
      assigned_judge_id IN (
        SELECT id FROM public.users WHERE auth_user_id = auth.uid()
      ) OR
      id IN (
        SELECT case_id FROM public.case_participants 
        WHERE user_id IN (
          SELECT id FROM public.users WHERE auth_user_id = auth.uid()
        )
      )
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role IN ('ADMIN', 'CLERK', 'JUDGE')
    )
  );

CREATE POLICY "Judges and clerks can manage hearings" ON public.hearings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role IN ('JUDGE', 'CLERK')
    )
  );

-- Add RLS policies for audit_logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Add RLS policies for system_settings
CREATE POLICY "Admins can manage system settings" ON public.system_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Fix function search paths for security
DROP FUNCTION IF EXISTS generate_case_number();
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  case_num TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(case_number FROM '^\d{4}-(\d+)') AS INTEGER
    )
  ), 0) + 1
  INTO sequence_num
  FROM public.cases
  WHERE case_number LIKE year_part || '-%';
  
  case_num := year_part || '-' || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN case_num;
END;
$$;

DROP FUNCTION IF EXISTS set_case_number();
CREATE OR REPLACE FUNCTION set_case_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
    NEW.case_number := generate_case_number();
  END IF;
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS update_updated_at_column();
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;