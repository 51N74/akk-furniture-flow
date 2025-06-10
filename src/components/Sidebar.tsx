
import { 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  BarChart, 
  Receipt, 
  User 
} from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState("dashboard");

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart },
    { id: "sales", label: "Cash Sales", icon: ShoppingCart },
    { id: "hire-purchase", label: "Hire Purchase", icon: FileText },
    { id: "customers", label: "Customers", icon: Users },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "accounting", label: "Accounting", icon: Receipt },
    { id: "reports", label: "Reports", icon: BarChart },
  ];

  return (
    <div className="bg-gray-50 w-64 min-h-screen border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Main Menu</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveItem(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeItem === item.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
