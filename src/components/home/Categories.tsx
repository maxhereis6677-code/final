import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "For Her",
    image: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=600",
    description: "Elegant and feminine fragrances",
  },
  {
    name: "For Him",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600",
    description: "Bold and masculine scents",
  },
  {
    name: "Luxury",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600",
    description: "Exclusive premium collection",
  },
];

export function Categories() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-[0.3em]">
            Browse By
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground mt-2">
            Categories
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="group block relative aspect-[3/4] overflow-hidden rounded-lg"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="font-serif text-2xl font-medium mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-white/70 mb-3">
                    {category.description}
                  </p>
                  <span className="inline-flex items-center text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    Shop Now
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
