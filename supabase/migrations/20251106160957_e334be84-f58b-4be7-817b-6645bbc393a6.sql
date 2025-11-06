-- Change the time column from time type to text type to support Urdu time periods
ALTER TABLE public.attendance 
ALTER COLUMN time TYPE text;