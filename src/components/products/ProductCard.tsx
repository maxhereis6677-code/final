import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Package } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/constants";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/products/${product.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/products/${product.id}`} className="block group">
        <div className="product-card">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden bg-secondary/30">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            {product.featured && (
              <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                Featured
              </span>
            )}
            {product.stock < 10 && product.stock > 0 && (
              <span className="absolute top-3 right-3 bg-destructive/90 text-destructive-foreground text-xs font-medium px-3 py-1 rounded-full">
                Low Stock
              </span>
            )}
            {product.stock === 0 && (
              <span className="absolute top-3 right-3 bg-muted text-muted-foreground text-xs font-medium px-3 py-1 rounded-full">
                Out of Stock
              </span>
            )}
            
            {/* Quick Buy Button on Hover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <Button
                onClick={handleBuyProduct}
                disabled={product.stock === 0}
                className="w-full btn-gold"
              >
                <Package className="h-4 w-4 mr-2" />
                Buy Product
              </Button>
            </motion.div>
          </div>

          {/* Details */}
          <div className="p-4 space-y-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {product.category}
            </span>
            <h3 className="font-serif text-lg font-medium text-foreground group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            
            {/* Rating */}
            <Rating value={product.rating || 0} size="sm" showValue />
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-primary text-lg">
                {formatPrice(product.price)}
              </p>
              {product.discount_percentage && product.discount_percentage > 0 && product.original_price && (
                <>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </span>
                  <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                    -{product.discount_percentage}%
                  </span>
                </>
              )}
            </div>

            {/* Buy Product Button - Always visible */}
            <Button
              onClick={handleBuyProduct}
              disabled={product.stock === 0}
              className="w-full btn-gold mt-2"
              size="sm"
            >
              <Package className="h-4 w-4 mr-2" />
              Buy Product
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
