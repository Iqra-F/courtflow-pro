import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
export default function Auth() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const navigate = useNavigate();
useEffect(() => {
  let mounted = true;

  supabase.auth.getSession().then(({ data }) => {
    if (!mounted) return;
    const role = (data.session?.user?.app_metadata as any)?.role;
    if (role) navigate(role === "ADMIN" ? "/admin/users" : "/", { replace: true });
  });

  const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
    const role = (session?.user?.app_metadata as any)?.role;
    if (role) navigate(role === "ADMIN" ? "/admin/users" : "/", { replace: true });
  });

  return () => {
    mounted = false;
    sub.subscription.unsubscribe();
  };
}, [navigate]);

  // IMPORTANT: hooks first, then conditional rendering.
  useEffect(() => {
    if (!user) return;
    const role = (user as any)?.app_metadata?.role ?? "PUBLIC";
    navigate(role === "ADMIN" ? "/admin/users" : "/", { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-court-navy/5 to-court-blue/5 p-4">
      {loading ? (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                <Scale className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">CourtFlow Pro</CardTitle>
            <CardDescription> Court management system for legal professionals </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm />
              </TabsContent>
              <TabsContent value="register">
                <RegisterForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
