
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart as BarChartIcon, TrendingUp, DollarSign, Users, Package, FileText } from "lucide-react";

interface SalesData {
  month: string;
  cash_sales: number;
  hire_purchase: number;
}

interface ReportStats {
  total_sales: number;
  total_customers: number;
  total_products: number;
  active_contracts: number;
  monthly_revenue: number;
  top_products: Array<{
    name: string;
    total_sold: number;
    revenue: number;
  }>;
}

const Reports = () => {
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportType, setReportType] = useState("overview");
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      
      // คำนวณวันที่ย้อนหลัง
      const daysAgo = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // ดึงข้อมูลสถิติรวม
      const [
        { count: totalSales },
        { count: totalCustomers },
        { count: totalProducts },
        { count: activeContracts }
      ] = await Promise.all([
        supabase.from("cash_sales").select("*", { count: "exact", head: true }),
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("hire_purchase_contracts").select("*", { count: "exact", head: true }).eq("status", "active")
      ]);

      // ดึงข้อมูลยอดขายเงินสด
      const { data: cashSalesData } = await supabase
        .from("cash_sales")
        .select("total_amount, sale_date")
        .gte("sale_date", startDate.toISOString());

      // ดึงข้อมูลสัญญาผ่อนชำระ
      const { data: hirePurchaseData } = await supabase
        .from("hire_purchase_contracts")
        .select("total_amount, contract_date")
        .gte("contract_date", startDate.toISOString());

      // คำนวณรายได้รายเดือน
      const monthlyRevenue = (cashSalesData || []).reduce((sum, sale) => sum + (sale.total_amount || 0), 0) +
                           (hirePurchaseData || []).reduce((sum, contract) => sum + (contract.total_amount || 0), 0);

      // ดึงข้อมูลสินค้าขายดี
      const { data: topProductsData } = await supabase
        .from("cash_sale_items")
        .select(`
          quantity,
          total_price,
          products (name)
        `)
        .order("quantity", { ascending: false })
        .limit(5);

      // จัดกลุ่มสินค้าขายดี
      const productMap = new Map();
      (topProductsData || []).forEach(item => {
        const productName = item.products?.name || "Unknown";
        if (productMap.has(productName)) {
          const existing = productMap.get(productName);
          existing.total_sold += item.quantity;
          existing.revenue += item.total_price;
        } else {
          productMap.set(productName, {
            name: productName,
            total_sold: item.quantity,
            revenue: item.total_price
          });
        }
      });

      const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, 5);

      // สร้างข้อมูลกราф
      const chartData = generateChartData(cashSalesData || [], hirePurchaseData || []);

      setReportStats({
        total_sales: totalSales || 0,
        total_customers: totalCustomers || 0,
        total_products: totalProducts || 0,
        active_contracts: activeContracts || 0,
        monthly_revenue: monthlyRevenue,
        top_products: topProducts
      });

      setSalesData(chartData);
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateChartData = (cashSales: any[], hirePurchase: any[]) => {
    const monthData = new Map();
    const months = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

    // เริ่มต้นข้อมูล 12 เดือนที่ผ่านมา
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear() + 543}`;
      monthData.set(monthKey, { month: monthKey, cash_sales: 0, hire_purchase: 0 });
    }

    // เพิ่มข้อมูลการขายเงินสด
    cashSales.forEach(sale => {
      const date = new Date(sale.sale_date);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear() + 543}`;
      if (monthData.has(monthKey)) {
        monthData.get(monthKey).cash_sales += sale.total_amount || 0;
      }
    });

    // เพิ่มข้อมูลผ่อนชำระ
    hirePurchase.forEach(contract => {
      const date = new Date(contract.contract_date);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear() + 543}`;
      if (monthData.has(monthKey)) {
        monthData.get(monthKey).hire_purchase += contract.total_amount || 0;
      }
    });

    return Array.from(monthData.values());
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">กำลังโหลดรายงาน...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChartIcon className="h-6 w-6" />
          รายงานและสถิติ
        </h1>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 วันที่ผ่านมา</SelectItem>
              <SelectItem value="30">30 วันที่ผ่านมา</SelectItem>
              <SelectItem value="90">90 วันที่ผ่านมา</SelectItem>
              <SelectItem value="365">1 ปีที่ผ่านมา</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* สถิติรวม */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ยอดขายรวม</p>
                <p className="text-2xl font-bold">{reportStats?.total_sales || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ลูกค้าทั้งหมด</p>
                <p className="text-2xl font-bold">{reportStats?.total_customers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">สินค้าทั้งหมด</p>
                <p className="text-2xl font-bold">{reportStats?.total_products || 0}</p>
              </div>
              <Package className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">สัญญาที่ใช้งาน</p>
                <p className="text-2xl font-bold">{reportStats?.active_contracts || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* กราฟยอดขาย */}
      <Card>
        <CardHeader>
          <CardTitle>ยอดขายรายเดือน</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => [`฿${value.toLocaleString()}`, '']} />
              <Bar dataKey="cash_sales" fill="#8884d8" name="การขายเงินสด" />
              <Bar dataKey="hire_purchase" fill="#82ca9d" name="ผ่อนชำระ" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* สินค้าขายดี */}
      <Card>
        <CardHeader>
          <CardTitle>สินค้าขายดี Top 5</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {reportStats?.top_products.map((product, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">ขายได้ {product.total_sold} ชิ้น</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">฿{product.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={reportStats?.top_products}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="total_sold"
                  >
                    {reportStats?.top_products.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* รายได้รวม */}
      <Card>
        <CardHeader>
          <CardTitle>สรุปรายได้ ({dateRange} วันที่ผ่านมา)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              ฿{reportStats?.monthly_revenue.toLocaleString()}
            </p>
            <p className="text-gray-600 mt-2">รายได้รวมทั้งหมด</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
