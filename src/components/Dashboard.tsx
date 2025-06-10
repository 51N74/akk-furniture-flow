
import { Card } from "@/components/ui/card";
import { ShoppingCart, Users, Package, Receipt } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Today's Sales",
      value: "฿12,450",
      icon: ShoppingCart,
      color: "bg-green-100 text-green-600",
      change: "+8.2%"
    },
    {
      title: "Active Customers",
      value: "1,247",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      change: "+3.1%"
    },
    {
      title: "Items in Stock",
      value: "456",
      icon: Package,
      color: "bg-purple-100 text-purple-600",
      change: "-2.4%"
    },
    {
      title: "Pending Payments",
      value: "฿8,230",
      icon: Receipt,
      color: "bg-orange-100 text-orange-600",
      change: "+12.5%"
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your business today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from yesterday
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h3>
          <div className="space-y-4">
            {[
              { customer: "John Doe", item: "Dining Table Set", amount: "฿4,500", time: "2 hours ago" },
              { customer: "Jane Smith", item: "Office Chair", amount: "฿1,200", time: "4 hours ago" },
              { customer: "Mike Johnson", item: "Bedroom Set", amount: "฿8,900", time: "6 hours ago" }
            ].map((sale, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{sale.customer}</p>
                  <p className="text-sm text-gray-600">{sale.item}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{sale.amount}</p>
                  <p className="text-sm text-gray-500">{sale.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Payments</h3>
          <div className="space-y-4">
            {[
              { customer: "Alice Brown", amount: "฿850", dueDate: "Tomorrow", status: "Due Soon" },
              { customer: "Bob Wilson", amount: "฿1,200", dueDate: "In 3 days", status: "Upcoming" },
              { customer: "Carol Davis", amount: "฿650", dueDate: "Overdue", status: "Overdue" }
            ].map((payment, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{payment.customer}</p>
                  <p className="text-sm text-gray-600">{payment.dueDate}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{payment.amount}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    payment.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                    payment.status === 'Due Soon' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
