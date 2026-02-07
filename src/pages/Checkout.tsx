import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, Banknote, Smartphone } from "lucide-react";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, PAYMENT_METHODS, PaymentMethod, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PAYMENT_METHODS.COD);
  
  const [form, setForm] = useState({
    address: "",
    city: "",
    phone: user?.phone || "",
    notes: "",
    bkashNumber: "",
    nagadNumber: "",
    transactionId: "",
  });

  if (!user) {
    navigate("/login?redirect=/checkout");
    return null;
  }

  if (items.length === 0 && !orderPlaced) {
    navigate("/cart");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate mobile payment details
    if (paymentMethod === PAYMENT_METHODS.BKASH && !form.bkashNumber) {
      toast.error("Please enter your bKash number");
      return;
    }
    if (paymentMethod === PAYMENT_METHODS.NAGAD && !form.nagadNumber) {
      toast.error("Please enter your Nagad number");
      return;
    }
    
    setLoading(true);

    try {
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product?.name || "",
        quantity: item.quantity,
        price: item.product?.price || 0,
      }));

      const paymentNotes = paymentMethod === PAYMENT_METHODS.BKASH 
        ? `bKash: ${form.bkashNumber}${form.transactionId ? `, TxnID: ${form.transactionId}` : ""}`
        : paymentMethod === PAYMENT_METHODS.NAGAD
        ? `Nagad: ${form.nagadNumber}${form.transactionId ? `, TxnID: ${form.transactionId}` : ""}`
        : "";

      const { data, error } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          items: orderItems,
          total: getCartTotal(),
          status: "pending",
          payment_method: paymentMethod,
          shipping_address: form.address,
          shipping_city: form.city,
          shipping_phone: form.phone,
          notes: [form.notes, paymentNotes].filter(Boolean).join(" | ") || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setOrderId(data.id);
      setOrderPlaced(true);
      clearCart();
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to place order");
    }

    setLoading(false);
  };

  if (orderPlaced) {
    return (
      <MainLayout>
        <div className="min-h-[70vh] flex items-center justify-center py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md px-4"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-serif text-3xl font-medium text-foreground mb-4">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground mb-4">
              Thank you for your order. We will process it shortly.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              Order ID: <span className="font-mono font-medium text-foreground">{orderId.slice(0, 8).toUpperCase()}</span>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Payment: <span className="font-medium text-foreground">{PAYMENT_METHOD_LABELS[paymentMethod]}</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => navigate("/orders")} className="btn-gold">
                View Orders
              </Button>
              <Button variant="outline" onClick={() => navigate("/products")}>
                Continue Shopping
              </Button>
            </div>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif text-4xl font-medium text-foreground mb-8"
        >
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="font-serif text-xl font-medium text-foreground mb-6">
                Shipping Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Dhaka, Chittagong"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="01700000000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={2}
                  />
                </div>

                {/* Payment Methods */}
                <div className="pt-4 border-t border-border space-y-4">
                  <h3 className="font-medium text-foreground">Payment Method</h3>
                  
                  {/* COD Option */}
                  <label
                    className={cn(
                      "flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                      paymentMethod === PAYMENT_METHODS.COD
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={PAYMENT_METHODS.COD}
                      checked={paymentMethod === PAYMENT_METHODS.COD}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="sr-only"
                    />
                    <Banknote className="h-6 w-6 text-primary mr-3" />
                    <div>
                      <span className="font-medium block">Cash on Delivery</span>
                      <span className="text-sm text-muted-foreground">Pay when you receive your order</span>
                    </div>
                  </label>

                  {/* bKash Option */}
                  <div>
                    <label
                      className={cn(
                        "flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                        paymentMethod === PAYMENT_METHODS.BKASH
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={PAYMENT_METHODS.BKASH}
                        checked={paymentMethod === PAYMENT_METHODS.BKASH}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="sr-only"
                      />
                      <div className="w-6 h-6 bg-[#E2136E] rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">b</span>
                      </div>
                      <div>
                        <span className="font-medium block">bKash</span>
                        <span className="text-sm text-muted-foreground">Pay via bKash mobile banking</span>
                      </div>
                    </label>
                    {paymentMethod === PAYMENT_METHODS.BKASH && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 ml-4 space-y-3"
                      >
                        <div className="p-3 bg-[#E2136E]/10 rounded-lg text-sm">
                          <p className="font-medium text-[#E2136E] mb-1">Send payment to:</p>
                          <p className="font-mono">01XXXXXXXXX</p>
                          <p className="text-muted-foreground mt-1">Amount: {formatPrice(getCartTotal())}</p>
                        </div>
                        <Input
                          placeholder="Your bKash Number"
                          value={form.bkashNumber}
                          onChange={(e) => setForm({ ...form, bkashNumber: e.target.value })}
                        />
                        <Input
                          placeholder="Transaction ID (optional)"
                          value={form.transactionId}
                          onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Nagad Option */}
                  <div>
                    <label
                      className={cn(
                        "flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all",
                        paymentMethod === PAYMENT_METHODS.NAGAD
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={PAYMENT_METHODS.NAGAD}
                        checked={paymentMethod === PAYMENT_METHODS.NAGAD}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="sr-only"
                      />
                      <div className="w-6 h-6 bg-[#F6A623] rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">N</span>
                      </div>
                      <div>
                        <span className="font-medium block">Nagad</span>
                        <span className="text-sm text-muted-foreground">Pay via Nagad mobile banking</span>
                      </div>
                    </label>
                    {paymentMethod === PAYMENT_METHODS.NAGAD && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3 ml-4 space-y-3"
                      >
                        <div className="p-3 bg-[#F6A623]/10 rounded-lg text-sm">
                          <p className="font-medium text-[#F6A623] mb-1">Send payment to:</p>
                          <p className="font-mono">01XXXXXXXXX</p>
                          <p className="text-muted-foreground mt-1">Amount: {formatPrice(getCartTotal())}</p>
                        </div>
                        <Input
                          placeholder="Your Nagad Number"
                          value={form.nagadNumber}
                          onChange={(e) => setForm({ ...form, nagadNumber: e.target.value })}
                        />
                        <Input
                          placeholder="Transaction ID (optional)"
                          value={form.transactionId}
                          onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                        />
                      </motion.div>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full btn-gold py-6 text-base mt-6">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Place Order - {formatPrice(getCartTotal())}
                </Button>
              </form>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-lg border border-border p-6 h-fit"
          >
            <h2 className="font-serif text-xl font-medium text-foreground mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.product?.image_url || "/placeholder.svg"}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{item.product?.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-sm">
                    {formatPrice((item.product?.price || 0) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(getCartTotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-primary">Free</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border">
                <span className="font-medium">Total</span>
                <span className="font-semibold text-lg text-primary">
                  {formatPrice(getCartTotal())}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;
