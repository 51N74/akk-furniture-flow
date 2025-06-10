
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ShoppingCart, 
  Users, 
  Package, 
  TrendingUp, 
  DollarSign, 
  FileText,
  AlertCircle 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [
        { count: customersCount },
        { count: productsCount },
        { count: salesCount },
        { count: contractsCount }
      ] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('cash_sales').select('*', { count: 'exact', head: true }),
        supabase.from('hire_purchase_contracts').select('*', { count: 'exact', head: true })
      ]);

      // Get total sales amount
      const { data: salesData } = await supabase
        .from('cash_sales')
        .select('total_amount');
      
      const totalSales = salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;

      // Get low stock products
      const { data: lowStockProducts } = await supabase
        .from('products')
        .select('*')
        .lt('stock_quantity', 10);

      return {
        customersCount: customersCount || 0,
        productsCount: productsCount || 0,
        salesCount: salesCount || 0,
        contractsCount: contractsCount || 0,
        totalSales,
        lowStockCount: lowStockProducts?.length || 0
      };
    },
  });

  const statsCards = [
    {
      title: "ลูกค้าทั้งหมด",
      value: stats?.customersCount || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "สินค้าในสต็อก",
      value: stats?.productsCount || 0,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "ยอดขายรวม",
      value: `฿${stats?.totalSales?.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "การขายวันนี้",
      value: stats?.salesCount || 0,
      icon: ShoppingCart,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "สัญญาผ่อนชำระ",
      value: stats?.contractsCount || 0,
      icon: FileText,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "สินค้าใกล้หมด",
      value: stats?.lowStockCount || 0,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ภาพรวมธุรกิจ</h2>
        <p className="text-gray-600">สรุปข้อมูลสำคัญของระบบ AKK Sell and Service</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">
                  <TrendingUp className="h-3 w-3 inline mr-1" />
                  อัปเดตล่าสุด
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span>การแจ้งเตือนสำคัญ</span>
            </CardTitle>
            <CardDescription>รายการที่ต้องให้ความสำคัญ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.lowStockCount ? (
                <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">สินค้าใกล้หมดสต็อก</p>
                    <p className="text-sm text-red-600">มีสินค้า {stats.lowStockCount} รายการที่ต้องเติมสต็อก</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Package className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">สต็อกสินค้าปกติ</p>
                    <p className="text-sm text-green-600">ไม่มีสินค้าที่ต้องเติมสต็อกในขณะนี้</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>สถิติการขาย</span>
            </CardTitle>
            <CardDescription>ข้อมูลการขายในช่วงเวลาล่าสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ยอดขายรวม</span>
                <span className="font-bold text-lg">฿{stats?.totalSales?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">จำนวนการขาย</span>
                <span className="font-bold">{stats?.salesCount || 0} รายการ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">สัญญาผ่อนชำระ</span>
                <span className="font-bold">{stats?.contractsCount || 0} สัญญา</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
