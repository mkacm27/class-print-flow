
import { Button } from "@/components/ui/button";
import { FileText, Files, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PrintJob } from "@/lib/db";

interface ExportButtonsProps {
  onExportPDF: () => void;
  onExportCSV: () => void;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({
  onExportPDF,
  onExportCSV,
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        className="gap-2"
        onClick={onExportCSV}
      >
        <Files className="w-4 h-4" />
        Export CSV
      </Button>
      <Button
        variant="outline"
        className="gap-2"
        onClick={onExportPDF}
      >
        <FileText className="w-4 h-4" />
        Export PDF
      </Button>
      <Button 
        className="gap-2"
        onClick={() => navigate("/print")}
      >
        <Plus className="w-4 h-4" />
        New Print Job
      </Button>
    </div>
  );
};
