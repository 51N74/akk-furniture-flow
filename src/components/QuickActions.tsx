
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ShoppingCart, Users, Package, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "การขายเงินสด",
      description: "สร้างรายการขายใหม่",
      icon: ShoppingCart,
      color: "bg-green-600 hover:bg-green-700",
      onClick: () => navigate("/cash-sales")
    },
    {
      title: "เพิ่มลูกค้า",
      description: "ลงทะเบียนลูกค้าใหม่",
      icon: Users,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: () => navigate("/customers")
    },
    {
      title: "เพิ่มสินค้า",
      description: "เพิ่มสินค้าเข้าสต็อก",
      icon: Package,
      color: "bg-purple-600 hover:bg-purple-700",
      onClick: () => navigate("/products")
    },
    {
      title: "สัญญาผ่อนชำระ",
      description: "สร้างสัญญาผ่อนชำระใหม่",
      icon: FileText,
      color: "bg-orange-600 hover:bg-orange-700",
      onClick: () => navigate("/hire-purchase")
    }
  ];

  return (
    <Card className="p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">การดำเนินการด่วน</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="outline"
              className={`${action.color} text-white border-none h-auto p-4 flex-col space-y-2 hover:scale-105 transition-all duration-200`}
              onClick={action.onClick}
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
