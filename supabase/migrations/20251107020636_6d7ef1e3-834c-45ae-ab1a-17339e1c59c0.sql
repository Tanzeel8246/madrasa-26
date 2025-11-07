-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  expense_type TEXT NOT NULL, -- salary, bills, construction, maintenance, food, etc.
  category TEXT, -- subcategory for expenses
  amount NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  recipient_name TEXT NOT NULL, -- who received the payment
  recipient_contact TEXT,
  description TEXT,
  receipt_number TEXT,
  payment_method TEXT, -- cash, bank_transfer, cheque
  madrasa_name TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create policies for expenses
CREATE POLICY "Authenticated users can view expenses in their madrasa"
  ON public.expenses
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND madrasa_name = (
      SELECT madrasa_name FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins and teachers can manage expenses in their madrasa"
  ON public.expenses
  FOR ALL
  USING (
    madrasa_name = (
      SELECT madrasa_name FROM public.profiles WHERE id = auth.uid()
    )
    AND (
      has_role(auth.uid(), 'admin'::app_role) 
      OR has_role(auth.uid(), 'teacher'::app_role)
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to set madrasa_name
CREATE TRIGGER set_expenses_madrasa_name
  BEFORE INSERT ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_madrasa_name();

-- Create indexes for better performance
CREATE INDEX idx_expenses_madrasa_name ON public.expenses(madrasa_name);
CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_expenses_expense_type ON public.expenses(expense_type);
CREATE INDEX idx_expenses_created_by ON public.expenses(created_by);