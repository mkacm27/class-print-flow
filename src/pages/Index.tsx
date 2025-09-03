
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

const DASHBOARD_PIN = "1234"; // This could be stored in settings later

const Index = () => {
  const [pin, setPin] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin === DASHBOARD_PIN) {
      sessionStorage.setItem("dashboard_access", "true");
      setAccessGranted(true);
      toast({
        title: t("access_granted"),
        description: t("welcome_to_dashboard"),
      });
    } else {
      toast({
        title: t("access_denied"),
        description: t("incorrect_pin"),
        variant: "destructive",
      });
      setPin("");
    }
  };

  if (accessGranted) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("dashboard_access")}</CardTitle>
          <CardDescription>{t("enter_pin")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder={t("enter_pin")}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="text-center text-xl tracking-widest"
                maxLength={4}
              />
            </div>
            <Button type="submit" className="w-full">{t("dashboard_access")}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
