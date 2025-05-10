
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { PrintJob } from "@/lib/db";
import { useLanguage } from "@/contexts/LanguageContext";

interface HistoryTableProps {
  data: PrintJob[];
  onRowClick: (job: PrintJob) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ data, onRowClick }) => {
  const { t, language } = useLanguage();
  
  // Column definitions for the data table
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
        <Badge variant={job.paid ? "default" : "secondary"}>
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
