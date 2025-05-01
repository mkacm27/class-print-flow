
import PrintForm from "@/components/print/PrintForm";

const PrintJobPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">New Print Job</h1>
        <p className="text-gray-500">Create a new print job and generate a receipt</p>
      </div>
      
      <PrintForm />
    </div>
  );
};

export default PrintJobPage;
