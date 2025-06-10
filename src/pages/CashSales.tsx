
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ShoppingCart, Minus, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  total: number;
}

interface Sale {
  id: string;
  total_amount: number;
  payment_method: string;
  sale_date: string;
  customers: { name: string };
  receipt_number?: string;
}

const CashSales = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);

  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products } = useQuery({
    queryKey: ['products-for-sale'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock_quantity', 0)
        .order('name');
      
      if (error) throw error;
      return data as Product[];
    },
  });

  // Fetch customers
  const { data: customers } = useQuery({
    queryKey: ['customers-for-sale'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone')
        .order('name');
      
      if (error) throw error;
      return data as Customer[];
    },
  });

  // Fetch sales history
  const { data: sales, isLoading } = useQuery({
    queryKey: ['cash-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cash_sales')
        .select(`
          *,
          customers (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
  });

  // Create sale mutation
  const createSaleMutation = useMutation({
    mutationFn: async (saleData: any) => {
      const { data: sale, error: saleError } = await supabase
        .from('cash_sales')
        .insert([{
          customer_id: selectedCustomer || null,
          sales_staff_id: user?.id,
          cashier_id: user?.id,
          total_amount: calculateTotal(),
          discount_amount: discount,
          tax_amount: tax,
          payment_method: paymentMethod,
          receipt_number: `RCP-${Date.now()}`
        }])
        .select()
        .single();

      if (saleError) throw saleError;

      // Insert sale items
      const saleItems = cart.map(item => ({
        sale_id: sale.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.total
      }));

      const { error: itemsError } = await supabase
        .from('cash_sale_items')
        .insert(saleItems);

      if (itemsError) throw itemsError;

      // Update stock quantities
      for (const item of cart) {
        const { error: stockError } = await supabase
          .from('products')
          .update({
            stock_quantity: item.product.stock_quantity - item.quantity
          })
          .eq('id', item.product.id);

        if (stockError) throw stockError;

        // Create stock movement record
        await supabase
          .from('stock_movements')
          .insert({
            product_id: item.product.id,
            movement_type: 'sale',
            quantity: -item.quantity,
            reference_id: sale.id,
            reference_type: 'cash_sale',
            created_by: user?.id,
            notes: `ขายเงินสด - ใบเสร็จ ${sale.receipt_number}`
          });
      }

      return sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cash-sales'] });
      queryClient.invalidateQueries({ queryKey: ['products-for-sale'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({
        title: "บันทึกการขายสำเร็จ",
        description: "รายการขายถูกบันทึกเข้าระบบแล้ว",
      });
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการขายได้",
        variant: "destructive",
      });
    },
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock_quantity) {
        updateCartItemQuantity(product.id, existingItem.quantity + 1);
      } else {
        toast({
          title: "สต็อกไม่เพียงพอ",
          description: "จำนวนสินค้าในสต็อกไม่เพียงพอ",
          variant: "destructive",
        });
      }
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        total: product.price
      }]);
    }
  };

  const updateCartItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const product = products?.find(p => p.id === productId);
        if (product && newQuantity > product.stock_quantity) {
          toast({
            title: "สต็อกไม่เพียงพอ",
            description: "จำนวนสินค้าในสต็อกไม่เพียงพอ",
            variant: "destructive",
          });
          return item;
        }
        return {
          ...item,
          quantity: newQuantity,
          total: item.product.price * newQuantity
        };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() - discount + tax;
  };

  const resetForm = () => {
    setCart([]);
    setSelectedCustomer("");
    setPaymentMethod("cash");
    setDiscount(0);
    setTax(0);
    setIsDialogOpen(false);
  };

  const handleSubmit = () => {
    if (cart.length === 0) {
      toast({
        title: "ไม่มีสินค้าในตะกร้า",
        description: "กรุณาเพิ่มสินค้าก่อนทำการขาย",
        variant: "destructive",
      });
      return;
    }

    createSaleMutation.mutate({});
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">การขายเงินสด</h1>
          <p className="text-gray-600">ระบบขายหน้าร้าน</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <ShoppingCart className="mr-2 h-4 w-4" />
              ขายสินค้าใหม่
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>ขายสินค้าเงินสด</DialogTitle>
              <DialogDescription>
                เลือกสินค้าและจำนวนที่ต้องการขาย
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Product Selection */}
              <div>
                <h3 className="font-semibold mb-4">เลือกสินค้า</h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {products?.map((product) => (
                    <Card key={product.id} className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-gray-600">
                            ราคา: ฿{product.price.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            สต็อก: {product.stock_quantity}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addToCart(product)}
                          disabled={product.stock_quantity === 0}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Cart */}
              <div>
                <h3 className="font-semibold mb-4">ตะกร้าสินค้า</h3>
                
                <div className="space-y-4 mb-4">
                  <div>
                    <Label>ลูกค้า (ไม่บังคับ)</Label>
                    <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกลูกค้า" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers?.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name} ({customer.phone})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>วิธีการชำระเงิน</Label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">เงินสด</SelectItem>
                        <SelectItem value="credit_card">บัตรเครดิต</SelectItem>
                        <SelectItem value="bank_transfer">โอนธนาคาร</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Cart Items */}
                <div className="max-h-64 overflow-y-auto border rounded p-3 mb-4">
                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">ไม่มีสินค้าในตะกร้า</p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between py-2 border-b">
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-600">
                            ฿{item.product.price.toLocaleString()} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.product.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="w-20 text-right">
                          ฿{item.total.toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Summary */}
                <div className="space-y-2 p-3 bg-gray-50 rounded">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="discount">ส่วนลด (บาท)</Label>
                      <Input
                        id="discount"
                        type="number"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tax">ภาษี (บาท)</Label>
                      <Input
                        id="tax"
                        type="number"
                        value={tax}
                        onChange={(e) => setTax(Number(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between">
                      <span>ยอดรวม:</span>
                      <span>฿{calculateSubtotal().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ส่วนลด:</span>
                      <span>-฿{discount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ภาษี:</span>
                      <span>+฿{tax.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>ยอดสุทธิ:</span>
                      <span>฿{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button className="flex-1" onClick={handleSubmit}>
                    บันทึกการขาย
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    ยกเลิก
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sales History */}
      <Card>
        <CardHeader>
          <CardTitle>ประวัติการขาย</CardTitle>
          <CardDescription>รายการขายเงินสดที่ผ่านมา</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>กำลังโหลด...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลขที่ใบเสร็จ</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>ยอดรวม</TableHead>
                  <TableHead>วิธีชำระ</TableHead>
                  <TableHead>วันที่</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales?.map((sale: any) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      {sale.receipt_number || '-'}
                    </TableCell>
                    <TableCell>
                      {sale.customers?.name || 'ลูกค้าทั่วไป'}
                    </TableCell>
                    <TableCell>
                      ฿{Number(sale.total_amount).toLocaleString()}
                    </TableCell>
                    <TableCell>{sale.payment_method}</TableCell>
                    <TableCell>
                      {new Date(sale.sale_date).toLocaleDateString('th-TH')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CashSales;
