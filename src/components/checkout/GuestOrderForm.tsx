import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CheckCircle2, Package, Banknote, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, PAYMENT_METHOD_LABELS, PaymentMethod } from "@/lib/constants";
import { toast } from "sonner";
import type { Product } from "@/types";
import { motion } from "framer-motion";

interface GuestOrderFormProps {
  product: Product;
  quantity: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BKASH_NUMBER = "01996640576";
const NAGAD_NUMBER = "01629924139";

export function GuestOrderForm({ product, quantity, open, onOpenChange }: GuestOrderFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: "",
    senderNumber: "",
    transactionId: "",
  });

  const totalPrice = product.price * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Basic phone validation
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(form.phone.replace(/\s/g, ""))) {
      toast.error("Please enter a valid Bangladeshi phone number");
      return;
    }

    // Validate mobile payment fields
    if ((paymentMethod === "bkash" || paymentMethod === "nagad") && 
        (!form.senderNumber.trim() || !form.transactionId.trim())) {
      toast.error("Please enter sender number and transaction ID");
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        user_id: null, // Guest order - no user
        is_guest: true,
        guest_name: form.name.trim(),
        guest_phone: form.phone.trim(),
        items: [
          {
            product_id: product.id,
            product_name: product.name,
            quantity: quantity,
            price: product.price,
          },
        ],
        total: totalPrice,
        shipping_address: form.address.trim(),
        shipping_city: form.city.trim(),
        shipping_phone: form.phone.trim(),
        notes: paymentMethod !== "cod" 
          ? `${form.notes.trim() ? form.notes.trim() + " | " : ""}Payment: ${PAYMENT_METHOD_LABELS[paymentMethod]} | Sender: ${form.senderNumber} | TxnID: ${form.transactionId}`
          : form.notes.trim() || null,
        payment_method: paymentMethod,
        status: "pending",
      };

      const { error } = await supabase.from("orders").insert(orderData);

      if (error) throw error;

      setSuccess(true);
      toast.success("Order placed successfully!");
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to place order. Please try again.");
    }

    setLoading(false);
  };

  const handleClose = () => {
    if (success) {
      setSuccess(false);
      setForm({ name: "", phone: "", address: "", city: "", notes: "", senderNumber: "", transactionId: "" });
      setPaymentMethod("cod");
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-serif text-2xl font-medium text-foreground mb-2">
              Order Confirmed!
            </h2>
            <p className="text-muted-foreground mb-6">
              Thank you for your order. We will contact you soon at {form.phone}.
            </p>
            <div className="bg-secondary/50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="text-left">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {quantity}</p>
                  <p className="text-primary font-semibold">{formatPrice(totalPrice)}</p>
                </div>
              </div>
            </div>
            <Button onClick={handleClose} className="btn-gold w-full">
              Continue Shopping
            </Button>
          </motion.div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Order Confirm
              </DialogTitle>
            </DialogHeader>

            {/* Product Summary */}
            <div className="bg-secondary/30 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={product.image_url || "/placeholder.svg"}
                  alt={product.name}
                  className="w-16 h-16 rounded object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">Quantity: {quantity}</p>
                </div>
                <p className="text-lg font-semibold text-primary">{formatPrice(totalPrice)}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guest-name">Full Name *</Label>
                <Input
                  id="guest-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest-phone">Phone Number *</Label>
                <Input
                  id="guest-phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest-city">City *</Label>
                <Input
                  id="guest-city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="e.g., Dhaka"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest-address">Full Address *</Label>
                <Textarea
                  id="guest-address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="House/Flat, Road, Area"
                  rows={2}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guest-notes">Order Notes (Optional)</Label>
                <Textarea
                  id="guest-notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any special instructions..."
                  rows={2}
                />
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Payment Method *</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                  className="space-y-3"
                >
                  {/* Cash on Delivery */}
                  <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                    paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border"
                  }`}>
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Banknote className="h-5 w-5 text-green-600" />
                      <span>Cash on Delivery</span>
                    </Label>
                  </div>

                  {/* bKash */}
                  <div className={`p-3 rounded-lg border transition-colors ${
                    paymentMethod === "bkash" ? "border-[#E2136E] bg-[#E2136E]/5" : "border-border"
                  }`}>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="bkash" id="bkash" />
                      <Label htmlFor="bkash" className="flex items-center gap-2 cursor-pointer flex-1">
                        <div className="w-5 h-5 bg-[#E2136E] rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">b</span>
                        </div>
                        <span>bKash</span>
                      </Label>
                    </div>
                    {paymentMethod === "bkash" && (
                      <div className="mt-3 pl-8 space-y-3">
                        <div className="bg-[#E2136E]/10 p-3 rounded-lg text-sm">
                          <p className="font-medium text-[#E2136E]">Send Money to:</p>
                          <p className="text-lg font-bold text-foreground">{BKASH_NUMBER}</p>
                          <p className="text-muted-foreground text-xs mt-1">
                            Send {formatPrice(totalPrice)} and enter details below
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Input
                            placeholder="Your bKash Number"
                            value={form.senderNumber}
                            onChange={(e) => setForm({ ...form, senderNumber: e.target.value })}
                          />
                          <Input
                            placeholder="Transaction ID"
                            value={form.transactionId}
                            onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Nagad */}
                  <div className={`p-3 rounded-lg border transition-colors ${
                    paymentMethod === "nagad" ? "border-[#F6A623] bg-[#F6A623]/5" : "border-border"
                  }`}>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="nagad" id="nagad" />
                      <Label htmlFor="nagad" className="flex items-center gap-2 cursor-pointer flex-1">
                        <div className="w-5 h-5 bg-[#F6A623] rounded flex items-center justify-center">
                          <span className="text-white text-xs font-bold">N</span>
                        </div>
                        <span>Nagad</span>
                      </Label>
                    </div>
                    {paymentMethod === "nagad" && (
                      <div className="mt-3 pl-8 space-y-3">
                        <div className="bg-[#F6A623]/10 p-3 rounded-lg text-sm">
                          <p className="font-medium text-[#F6A623]">Send Money to:</p>
                          <p className="text-lg font-bold text-foreground">{NAGAD_NUMBER}</p>
                          <p className="text-muted-foreground text-xs mt-1">
                            Send {formatPrice(totalPrice)} and enter details below
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Input
                            placeholder="Your Nagad Number"
                            value={form.senderNumber}
                            onChange={(e) => setForm({ ...form, senderNumber: e.target.value })}
                          />
                          <Input
                            placeholder="Transaction ID"
                            value={form.transactionId}
                            onChange={(e) => setForm({ ...form, transactionId: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </RadioGroup>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-primary">Free</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full btn-gold py-6 text-base"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Order - {formatPrice(totalPrice)}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
