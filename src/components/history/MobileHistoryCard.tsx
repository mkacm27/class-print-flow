import React from "react";
import { Badge } from "@/components/ui/badge";
import { PrintJob } from "@/lib/db";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, Calendar, User, FileText, Printer, DollarSign } from "lucide-react";

interface MobileHistoryCardProps {
  job: PrintJob;
  onClick: (job: PrintJob) => void;
}

export const MobileHistoryCard: React.FC<MobileHistoryCardProps> = ({ job, onClick }) => {
  const { t } = useLanguage();

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow duration-200 border-border/50"
      onClick={() => onClick(job)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">#{job.serialNumber}</span>
            </div>
            <Badge variant={job.paid ? "default" : "secondary"} className={job.paid ? "success-badge" : "warning-badge"}>
              {job.paid ? t("paid") : t("unpaid")}
            </Badge>
          </div>

          {/* Main Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{new Date(job.timestamp).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-foreground">{job.totalPrice.toFixed(2)} {t("currency")}</span>
            </div>
          </div>

          {/* Secondary Info */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{t("class")}: </span>
              <span className="text-foreground">{job.className}</span>
            </div>
            
            {job.teacherName && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t("teacher")}: </span>
                <span className="text-foreground">{job.teacherName}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{job.printType} • {job.pages} {t("pages")}</span>
            </div>

            {job.documentType && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t("document")}: </span>
                <span className="text-foreground">{job.documentType}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};