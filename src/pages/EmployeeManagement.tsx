
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';
import EmployeeForm from '@/components/employees/EmployeeForm';
import EmployeeStats from '@/components/employees/EmployeeStats';
import EmployeeFilters from '@/components/employees/EmployeeFilters';
import EmployeeTable from '@/components/employees/EmployeeTable';

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

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    role: 'sales_staff',
    position: '',
    department: '',
    hire_date: '',
    salary: '',
    status: 'active'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลพนักงานได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const employeeData = {
        ...formData,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        hire_date: formData.hire_date || null,
      };

      if (editingEmployee) {
        const { error } = await supabase
          .from('profiles')
          .update(employeeData)
          .eq('id', editingEmployee.id);

        if (error) throw error;

        toast({
          title: "อัพเดตข้อมูลสำเร็จ",
          description: "ข้อมูลพนักงานได้รับการอัพเดตแล้ว",
        });
      } else {
        toast({
          title: "แจ้งเตือน",
          description: "การเพิ่มพนักงานใหม่ต้องผ่านการสมัครสมาชิกในระบบ",
          variant: "destructive",
        });
      }

      setDialogOpen(false);
      resetForm();
      fetchEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      username: employee.username || '',
      first_name: employee.first_name || '',
      last_name: employee.last_name || '',
      email: employee.email || '',
      role: employee.role || 'sales_staff',
      position: employee.position || '',
      department: employee.department || '',
      hire_date: employee.hire_date || '',
      salary: employee.salary?.toString() || '',
      status: employee.status || 'active'
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบพนักงานคนนี้?')) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'inactive' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "ลบข้อมูลสำเร็จ",
        description: "ข้อมูลพนักงานได้รับการลบแล้ว",
      });

      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบข้อมูลได้",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      role: 'sales_staff',
      position: '',
      department: '',
      hire_date: '',
      salary: '',
      status: 'active'
    });
    setEditingEmployee(null);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && employee.status === 'active';
    if (activeTab === 'inactive') return matchesSearch && employee.status === 'inactive';
    return matchesSearch && employee.role === activeTab;
  });

  const getEmployeeStats = () => {
    return {
      total: employees.length,
      active: employees.filter(e => e.status === 'active').length,
      inactive: employees.filter(e => e.status === 'inactive').length,
      admin: employees.filter(e => e.role === 'admin').length,
      manager: employees.filter(e => e.role === 'manager').length,
      sales_staff: employees.filter(e => e.role === 'sales_staff').length,
      cashier: employees.filter(e => e.role === 'cashier').length
    };
  };

  const stats = getEmployeeStats();

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6" />
                จัดการข้อมูลพนักงาน
              </CardTitle>
              <CardDescription>จัดการข้อมูลและสิทธิ์ของพนักงานในระบบ</CardDescription>
            </div>
            <EmployeeForm
              dialogOpen={dialogOpen}
              setDialogOpen={setDialogOpen}
              editingEmployee={editingEmployee}
              formData={formData}
              setFormData={setFormData}
              loading={loading}
              onSubmit={handleSubmit}
              onReset={resetForm}
            />
          </div>
        </CardHeader>

        <CardContent>
          <EmployeeStats stats={stats} />
          
          <EmployeeFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            stats={stats}
          />

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value={activeTab} className="mt-6">
              <EmployeeTable
                employees={filteredEmployees}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeManagement;
