
import { NavLink } from "react-router-dom";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  BarChart, 
  Receipt,
  Home
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/" },
    { id: "cash-sales", label: "Cash Sales", icon: ShoppingCart, path: "/cash-sales" },
    { id: "customers", label: "Customers", icon: Users, path: "/customers" },
    { id: "products", label: "Products", icon: Package, path: "/products" },
    { id: "hire-purchase", label: "Hire Purchase", icon: FileText, path: "/hire-purchase" },
    { id: "reports", label: "Reports", icon: BarChart, path: "/reports" },
    { id: "accounting", label: "Accounting", icon: Receipt, path: "/accounting" },
  ];

  return (
    <div className="bg-gray-50 w-64 min-h-screen border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">เมนูหลัก</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
