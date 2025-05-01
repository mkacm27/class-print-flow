
import { useParams, Navigate } from "react-router-dom";
import ReceiptView from "@/components/print/ReceiptView";

const Receipt = () => {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <Navigate to="/history" />;
  }
  
  return <ReceiptView />;
};

export default Receipt;
