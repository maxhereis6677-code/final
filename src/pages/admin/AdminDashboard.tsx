import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Loader2, RotateCcw, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, ORDER_STATUS } from "@/lib/constants";
import type { Order, AdminStats } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [deliveredOrders, setDeliveredOrders] = useState<Order[]>([]);

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact" }),
        supabase.from("orders").select("*"),
        supabase.from("users").select("id", { count: "exact" }),
      ]);

      const orders = (ordersRes.data || []) as unknown as Order[];
      const totalRevenue = orders
        .filter((o) => o.status !== ORDER_STATUS.CANCELLED)
        .reduce((sum, o) => sum + o.total, 0);
      const pendingOrders = orders.filter((o) => o.status === ORDER_STATUS.PENDING).length;
      const delivered = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED);

      setDeliveredOrders(delivered);
      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: orders.length,
        totalUsers: usersRes.count || 0,
        totalRevenue,
        pendingOrders,
        recentOrders: orders.slice(0, 5),
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleResetRevenue = async () => {
    setResetting(true);
    try {
      // Reset revenue by updating all non-cancelled orders to have total = 0
      const { error } = await supabase
        .from("orders")
        .update({ total: 0 })
        .neq("status", ORDER_STATUS.CANCELLED);

      if (error) throw error;

      toast.success("Total revenue has been reset to ৳0");
      await fetchStats();
    } catch (error) {
      console.error("Error resetting revenue:", error);
      toast.error("Failed to reset revenue");
    }
    setResetting(false);
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

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    {
      label: "Total Revenue",
      value: formatPrice(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: "bg-green-500",
      showReset: true,
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: "bg-blue-500",
    },
    {
      label: "Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "bg-purple-500",
    },
    {
      label: "Customers",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-orange-500",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-medium text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to RELIEVE admin panel</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-lg border border-border p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`p-2 rounded-lg ${stat.color} text-white`}>
                  <stat.icon className="h-5 w-5" />
                </span>
                {stat.showReset ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                        disabled={resetting}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reset Total Revenue?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will reset all order totals to ৳0. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleResetRevenue}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Reset Revenue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                )}
              </div>
              <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Pending Orders Alert */}
        {stats?.pendingOrders && stats.pendingOrders > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3"
          >
            <ShoppingCart className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800">
              You have <span className="font-semibold">{stats.pendingOrders}</span> pending orders that need attention.
            </p>
          </motion.div>
        )}

        {/* Delivered Orders Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-lg border border-border"
        >
          <div className="p-6 border-b border-border flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h2 className="font-serif text-xl font-medium text-foreground">Delivered Orders</h2>
            <Badge className="bg-green-100 text-green-800">{deliveredOrders.length}</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Order ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Items</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {deliveredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {order.is_guest ? order.guest_name : "Registered User"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">{order.items.length} items</td>
                    <td className="px-6 py-4 text-sm font-medium text-green-600">{formatPrice(order.total)}</td>
                  </tr>
                ))}
                {deliveredOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No delivered orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-lg border border-border"
        >
          <div className="p-6 border-b border-border">
            <h2 className="font-serif text-xl font-medium text-foreground">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Order ID</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Items</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Total</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats?.recentOrders?.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">{order.items.length} items</td>
                    <td className="px-6 py-4 text-sm font-medium">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <Badge className={`${getStatusColor(order.status)} capitalize`}>
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
