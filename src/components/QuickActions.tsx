
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ShoppingCart, Users, Package } from "lucide-react";

const QuickActions = () => {
  const actions = [
    {
      title: "New Cash Sale",
      description: "Create a new cash sale transaction",
      icon: ShoppingCart,
      color: "bg-green-600 hover:bg-green-700"
    },
    {
      title: "Add Customer",
      description: "Register a new customer",
      icon: Users,
      color: "bg-blue-600 hover:bg-blue-700"
    },
    {
      title: "Add Product",
      description: "Add new inventory item",
      icon: Package,
      color: "bg-purple-600 hover:bg-purple-700"
    },
    {
      title: "Hire Purchase",
      description: "Create new hire purchase agreement",
      icon: Plus,
      color: "bg-orange-600 hover:bg-orange-700"
    }
  ];

  return (
    <Card className="p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className={`${action.color} text-white border-none h-auto p-4 flex-col space-y-2 hover:scale-105 transition-all duration-200`}
            >
              <Icon className="h-8 w-8" />
              <div className="text-center">
                <p className="font-medium">{action.title}</p>
                <p className="text-xs opacity-90">{action.description}</p>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default QuickActions;
