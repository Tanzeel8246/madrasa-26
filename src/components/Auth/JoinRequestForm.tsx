import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePendingUserRoles } from '@/hooks/usePendingUserRoles';
import { supabase } from '@/integrations/supabase/untypedClient';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const JoinRequestForm = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedMadrasa, setSelectedMadrasa] = useState('');
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'user'>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createPendingRole } = usePendingUserRoles();

  // Fetch all unique madrasa names
  const { data: madrasas } = useQuery({
    queryKey: ['madrasas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('madrasa_name')
        .not('madrasa_name', 'is', null);
      
      if (error) throw error;
      
      // Get unique madrasa names
      const uniqueMadrasas = [...new Set(data.map(p => p.madrasa_name))];
      return uniqueMadrasas.filter(Boolean) as string[];
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !fullName || !selectedMadrasa) {
      toast.error('تمام فیلڈز پُر کریں');
      return;
    }

    setIsSubmitting(true);

    try {
      await createPendingRole.mutateAsync({
        email,
        role: selectedRole,
        full_name: fullName,
        madrasa_name: selectedMadrasa
      });

      toast.success('درخواست جمع کرا دی گئی! ایڈمن کی منظوری کا انتظار کریں');
      
      // Reset form
      setEmail('');
      setFullName('');
      setSelectedMadrasa('');
      setSelectedRole('user');
    } catch (error: any) {
      toast.error(error.message || 'درخواست جمع کرانے میں خرابی');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="join-fullName">مکمل نام</Label>
        <Input
          id="join-fullName"
          type="text"
          placeholder="آپ کا نام"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="join-email">ای میل</Label>
        <Input
          id="join-email"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="madrasa-select">مدرسہ منتخب کریں</Label>
        <Select value={selectedMadrasa} onValueChange={setSelectedMadrasa} required>
          <SelectTrigger id="madrasa-select">
            <SelectValue placeholder="مدرسہ منتخب کریں" />
          </SelectTrigger>
          <SelectContent>
            {madrasas && madrasas.length > 0 ? (
              madrasas.map((madrasa) => (
                <SelectItem key={madrasa} value={madrasa}>
                  {madrasa}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="" disabled>
                کوئی مدرسہ دستیاب نہیں
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role-select">رول منتخب کریں</Label>
        <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as 'teacher' | 'user')} required>
          <SelectTrigger id="role-select">
            <SelectValue placeholder="رول منتخب کریں" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="teacher">استاد</SelectItem>
            <SelectItem value="user">صارف</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || !selectedMadrasa}
      >
        {isSubmitting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
        ) : (
          'درخواست بھیجیں'
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        آپ کی درخواست ایڈمن کو بھیج دی جائے گی۔ منظوری کے بعد آپ کو ای میل موصول ہو گی
      </p>
    </form>
  );
};

export default JoinRequestForm;
