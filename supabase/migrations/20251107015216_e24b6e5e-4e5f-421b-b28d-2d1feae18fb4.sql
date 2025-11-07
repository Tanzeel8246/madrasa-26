-- Create income table
CREATE TABLE public.income (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  donor_name TEXT NOT NULL,
  donor_contact TEXT,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  income_type TEXT NOT NULL,
  frequency TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_number TEXT,
  notes TEXT,
  madrasa_name TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;

-- Create policies for income
CREATE POLICY "Authenticated users can view income in their madrasa"
ON public.income
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND
  madrasa_name = (SELECT madrasa_name FROM public.profiles WHERE id = auth.uid())
);

CREATE POLICY "Admins and teachers can manage income in their madrasa"
ON public.income
FOR ALL
USING (
  madrasa_name = (SELECT madrasa_name FROM public.profiles WHERE id = auth.uid()) AND
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role))
);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_income_updated_at
BEFORE UPDATE ON public.income
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to set madrasa_name automatically
CREATE TRIGGER set_income_madrasa_name
BEFORE INSERT ON public.income
FOR EACH ROW
EXECUTE FUNCTION public.set_madrasa_name();

-- Create index for better performance
CREATE INDEX idx_income_madrasa_date ON public.income(madrasa_name, date DESC);
CREATE INDEX idx_income_type ON public.income(income_type);
CREATE INDEX idx_income_donor ON public.income(donor_name);