import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import StatsCard from "@/components/dashboard/StatsCard";
import { 
  Printer, 
  Receipt, 
  AlertCircle, 
  Pencil,
  FileText,
  Check
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDashboardStats } from "../hooks/use-dashboard-stats";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const {
    todayJobs,
    totalPages,
    totalUnpaid,
    totalJobs,
    recentJobs,
    classesWithHighBalance,
    loading,
    error
  } = useDashboardStats();

  // Set the text direction based on language
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6" dir={dir}>
      <div>
        <h1 className="text-3xl font-bold mb-1">{t("dashboard")}</h1>
        <p className="text-gray-500">{t("view_and_manage")}</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t("todays_print_jobs")}
          value={todayJobs}
          icon={<Printer className="w-4 h-4 text-primary" />}
          onClick={() => navigate("/history")}
        />
        <StatsCard
          title={t("total_pages_printed")}
          value={totalPages.toLocaleString()}
          icon={<FileText className="w-4 h-4 text-primary" />}
          onClick={() => navigate("/statistics")}
        />
        <StatsCard
          title={t("unpaid_balance")}
          value={`${totalUnpaid.toFixed(2)} ${t("currency")}`}
          icon={<AlertCircle className="w-4 h-4 text-primary" />}
          onClick={() => navigate("/history?filter=unpaid")}
          trend={5}
        />
        <StatsCard
          title={t("total_print_jobs")}
          value={totalJobs}
          icon={<Receipt className="w-4 h-4 text-primary" />}
          onClick={() => navigate("/history")}
        />
      </div>
      
      {/* Two Column Layout for Tablets/Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t("recent_print_jobs")}</h2>
            {recentJobs.length > 0 ? (
              <div className="space-y-4">
                {recentJobs.map((job) => {
                  const date = new Date(job.timestamp);
                  return (
                    <div 
                      key={job.id} 
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/receipt/${job.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{job.className}</p>
                          <p className="text-sm text-gray-500">{job.serialNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{job.totalPrice.toFixed(2)} {t("currency")}</p>
                        <p className="text-xs text-gray-500">
                          {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div className="text-center pt-2">
                  <button
                    onClick={() => navigate("/history")}
                    className="text-primary text-sm hover:underline"
                  >
                    {t("view_all_print_jobs")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>{t("no_print_jobs_yet")}</p>
                <button
                  onClick={() => navigate("/print")}
                  className="text-primary text-sm hover:underline mt-2"
                >
                  {t("create_first_print_job")}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Classes with Unpaid Balance */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">{t("unpaid_balances_by_class")}</h2>
            {classesWithHighBalance.length > 0 ? (
              <div className="space-y-4">
                {classesWithHighBalance.map((c) => (
                  <div 
                    key={c.id} 
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/history?class=${encodeURIComponent(c.name)}&filter=unpaid`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Pencil className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={c.totalUnpaid > 50 ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {t("unpaid")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <p className="font-bold">{c.totalUnpaid.toFixed(2)} {t("currency")}</p>
                  </div>
                ))}
                <div className="text-center pt-2">
                  <button 
                    onClick={() => navigate("/history?filter=unpaid")}
                    className="text-primary text-sm hover:underline"
                  >
                    {t("view_all_unpaid_jobs")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Check className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p>{t("all_classes_paid")}</p>
                <button
                  onClick={() => navigate("/history")}
                  className="text-primary text-sm hover:underline mt-2"
                >
                  {t("view_all_print_jobs")}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;