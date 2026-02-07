import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ShoppingCart, Minus, Plus, ArrowLeft, Loader2, Package, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Rating } from "@/components/ui/rating";
import { GuestOrderForm } from "@/components/checkout/GuestOrderForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProductReviews } from "@/components/products/ProductReviews";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        toast.error("Product not found");
        navigate("/products");
      } else {
        setProduct(data as Product);
      }
      setLoading(false);
    };

    const fetchReviewCount = async () => {
      if (!id) return;
      const { count } = await supabase
        .from("reviews")
        .select("id", { count: "exact", head: true })
        .eq("product_id", id);
      setReviewCount(count || 0);
    };

    fetchProduct();
    fetchReviewCount();
  }, [id, navigate]);

  const handleAddToCart = () => {
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }
    
    if (product) {
      addToCart(product, quantity);
      toast.success(`${product.name} added to cart`);
    }
  };

  const handleOrderConfirm = () => {
    setOrderFormOpen(true);
  };

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
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

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-serif">Product not found</h1>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative aspect-square overflow-hidden rounded-lg bg-secondary/30"
          >
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.featured && (
              <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-full">
                Featured
              </span>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <span className="text-sm text-muted-foreground uppercase tracking-wider">
                {product.category}
              </span>
              <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground mt-2">
                {product.name}
              </h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-2xl font-semibold text-primary">
                {formatPrice(product.price)}
              </p>
              {product.discount_percentage && product.discount_percentage > 0 && product.original_price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </span>
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded font-medium text-sm">
                    -{product.discount_percentage}% OFF
                  </span>
                </>
              )}
              {product.rating > 0 && (
                <Rating value={product.rating} size="md" showValue />
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              {product.stock > 0 ? (
                <span className="text-sm text-primary bg-primary/10 px-3 py-1 rounded-full">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-sm text-destructive bg-destructive/10 px-3 py-1 rounded-full">
                  Out of Stock
                </span>
              )}
              
              {/* Reviews Link */}
              <button
                onClick={scrollToReviews}
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Reviews ({reviewCount})
              </button>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">Quantity:</span>
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-secondary transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-4 py-2 min-w-[50px] text-center font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 hover:bg-secondary transition-colors"
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Primary Button - Order Confirm (No login required) */}
              <Button
                onClick={handleOrderConfirm}
                disabled={product.stock === 0}
                size="lg"
                className="w-full btn-gold py-7 text-lg font-semibold"
              >
                <Package className="h-5 w-5 mr-2" />
                Order Confirm - {formatPrice(product.price * quantity)}
              </Button>

              {/* Secondary Button - Add to Cart (Login required) */}
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                variant="outline"
                size="lg"
                className="w-full py-6 text-base border-primary/30 hover:bg-primary/10"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
            </div>

            {/* Additional Info */}
            <div className="border-t border-border pt-6 mt-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{product.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">Cash on Delivery</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-medium">2-5 Business Days</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reviews Section */}
        <div ref={reviewsRef} className="mt-16 pt-8 border-t border-border">
          <ProductReviews productId={product.id} />
        </div>
      </div>

      {/* Guest Order Form */}
      {product && (
        <GuestOrderForm
          product={product}
          quantity={quantity}
          open={orderFormOpen}
          onOpenChange={setOrderFormOpen}
        />
      )}

      {/* Login Prompt Dialog */}
      <Dialog open={loginPromptOpen} onOpenChange={setLoginPromptOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl text-center">Login Required</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <ShoppingCart className="h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-muted-foreground mb-6">
              Please login to add items to your cart.
            </p>
            <div className="space-y-3">
              <Button
                onClick={() => navigate("/login")}
                className="w-full btn-gold"
              >
                Login
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setLoginPromptOpen(false);
                  setOrderFormOpen(true);
                }}
                className="w-full"
              >
                Order Without Login
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ProductDetail;
