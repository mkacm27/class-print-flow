
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { login } from "@/lib/auth";

const Index = () => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("1234");
  const [accessGranted, setAccessGranted] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login(username, password)) {
      setAccessGranted(true);
      toast({
        title: t("access_granted"),
        description: t("welcome_to_dashboard"),
      });
    } else {
      toast({
        title: t("access_denied"),
        description: t("incorrect_credentials"),
        variant: "destructive",
      });
      setPassword("1234");
    }
  };

  if (accessGranted) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("welcome_back")}</CardTitle>
          <CardDescription>{t("enter_credentials")}</CardDescription>
          <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-2">{t("default_credentials")}:</p>
            <p className="text-muted-foreground">{t("username_admin")}</p>
            <p className="text-muted-foreground">{t("password_1234")}</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder="1234"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">{t("login")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
