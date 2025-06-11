
import React from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmployeeFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  stats: {
    total: number;
    active: number;
    admin: number;
    manager: number;
    sales_staff: number;
    cashier: number;
  };
}

const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  stats
}) => {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Input
          placeholder="ค้นหาพนักงาน..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">ทั้งหมด ({stats.total})</TabsTrigger>
          <TabsTrigger value="active">ปฏิบัติงาน ({stats.active})</TabsTrigger>
          <TabsTrigger value="admin">แอดมิน ({stats.admin})</TabsTrigger>
          <TabsTrigger value="manager">ผู้จัดการ ({stats.manager})</TabsTrigger>
          <TabsTrigger value="sales_staff">พนักงานขาย ({stats.sales_staff})</TabsTrigger>
          <TabsTrigger value="cashier">แคชเชียร์ ({stats.cashier})</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default EmployeeFilters;
