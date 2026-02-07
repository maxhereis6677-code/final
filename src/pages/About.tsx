import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

const About = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-sm font-medium text-primary uppercase tracking-[0.3em]">
            Our Story
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-medium text-foreground mt-2 mb-6">
            About {SITE_NAME}
          </h1>
          <p className="text-lg text-muted-foreground">
            {SITE_TAGLINE}. We believe that every person deserves to find their perfect scent — 
            one that tells their unique story.
          </p>
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img
              src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=800"
              alt="Perfume Collection"
              className="rounded-lg shadow-elegant w-full"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-6"
          >
            <h2 className="font-serif text-3xl font-medium text-foreground">
              Crafting Memories Through Scent
            </h2>
            <p className="text-muted-foreground">
              Founded with a passion for the art of perfumery, RELIEVE brings you an 
              exquisite collection of fragrances from around the world. We carefully 
              curate each perfume to ensure it meets our high standards of quality 
              and elegance.
            </p>
            <p className="text-muted-foreground">
              Our mission is simple: to help you discover fragrances that become 
              an extension of your personality. Whether you're looking for a bold 
              statement piece or a subtle everyday scent, we have something special 
              waiting for you.
            </p>
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-secondary/30 rounded-2xl p-8 md:p-12"
        >
          <h2 className="font-serif text-3xl font-medium text-foreground text-center mb-8">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="font-serif text-xl font-medium text-foreground mb-3">
                Authenticity
              </h3>
              <p className="text-muted-foreground text-sm">
                Every fragrance we offer is 100% genuine, sourced directly from 
                trusted suppliers worldwide.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-serif text-xl font-medium text-foreground mb-3">
                Quality
              </h3>
              <p className="text-muted-foreground text-sm">
                We never compromise on quality. Each perfume is carefully selected 
                for its craftsmanship and longevity.
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-serif text-xl font-medium text-foreground mb-3">
                Customer First
              </h3>
              <p className="text-muted-foreground text-sm">
                Your satisfaction is our priority. We're here to help you find 
                the perfect scent for every occasion.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default About;
