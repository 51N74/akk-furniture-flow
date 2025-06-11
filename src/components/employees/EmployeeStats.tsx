
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface EmployeeStatsProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
    admin: number;
    manager: number;
    sales_staff: number;
    cashier: number;
  };
}

const EmployeeStats: React.FC<EmployeeStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">พนักงานทั้งหมด</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-sm text-gray-600">ปฏิบัติงาน</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          <div className="text-sm text-gray-600">หยุดปฏิบัติงาน</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-purple-600">{stats.admin}</div>
          <div className="text-sm text-gray-600">ผู้ดูแลระบบ</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeStats;
