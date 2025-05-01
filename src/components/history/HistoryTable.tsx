
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { PrintJob } from "@/lib/db";

interface HistoryTableProps {
  data: PrintJob[];
  onRowClick: (job: PrintJob) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ data, onRowClick }) => {
  // Column definitions for the data table
  const columns = [
    {
      header: "Receipt #",
      accessorKey: "serialNumber" as keyof PrintJob,
      searchable: true,
      sortable: true,
    },
    {
      header: "Date",
      accessorKey: "timestamp" as keyof PrintJob,
      cell: (job: PrintJob) => new Date(job.timestamp).toLocaleDateString(),
      searchable: true,
      sortable: true,
    },
    {
      header: "Class",
      accessorKey: "className" as keyof PrintJob,
      searchable: true,
      sortable: true,
    },
    {
      header: "Teacher",
      accessorKey: "teacherName" as keyof PrintJob,
      searchable: true,
      sortable: true,
      cell: (job: PrintJob) => job.teacherName || "-",
    },
    {
      header: "Document",
      accessorKey: "documentType" as keyof PrintJob,
      searchable: true,
      sortable: true,
      cell: (job: PrintJob) => job.documentType || "-",
    },
    {
      header: "Type",
      accessorKey: "printType" as keyof PrintJob,
      searchable: true,
      sortable: true,
    },
    {
      header: "Pages",
      accessorKey: "pages" as keyof PrintJob,
      sortable: true,
    },
    {
      header: "Price",
      accessorKey: "totalPrice" as keyof PrintJob,
      cell: (job: PrintJob) => `$${job.totalPrice.toFixed(2)}`,
      sortable: true,
    },
    {
      header: "Status",
      accessorKey: "paid" as keyof PrintJob,
      cell: (job: PrintJob) => (
        <Badge variant={job.paid ? "default" : "secondary"}>
          {job.paid ? "Paid" : "Unpaid"}
        </Badge>
      ),
      sortable: true,
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      onRowClick={onRowClick}
    />
  );
};
