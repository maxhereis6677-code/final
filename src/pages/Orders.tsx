import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Package, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { formatPrice, ORDER_STATUS, PAYMENT_METHOD_LABELS, PaymentMethod } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import type { Order } from "@/types";
import { Badge } from "@/components/ui/badge";

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login?redirect=/orders");
      return;
    }

    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
      } else {
        setOrders(data as unknown as Order[]);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [user, navigate]);

  // Calculate order total from items if total is 0
  const getOrderTotal = (order: Order) => {
    if (order.total > 0) return order.total;
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case ORDER_STATUS.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case ORDER_STATUS.PROCESSING:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case ORDER_STATUS.DELIVERED:
        return "bg-green-100 text-green-800 border-green-200";
      case ORDER_STATUS.CANCELLED:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (orders.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md mx-auto"
          >
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
            <h1 className="font-serif text-3xl font-medium text-foreground mb-4">
              No Orders Yet
            </h1>
            <p className="text-muted-foreground">
              Start shopping to see your orders here.
            </p>
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
          My Orders
        </motion.h1>

        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-lg border border-border p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Placed on {new Date(order.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <Badge className={`${getStatusColor(order.status)} capitalize`}>
                  {order.status}
                </Badge>
              </div>

              <div className="space-y-3 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-foreground">
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="text-muted-foreground">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Shipping to: {order.shipping_city}</p>
                  <p>Payment: <span className="font-medium text-foreground">{PAYMENT_METHOD_LABELS[order.payment_method as PaymentMethod] || 'Cash on Delivery'}</span></p>
                </div>
                <p className="font-semibold text-primary text-lg">
                  Total: {formatPrice(getOrderTotal(order))}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Orders;
