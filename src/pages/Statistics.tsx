
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatsCard from "@/components/dashboard/StatsCard";
import { getPrintJobs, PrintJob, getClasses, Class } from "@/lib/db";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Statistics = () => {
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<any[]>([]);
  const [classDistribution, setClassDistribution] = useState<any[]>([]);
  const [printTypeDistribution, setPrintTypeDistribution] = useState<any[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalJobs: 0,
    totalPages: 0,
    totalRevenue: 0,
    averageJobSize: 0,
  });
  
  const COLORS = ['#007BFF', '#00C49A', '#FFBB28', '#FF8042', '#A86EDC', '#E6596D'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const jobs = getPrintJobs();
    setPrintJobs(jobs);
    
    const classesData = getClasses();
    setClasses(classesData);
    
    calculateStatistics(jobs);
  };

  const calculateStatistics = (jobs: PrintJob[]) => {
    // Calculate monthly statistics
    const months: Record<string, { jobs: number, pages: number, revenue: number }> = {};
    
    jobs.forEach(job => {
      const date = new Date(job.timestamp);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!months[monthYear]) {
        months[monthYear] = { jobs: 0, pages: 0, revenue: 0 };
      }
      
      months[monthYear].jobs += 1;
      months[monthYear].pages += job.pages * job.copies;
      months[monthYear].revenue += job.totalPrice;
    });
    
    const monthlyData = Object.entries(months).map(([month, stats]) => ({
      month,
      jobs: stats.jobs,
      pages: stats.pages,
      revenue: stats.revenue,
    }));
    
    setMonthlyStats(monthlyData);
    
    // Calculate class distribution
    const classCounts: Record<string, { jobs: number, pages: number, revenue: number }> = {};
    
    jobs.forEach(job => {
      if (!classCounts[job.className]) {
        classCounts[job.className] = { jobs: 0, pages: 0, revenue: 0 };
      }
      
      classCounts[job.className].jobs += 1;
      classCounts[job.className].pages += job.pages * job.copies;
      classCounts[job.className].revenue += job.totalPrice;
    });
    
    const classData = Object.entries(classCounts)
      .map(([name, stats]) => ({
        name,
        jobs: stats.jobs,
        pages: stats.pages,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.jobs - a.jobs);
    
    setClassDistribution(classData);
    
    // Calculate print type distribution
    const printTypeCounts: Record<string, { jobs: number, pages: number }> = {
      'Recto': { jobs: 0, pages: 0 },
      'Recto-verso': { jobs: 0, pages: 0 },
      'Both': { jobs: 0, pages: 0 },
    };
    
    jobs.forEach(job => {
      printTypeCounts[job.printType].jobs += 1;
      printTypeCounts[job.printType].pages += job.pages * job.copies;
    });
    
    const printTypeData = Object.entries(printTypeCounts)
      .map(([name, stats]) => ({
        name,
        jobs: stats.jobs,
        pages: stats.pages,
      }));
    
    setPrintTypeDistribution(printTypeData);
    
    // Calculate total statistics
    const totalJobs = jobs.length;
    const totalPages = jobs.reduce((acc, job) => acc + job.pages * job.copies, 0);
    const totalRevenue = jobs.reduce((acc, job) => acc + job.totalPrice, 0);
    const averageJobSize = totalJobs > 0 ? Math.round(totalPages / totalJobs) : 0;
    
    setTotalStats({
      totalJobs,
      totalPages,
      totalRevenue,
      averageJobSize,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-1">Statistics</h1>
        <p className="text-gray-500">View detailed analytics about your print operations</p>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Print Jobs"
          value={totalStats.totalJobs}
        />
        <StatsCard
          title="Total Pages Printed"
          value={totalStats.totalPages.toLocaleString()}
        />
        <StatsCard
          title="Total Revenue"
          value={`$${totalStats.totalRevenue.toFixed(2)}`}
        />
        <StatsCard
          title="Avg. Pages Per Job"
          value={totalStats.averageJobSize}
        />
      </div>
      
      {/* Monthly Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {monthlyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyStats}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" stroke="#007BFF" />
                  <YAxis yAxisId="right" orientation="right" stroke="#00C49A" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="jobs" name="Jobs" fill="#007BFF" />
                  <Bar yAxisId="right" dataKey="pages" name="Pages" fill="#00C49A" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Class Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {classDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="jobs"
                    >
                      {classDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} jobs`, props.payload.name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Print Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Print Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {printTypeDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={printTypeDistribution}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="jobs" name="Jobs" fill="#007BFF" />
                    <Bar dataKey="pages" name="Pages" fill="#00C49A" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;
