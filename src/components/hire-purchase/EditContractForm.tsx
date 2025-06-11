
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Save, X } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

interface HirePurchaseContract {
  id: string;
  contract_number: string;
  customer_id: string;
  total_amount: number;
  down_payment: number;
  outstanding_balance: number;
  interest_rate: number;
  installment_periods: number;
  monthly_payment: number;
  status: string;
}

interface EditContractFormProps {
  contract: HirePurchaseContract | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditContractForm = ({ contract, isOpen, onClose, onSuccess }: EditContractFormProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: "",
    total_amount: "",
    down_payment: "",
    interest_rate: "",
    installment_periods: "",
    status: ""
  });

  useEffect(() => {
    if (contract) {
      setFormData({
        customer_id: contract.customer_id,
        total_amount: contract.total_amount.toString(),
        down_payment: contract.down_payment.toString(),
        interest_rate: contract.interest_rate.toString(),
        installment_periods: contract.installment_periods.toString(),
        status: contract.status
      });
    }
  }, [contract]);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

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

  const calculateMonthlyPayment = (amount: number, interestRate: number, periods: number) => {
    const monthlyRate = interestRate / 100 / 12;
    const payment = (amount * monthlyRate * Math.pow(1 + monthlyRate, periods)) / 
                   (Math.pow(1 + monthlyRate, periods) - 1);
    return payment;
  };

  const handleSubmit = async () => {
    if (!contract) return;

    try {
      setIsLoading(true);
      
      const totalAmount = parseFloat(formData.total_amount);
      const downPayment = parseFloat(formData.down_payment);
      const interestRate = parseFloat(formData.interest_rate);
      const periods = parseInt(formData.installment_periods);
      
      const loanAmount = totalAmount - downPayment;
      const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, periods);

      const { error } = await supabase
        .from("hire_purchase_contracts")
        .update({
          customer_id: formData.customer_id,
          total_amount: totalAmount,
          down_payment: downPayment,
          outstanding_balance: loanAmount,
          interest_rate: interestRate,
          installment_periods: periods,
          monthly_payment: monthlyPayment,
          status: formData.status
        })
        .eq("id", contract.id);

      if (error) throw error;

      toast.success("อัพเดทสัญญาเรียบร้อยแล้ว");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating contract:", error);
      toast.error("ไม่สามารถอัพเดทสัญญาได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            แก้ไขสัญญาผ่อนชำระ: {contract?.contract_number}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
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

            <div>
              <Label htmlFor="status">สถานะ</Label>
              <Select value={formData.status} onValueChange={(value) => 
                setFormData({...formData, status: value})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">ใช้งาน</SelectItem>
                  <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                  <SelectItem value="overdue">เกินกำหนด</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              <X className="h-4 w-4 mr-2" />
              ยกเลิก
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditContractForm;
