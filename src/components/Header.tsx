
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AKK Sell and Service</h1>
            <p className="text-sm text-gray-600">Furniture Business Management</p>
          </div>
        </div>
        <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50">
          Login
        </Button>
      </div>
    </header>
  );
};

export default Header;
