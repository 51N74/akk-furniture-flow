
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';

interface Employee {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  position: string;
  department: string;
  hire_date: string;
  salary: number;
  status: string;
  created_at: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onEdit,
  onDelete
}) => {
  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-red-500',
      manager: 'bg-blue-500',
      sales_staff: 'bg-green-500',
      cashier: 'bg-yellow-500'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-500';
  };

  const getRoleText = (role: string) => {
    const roleTexts = {
      admin: 'ผู้ดูแลระบบ',
      manager: 'ผู้จัดการ',
      sales_staff: 'พนักงานขาย',
      cashier: 'แคชเชียร์'
    };
    return roleTexts[role as keyof typeof roleTexts] || role;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ชื่อ-นามสกุล</TableHead>
          <TableHead>ชื่อผู้ใช้</TableHead>
          <TableHead>อีเมล</TableHead>
          <TableHead>ตำแหน่ง</TableHead>
          <TableHead>แผนก</TableHead>
          <TableHead>สิทธิ์</TableHead>
          <TableHead>เงินเดือน</TableHead>
          <TableHead>สถานะ</TableHead>
          <TableHead>จัดการ</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-8 text-gray-500">
              ไม่พบข้อมูลพนักงาน
            </TableCell>
          </TableRow>
        ) : (
          employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">
                {employee.first_name} {employee.last_name}
              </TableCell>
              <TableCell>{employee.username || '-'}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{employee.position || '-'}</TableCell>
              <TableCell>{employee.department || '-'}</TableCell>
              <TableCell>
                <Badge className={`text-white ${getRoleBadge(employee.role)}`}>
                  {getRoleText(employee.role)}
                </Badge>
              </TableCell>
              <TableCell>
                {employee.salary ? `฿${employee.salary.toLocaleString()}` : '-'}
              </TableCell>
              <TableCell>
                <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                  {employee.status === 'active' ? 'ปฏิบัติงาน' : 'หยุดปฏิบัติงาน'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(employee)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onDelete(employee.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default EmployeeTable;
