
import React from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { PrintJob } from "@/lib/db";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHistoryCard } from "./MobileHistoryCard";

interface HistoryTableProps {
  data: PrintJob[];
  onRowClick: (job: PrintJob) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ data, onRowClick }) => {
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  
  // Mobile view - show cards instead of table
  if (isMobile) {
    return (
      <div className="space-y-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {data.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t("no_data_found")}</p>
          </div>
        ) : (
          data.map((job) => (
            <MobileHistoryCard 
              key={job.id} 
              job={job} 
              onClick={onRowClick}
            />
          ))
        )}
      </div>
    );
  }
  
  // Desktop view - show table
  const columns = [
    {
      header: t("receipt"),
      accessorKey: "serialNumber" as keyof PrintJob,
      searchable: true,
      sortable: true,
    },
    {
      header: t("date"),
      accessorKey: "timestamp" as keyof PrintJob,
      cell: (job: PrintJob) => new Date(job.timestamp).toLocaleDateString(),
      searchable: true,
      sortable: true,
    },
    {
      header: t("class"),
      accessorKey: "className" as keyof PrintJob,
      searchable: true,
      sortable: true,
    },
    {
      header: t("teacher"),
      accessorKey: "teacherName" as keyof PrintJob,
      searchable: true,
      sortable: true,
      cell: (job: PrintJob) => job.teacherName || "-",
    },
    {
      header: t("document"),
      accessorKey: "documentType" as keyof PrintJob,
      searchable: true,
      sortable: true,
      cell: (job: PrintJob) => job.documentType || "-",
    },
    {
      header: t("type"),
      accessorKey: "printType" as keyof PrintJob,
      searchable: true,
      sortable: true,
    },
    {
      header: t("pages"),
      accessorKey: "pages" as keyof PrintJob,
      sortable: true,
    },
    {
      header: t("price"),
      accessorKey: "totalPrice" as keyof PrintJob,
      cell: (job: PrintJob) => `${job.totalPrice.toFixed(2)} ${t("currency")}`,
      sortable: true,
    },
    {
      header: t("status"),
      accessorKey: "paid" as keyof PrintJob,
      cell: (job: PrintJob) => (
        <Badge variant={job.paid ? "default" : "secondary"} className={job.paid ? "success-badge" : "warning-badge"}>
          {job.paid ? t("paid") : t("unpaid")}
        </Badge>
      ),
      sortable: true,
    },
  ];

  return (
    <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <DataTable
        data={data}
        columns={columns}
        onRowClick={onRowClick}
      />
    </div>
  );
};
