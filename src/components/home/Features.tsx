import { motion } from "framer-motion";
import { Sparkles, Truck, Shield, HeartHandshake } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Premium Quality",
    description: "Only the finest ingredients sourced from around the world.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Quick and secure delivery across Bangladesh.",
  },
  {
    icon: Shield,
    title: "100% Authentic",
    description: "Every product is guaranteed genuine and original.",
  },
  {
    icon: HeartHandshake,
    title: "Customer Care",
    description: "Dedicated support to help you find your perfect scent.",
  },
];

export function Features() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
