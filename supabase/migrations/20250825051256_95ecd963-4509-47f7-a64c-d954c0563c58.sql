-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('ADMIN', 'JUDGE', 'ATTORNEY', 'CLERK', 'PUBLIC');

-- Create case status enum
CREATE TYPE public.case_status AS ENUM ('DRAFT', 'FILED', 'UNDER_REVIEW', 'ACTIVE', 'CLOSED', 'DISMISSED');

-- Create case type enum  
CREATE TYPE public.case_type AS ENUM ('CIVIL', 'CRIMINAL', 'FAMILY', 'SMALL_CLAIMS', 'PROBATE', 'TRAFFIC');

-- Create case priority enum
CREATE TYPE public.case_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- Create filing status enum
CREATE TYPE public.filing_status AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED');

-- Create participant role enum
CREATE TYPE public.participant_role AS ENUM ('PLAINTIFF', 'DEFENDANT', 'ATTORNEY', 'JUDGE', 'CLERK', 'OBSERVER');

-- Create document visibility enum
CREATE TYPE public.document_visibility AS ENUM ('PARTIES_ONLY', 'COURT_ONLY', 'PUBLIC');

-- Create hearing status enum
CREATE TYPE public.hearing_status AS ENUM ('SCHEDULED', 'RESCHEDULED', 'CANCELLED', 'HELD');

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'PUBLIC',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cases table
CREATE TABLE public.cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  type case_type NOT NULL,
  status case_status NOT NULL DEFAULT 'DRAFT',
  priority case_priority NOT NULL DEFAULT 'NORMAL',
  created_by_id UUID NOT NULL REFERENCES public.users(id),
  assigned_judge_id UUID REFERENCES public.users(id),
  filed_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case participants table
CREATE TABLE public.case_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  role_in_case participant_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create filings table
CREATE TABLE public.filings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  submitted_by_id UUID NOT NULL REFERENCES public.users(id),
  filing_type TEXT NOT NULL,
  description TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status filing_status NOT NULL DEFAULT 'SUBMITTED',
  reviewed_by_id UUID REFERENCES public.users(id),
  review_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  uploaded_by_id UUID NOT NULL REFERENCES public.users(id),
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  storage_key TEXT NOT NULL,
  visibility document_visibility NOT NULL DEFAULT 'PARTIES_ONLY',
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hearings table
CREATE TABLE public.hearings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  courtroom TEXT,
  status hearing_status NOT NULL DEFAULT 'SCHEDULED',
  created_by_id UUID NOT NULL REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  meta JSONB
);

-- Create system settings table
CREATE TABLE public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hearings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role = 'ADMIN'
    )
  );

CREATE POLICY "Admins can manage all users" ON public.users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Create RLS policies for cases
CREATE POLICY "Users can view cases they participate in" ON public.cases
  FOR SELECT USING (
    created_by_id IN (
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
    ) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role IN ('ADMIN', 'CLERK')
    )
  );

CREATE POLICY "Attorneys and public can create cases" ON public.cases
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('ATTORNEY', 'PUBLIC')
      AND id = created_by_id
    )
  );

CREATE POLICY "Admins and judges can update cases" ON public.cases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() AND role IN ('ADMIN', 'JUDGE', 'CLERK')
    ) OR
    assigned_judge_id IN (
      SELECT id FROM public.users WHERE auth_user_id = auth.uid()
    )
  );

-- Create RLS policies for filings
CREATE POLICY "Users can view filings for cases they participate in" ON public.filings
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

CREATE POLICY "Non-admin users can create filings" ON public.filings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('ATTORNEY', 'PUBLIC', 'CLERK', 'JUDGE')
      AND id = submitted_by_id
    )
  );

-- Create indexes for performance
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_cases_case_number ON public.cases(case_number);
CREATE INDEX idx_cases_status ON public.cases(status);
CREATE INDEX idx_cases_created_by ON public.cases(created_by_id);
CREATE INDEX idx_cases_assigned_judge ON public.cases(assigned_judge_id);
CREATE INDEX idx_case_participants_case_id ON public.case_participants(case_id);
CREATE INDEX idx_case_participants_user_id ON public.case_participants(user_id);
CREATE INDEX idx_filings_case_id ON public.filings(case_id);
CREATE INDEX idx_filings_status ON public.filings(status);
CREATE INDEX idx_documents_case_id ON public.documents(case_id);
CREATE INDEX idx_hearings_case_id ON public.hearings(case_id);
CREATE INDEX idx_hearings_start_at ON public.hearings(start_at);
CREATE INDEX idx_audit_logs_actor_id ON public.audit_logs(actor_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp);

-- Create function to generate case numbers
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-generate case numbers
CREATE OR REPLACE FUNCTION set_case_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.case_number IS NULL OR NEW.case_number = '' THEN
    NEW.case_number := generate_case_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-generating case numbers
CREATE TRIGGER trigger_set_case_number
  BEFORE INSERT ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION set_case_number();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON public.cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_filings_updated_at
  BEFORE UPDATE ON public.filings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hearings_updated_at
  BEFORE UPDATE ON public.hearings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();