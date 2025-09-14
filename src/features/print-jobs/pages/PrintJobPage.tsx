import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintJobForm } from "../components/PrintJobForm";

const PrintJobPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center shadow-lg">
          <Printer className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">New Print Job</h1>
          <p className="text-muted-foreground">Create a new print job and generate a receipt</p>
        </div>
      </div>

      <PrintJobForm />
    </div>
  );
};

export default PrintJobPage;