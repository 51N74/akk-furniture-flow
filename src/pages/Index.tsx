
import Dashboard from "@/components/Dashboard";
import QuickActions from "@/components/QuickActions";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1">
        <QuickActions />
        <Dashboard />
      </main>
    </div>
  );
};

export default Index;
