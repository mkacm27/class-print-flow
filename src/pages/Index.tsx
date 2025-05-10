
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DASHBOARD_PIN = "1234"; // This could be stored in settings later

const Index = () => {
  const [pin, setPin] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (pin === DASHBOARD_PIN) {
      setAccessGranted(true);
      toast({
        title: "Access Granted",
        description: "Welcome to the dashboard",
      });
    } else {
      toast({
        title: "Access Denied",
        description: "Incorrect PIN code",
        variant: "destructive",
      });
      setPin("");
    }
  };

  if (accessGranted) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Dashboard Access</CardTitle>
          <CardDescription>Enter PIN to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="text-center text-xl tracking-widest"
                maxLength={4}
              />
            </div>
            <Button type="submit" className="w-full">Access Dashboard</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
