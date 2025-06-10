
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Receipt, DollarSign, TrendingUp, TrendingDown, Calendar, Plus, Search } from "lucide-react";

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
  reference_id?: string;
  reference_type?: string;
}

interface AccountingSummary {
  total_income: number;
  total_expenses: number;
  net_profit: number;
  cash_sales_income: number;
  hire_purchase_income: number;
}

const Accounting = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState("30");
  
  const [formData, setFormData] = useState({
    type: "expense" as 'income' | 'expense',
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split('T')[0]
  });

  const expenseCategories = [
    "เช่าร้าน", "ค่าไฟฟ้า", "ค่าน้ำ", "เงินเดือนพนักงาน", "ค่าขนส่ง", 
    "ค่าซ่อมแซม", "ค่าโฆษณา", "วัสดุสำนักงาน", "อื่นๆ"
  ];

  const incomeCategories = [
    "การขายเงินสด", "ดอกเบี้ยผ่อนชำระ", "ค่าธรรมเนียม", "รายได้อื่น"
  ];

  useEffect(() => {
    fetchAccountingData();
  }, [dateRange]);

  const fetchAccountingData = async () => {
    try {
      setIsLoading(true);
      
      // คำนวณวันที่ย้อนหลัง
      const daysAgo = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // ดึงข้อมูลการขายเงินสด
      const { data: cashSalesData } = await supabase
        .from("cash_sales")
        .select("id, total_amount, sale_date")
        .gte("sale_date", startDate.toISOString());

      // ดึงข้อมูลสัญญาผ่อนชำระ
      const { data: contractsData } = await supabase
        .from("hire_purchase_contracts")
        .select("id, total_amount, contract_date")
        .gte("contract_date", startDate.toISOString());

      // สร้างรายการธุรกรรมจากข้อมูลจริง
      const autoTransactions: Transaction[] = [];

      // เพิ่มรายการขายเงินสด
      (cashSalesData || []).forEach(sale => {
        autoTransactions.push({
          id: `cash_${sale.id}`,
          type: 'income',
          amount: sale.total_amount,
          description: `การขายเงินสด #${sale.id.slice(0, 8)}`,
          category: 'การขายเงินสด',
          date: sale.sale_date,
          reference_id: sale.id,
          reference_type: 'cash_sale'
        });
      });

      // เพิ่มรายการสัญญาผ่อนชำระ
      (contractsData || []).forEach(contract => {
        autoTransactions.push({
          id: `hp_${contract.id}`,
          type: 'income',
          amount: contract.total_amount,
          description: `สัญญาผ่อนชำระ #${contract.id.slice(0, 8)}`,
          category: 'ดอกเบี้ยผ่อนชำระ',
          date: contract.contract_date,
          reference_id: contract.id,
          reference_type: 'hire_purchase'
        });
      });

      // เพิ่มรายการค่าใช้จ่ายตัวอย่าง
      const sampleExpenses: Transaction[] = [
        {
          id: 'exp_1',
          type: 'expense',
          amount: 15000,
          description: 'ค่าเช่าร้าน ประจำเดือน',
          category: 'เช่าร้าน',
          date: new Date().toISOString().split('T')[0]
        },
        {
          id: 'exp_2',
          type: 'expense',
          amount: 3500,
          description: 'ค่าไฟฟ้า ประจำเดือน',
          category: 'ค่าไฟฟ้า',
          date: new Date().toISOString().split('T')[0]
        },
        {
          id: 'exp_3',
          type: 'expense',
          amount: 800,
          description: 'ค่าน้ำ ประจำเดือน',
          category: 'ค่าน้ำ',
          date: new Date().toISOString().split('T')[0]
        }
      ];

      const allTransactions = [...autoTransactions, ...sampleExpenses];
      setTransactions(allTransactions);

      // คำนวณสรุป
      const totalIncome = allTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = allTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const cashSalesIncome = (cashSalesData || [])
        .reduce((sum, sale) => sum + sale.total_amount, 0);
      
      const hirePurchaseIncome = (contractsData || [])
        .reduce((sum, contract) => sum + contract.total_amount, 0);

      setSummary({
        total_income: totalIncome,
        total_expenses: totalExpenses,
        net_profit: totalIncome - totalExpenses,
        cash_sales_income: cashSalesIncome,
        hire_purchase_income: hirePurchaseIncome
      });

    } catch (error) {
      console.error("Error fetching accounting data:", error);
      toast.error("ไม่สามารถโหลดข้อมูลบัญชีได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    try {
      const newTransaction: Transaction = {
        id: `manual_${Date.now()}`,
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        category: formData.category,
        date: formData.date
      };

      setTransactions(prev => [newTransaction, ...prev]);
      
      // อัพเดตสรุป
      if (summary) {
        const newSummary = { ...summary };
        if (formData.type === 'income') {
          newSummary.total_income += newTransaction.amount;
        } else {
          newSummary.total_expenses += newTransaction.amount;
        }
        newSummary.net_profit = newSummary.total_income - newSummary.total_expenses;
        setSummary(newSummary);
      }

      toast.success("เพิ่มรายการเรียบร้อยแล้ว");
      setShowAddForm(false);
      setFormData({
        type: "expense",
        amount: "",
        description: "",
        category: "",
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("ไม่สามารถเพิ่มรายการได้");
    }
  };

  const filteredTransactions = transactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || transaction.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">กำลังโหลดข้อมูลบัญชี...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Receipt className="h-6 w-6" />
          ระบบบัญชี
        </h1>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 วันที่ผ่านมา</SelectItem>
              <SelectItem value="30">30 วันที่ผ่านมา</SelectItem>
              <SelectItem value="90">90 วันที่ผ่านมา</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มรายการ
          </Button>
        </div>
      </div>

      {/* สรุปทางการเงิน */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">รายได้รวม</p>
                <p className="text-2xl font-bold text-green-600">
                  ฿{summary?.total_income.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ค่าใช้จ่ายรวม</p>
                <p className="text-2xl font-bold text-red-600">
                  ฿{summary?.total_expenses.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">กำไรสุทธิ</p>
                <p className={`text-2xl font-bold ${(summary?.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ฿{summary?.net_profit.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ขายเงินสด</p>
                <p className="text-2xl font-bold text-blue-600">
                  ฿{summary?.cash_sales_income.toLocaleString()}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ฟอร์มเพิ่มรายการ */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>เพิ่มรายการใหม่</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">ประเภท</Label>
                <Select value={formData.type} onValueChange={(value: 'income' | 'expense') => 
                  setFormData({...formData, type: value, category: ""})
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">รายได้</SelectItem>
                    <SelectItem value="expense">ค่าใช้จ่าย</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">หมวดหมู่</Label>
                <Select value={formData.category} onValueChange={(value) => 
                  setFormData({...formData, category: value})
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {(formData.type === 'income' ? incomeCategories : expenseCategories).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">จำนวนเงิน (บาท)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="date">วันที่</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">รายละเอียด</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="ระบุรายละเอียด..."
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddTransaction} className="bg-green-600 hover:bg-green-700">
                เพิ่มรายการ
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                ยกเลิก
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* รายการธุรกรรม */}
      <Card>
        <CardHeader>
          <CardTitle>รายการธุรกรรม</CardTitle>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <Input
              placeholder="ค้นหารายการ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="income">รายได้</SelectItem>
                <SelectItem value="expense">ค่าใช้จ่าย</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {transaction.type === 'income' ? 'รายได้' : 'ค่าใช้จ่าย'}
                      </Badge>
                      <span className="font-medium">{transaction.category}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('th-TH')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}฿{transaction.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                ไม่พบรายการธุรกรรม
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Accounting;
