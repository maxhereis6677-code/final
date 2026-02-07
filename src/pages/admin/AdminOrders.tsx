import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Search, Eye, MapPin, Phone, User, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, ORDER_STATUS, PAYMENT_METHOD_LABELS, PaymentMethod } from "@/lib/constants";
import type { Order } from "@/types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
    } else {
      setOrders(data as unknown as Order[]);
    }
    setLoading(false);
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;
      
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: status as Order["status"] } : o))
      );
      toast.success("Order status updated");
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case ORDER_STATUS.PROCESSING:
        return "bg-blue-100 text-blue-800";
      case ORDER_STATUS.DELIVERED:
        return "bg-green-100 text-green-800";
      case ORDER_STATUS.CANCELLED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate order total from items if total is 0
  const getOrderTotal = (order: Order) => {
    if (order.total > 0) return order.total;
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.guest_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.guest_phone?.includes(searchQuery));
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-medium text-foreground">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={ORDER_STATUS.PENDING}>Pending</SelectItem>
              <SelectItem value={ORDER_STATUS.PROCESSING}>Processing</SelectItem>
              <SelectItem value={ORDER_STATUS.DELIVERED}>Delivered</SelectItem>
              <SelectItem value={ORDER_STATUS.CANCELLED}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Order ID</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Customer</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Total</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Payment</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-secondary/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium">{order.guest_name || "Registered User"}</p>
                          <p className="text-muted-foreground text-xs">{order.guest_phone || order.shipping_phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {formatPrice(getOrderTotal(order))}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          order.payment_method === 'bkash' 
                            ? 'bg-[#E2136E]/10 text-[#E2136E]' 
                            : order.payment_method === 'nagad'
                            ? 'bg-[#F6A623]/10 text-[#F6A623]'
                            : 'bg-secondary text-foreground'
                        }`}>
                          {PAYMENT_METHOD_LABELS[order.payment_method as PaymentMethod] || 'COD'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <Badge className={`${getStatusColor(order.status)} capitalize`}>
                              {order.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={ORDER_STATUS.PENDING}>Pending</SelectItem>
                            <SelectItem value={ORDER_STATUS.PROCESSING}>Processing</SelectItem>
                            <SelectItem value={ORDER_STATUS.DELIVERED}>Delivered</SelectItem>
                            <SelectItem value={ORDER_STATUS.CANCELLED}>Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">
              Order #{selectedOrder?.id.slice(0, 8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Customer Details
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Name</p>
                    <p className="font-medium">{selectedOrder.guest_name || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedOrder.guest_phone || selectedOrder.shipping_phone}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-secondary/30 rounded-lg p-4 space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Shipping Address
                </h3>
                <div className="text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{selectedOrder.shipping_phone}</span>
                  </div>
                  <div>
                    <p className="text-muted-foreground">City</p>
                    <p className="font-medium">{selectedOrder.shipping_city}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Full Address</p>
                    <p className="font-medium">{selectedOrder.shipping_address}</p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <h3 className="font-medium">Order Items</h3>
                <div className="divide-y divide-border">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="py-2 flex justify-between">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(getOrderTotal(selectedOrder))}</span>
                </div>
              </div>

              {/* Payment & Notes */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    selectedOrder.payment_method === 'bkash' 
                      ? 'bg-[#E2136E]/10 text-[#E2136E]' 
                      : selectedOrder.payment_method === 'nagad'
                      ? 'bg-[#F6A623]/10 text-[#F6A623]'
                      : 'bg-secondary text-foreground'
                  }`}>
                    {PAYMENT_METHOD_LABELS[selectedOrder.payment_method as PaymentMethod] || 'COD'}
                  </span>
                </div>
                {selectedOrder.notes && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4" />
                      Notes
                    </p>
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
