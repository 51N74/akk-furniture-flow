import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Plus, Search, Eye, DollarSign, Calendar, Edit } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import EditContractForm from "@/components/hire-purchase/EditContractForm";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
}

interface HirePurchaseContract {
  id: string;
  customer_id: string;
  contract_number: string;
  customers: { name: string };level: string;}
  total_amount: number;
  down_payment: number;
  outstanding_balance: number;
  interest_rate: number;
  installment_periods: number;
  monthly_payment: number;
  status: string;
  contract_date: string;
}

const HirePurchase = () => {
  const [contracts, setContracts] = useState<HirePurchaseContract[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState({
    customer_id: "",
    total_amount: "",
    down_payment: "",
    interest_rate: "15",
    installment_periods: "12",
    products: [] as { product_id: string; quantity: number; unit_price: number }[]
  });

  const { isAdmin } = useUserRole();
  const [editingContract, setEditingContract] = useState<HirePurchaseContract | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetchContracts();
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchContracts = async () => {
    try {
      const { data, error } = await supabase
        .from("hire_purchase_contracts")
        .select(`
          *,
          customers (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContracts(data || []);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      toast.error("ไม่สามารถโหลดข้อมูลสัญญาได้");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name, phone, email")
        .order("name");

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, stock_quantity")
        .gt("stock_quantity", 0)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const calculateMonthlyPayment = (amount: number, interestRate: number, periods: number) => {
    const monthlyRate = interestRate / 100 / 12;
    const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, periods)) / 
                   (Math.pow(1 + monthlyRate, periods) - 1);
    return payment;
  };

  const handleCreateContract = async () => {
    try {
      const totalAmount = parseFloat(formData.total_amount);
      const downPayment = parseFloat(formData.down_payment);
      const interestRate = parseFloat(formData.interest_rate);
      const periods = parseInt(formData.installment_periods);
      
      const loanAmount = totalAmount - downPayment;
      const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, periods);
      
      const contractNumber = `HP${Date.now()}`;

      const { data: contract, error: contractError } = await supabase
        .from("hire_purchase_contracts")
        .insert({
          contract_number: contractNumber,
          customer_id: formData.customer_id,
          total_amount: totalAmount,
          down_payment: downPayment,
          outstanding_balance: loanAmount,
          interest_rate: interestRate,
          installment_periods: periods,
          monthly_payment: monthlyPayment,
          status: "active"
        })
        .select()
        .single();

      if (contractError) throw contractError;

      // สร้างรายการสินค้าในสัญญา
      if (formData.products.length > 0) {
        const items = formData.products.map(item => ({
          contract_id: contract.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price
        }));

        const { error: itemsError } = await supabase
          .from("hire_purchase_items")
          .insert(items);

        if (itemsError) throw itemsError;
      }

      toast.success("สร้างสัญญาผ่อนชำระเรียบร้อยแล้ว");
      setShowCreateForm(false);
      setFormData({
        customer_id: "",
        total_amount: "",
        down_payment: "",
        interest_rate: "15",
        installment_periods: "12",
        products: []
      });
      fetchContracts();
    } catch (error) {
      console.error("Error creating contract:", error);
      toast.error("ไม่สามารถสร้างสัญญาได้");
    }
  };

  const handleEditContract = (contract: HirePurchaseContract) => {
    setEditingContract(contract);
    setShowEditForm(true);
  };

  const handleEditSuccess = () => {
    fetchContracts();
    setShowEditForm(false);
    setEditingContract(null);
  };

  const filteredContracts = contracts.filter(contract =>
    contract.contract_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.customers?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          ระบบสัญญาผ่อนชำระ
        </h1>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          สร้างสัญญาใหม่
        </Button>
      </div>

      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>สร้างสัญญาผ่อนชำระใหม่</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">ลูกค้า</Label>
                <Select value={formData.customer_id} onValueChange={(value) => 
                  setFormData({...formData, customer_id: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกลูกค้า" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="total_amount">ราคารวมทั้งหมด (บาท)</Label>
                <Input
                  id="total_amount"
                  type="number"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="down_payment">เงินดาวน์ (บาท)</Label>
                <Input
                  id="down_payment"
                  type="number"
                  value={formData.down_payment}
                  onChange={(e) => setFormData({...formData, down_payment: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="interest_rate">อัตราดอกเบี้ย (% ต่อปี)</Label>
                <Input
                  id="interest_rate"
                  type="number"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({...formData, interest_rate: e.target.value})}
                  placeholder="15"
                />
              </div>

              <div>
                <Label htmlFor="installment_periods">จำนวนงวด (เดือน)</Label>
                <Select value={formData.installment_periods} onValueChange={(value) => 
                  setFormData({...formData, installment_periods: value})
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 เดือน</SelectItem>
                    <SelectItem value="12">12 เดือน</SelectItem>
                    <SelectItem value="18">18 เดือน</SelectItem>
                    <SelectItem value="24">24 เดือน</SelectItem>
                    <SelectItem value="36">36 เดือน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateContract} className="bg-green-600 hover:bg-green-700">
                <FileText className="h-4 w-4 mr-2" />
                สร้างสัญญา
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                ยกเลิก
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>รายการสัญญาผ่อนชำระ</CardTitle>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="ค้นหาเลขที่สัญญาหรือชื่อลูกค้า..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredContracts.map((contract) => (
              <div key={contract.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">สัญญาเลขที่: {contract.contract_number}</span>
                      <Badge className={getStatusColor(contract.status)}>
                        {contract.status === 'active' ? 'ใช้งาน' : 
                         contract.status === 'completed' ? 'เสร็จสิ้น' : 'เกินกำหนด'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      ลูกค้า: {contract.customers?.name}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ยอดรวม: ฿{contract.total_amount?.toLocaleString()}
                      </span>
                      <span>งวดละ: ฿{contract.monthly_payment?.toLocaleString()}</span>
                      <span>{contract.installment_periods} งวด</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right text-sm text-gray-600">
                      <p>วันที่สัญญา: {new Date(contract.contract_date).toLocaleDateString('th-TH')}</p>
                      <p>คงเหลือ: ฿{contract.outstanding_balance?.toLocaleString()}</p>
                    </div>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditContract(contract)}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        แก้ไข
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {filteredContracts.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                ไม่พบข้อมูลสัญญาผ่อนชำระ
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EditContractForm
        contract={editingContract}
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setEditingContract(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default HirePurchase;
