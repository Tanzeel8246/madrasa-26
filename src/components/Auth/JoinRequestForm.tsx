import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePendingUserRoles } from '@/hooks/usePendingUserRoles';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const JoinRequestForm = () => {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'user'>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createPendingRole } = usePendingUserRoles();

  // Auto-fill user email if authenticated
  useEffect(() => {
    if (user?.email) {
      setFullName(user.user_metadata?.full_name || '');
      setContactEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('براہ کرم پہلے اکاؤنٹ بنائیں');
      return;
    }

    if (!fullName || !contactEmail || !contactNumber) {
      toast.error('تمام فیلڈز پُر کریں');
      return;
    }

    setIsSubmitting(true);

    try {
      await createPendingRole.mutateAsync({
        email: user.email!,
        role: selectedRole,
        full_name: fullName,
        contact_number: contactNumber,
        contact_email: contactEmail
      });

      toast.success('درخواست جمع کرا دی گئی! ایڈمن کی منظوری کا انتظار کریں');
      
      // Reset form
      setFullName('');
      setContactNumber('');
      setContactEmail(user.email || '');
      setSelectedRole('user');
    } catch (error: any) {
      toast.error(error.message || 'درخواست جمع کرانے میں خرابی');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="space-y-4 text-center p-6">
        <p className="text-muted-foreground">
          موجودہ مدرسہ میں شامل ہونے کے لیے پہلے اکاؤنٹ بنانا ضروری ہے
        </p>
        <p className="text-sm text-muted-foreground">
          براہ کرم اوپر "نیا مدرسہ" ٹیب سے اکاؤنٹ بنائیں
        </p>
      </div>
    );
  }

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
          value={user.email || ''}
          disabled
          dir="ltr"
          className="bg-muted"
        />
        <p className="text-xs text-muted-foreground">
          آپ کا اکاؤنٹ ای میل استعمال ہو گی
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">رابطہ ای میل</Label>
        <Input
          id="contact-email"
          type="email"
          placeholder="contact@example.com"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          required
          dir="ltr"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-number">موبائل نمبر</Label>
        <Input
          id="contact-number"
          type="tel"
          placeholder="+92 300 1234567"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          required
          dir="ltr"
        />
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
        disabled={isSubmitting}
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