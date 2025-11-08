import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [madrasaName, setMadrasaName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: 'خوش آمدید!',
          description: 'لاگ ان کامیاب رہا',
        });
        navigate('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              madrasa_name: madrasaName,
            },
          },
        });

        if (error) throw error;

        toast({
          title: 'اکاؤنٹ بنایا گیا!',
          description: 'آپ کا اکاؤنٹ کامیابی سے بن گیا ہے',
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'خرابی',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? 'لاگ ان' : 'رجسٹر'}</CardTitle>
          <CardDescription>
            {isLogin ? 'اپنے اکاؤنٹ میں لاگ ان کریں' : 'نیا اکاؤنٹ بنائیں'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">مکمل نام</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="madrasaName">مدرسہ کا نام</Label>
                  <Input
                    id="madrasaName"
                    type="text"
                    value={madrasaName}
                    onChange={(e) => setMadrasaName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">ای میل</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">پاس ورڈ</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'براہ کرم انتظار کریں...' : isLogin ? 'لاگ ان' : 'رجسٹر'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              type="button"
            >
              {isLogin ? 'نیا اکاؤنٹ بنائیں' : 'پہلے سے اکاؤنٹ ہے؟ لاگ ان کریں'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
