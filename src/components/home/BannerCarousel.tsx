import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
interface Banner {
  id: string;
  image_url: string;
  title: string | null;
  subtitle: string | null;
  button_text: string;
  button_link: string;
}
export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchBanners = async () => {
      const {
        data,
        error
      } = await supabase.from("banners").select("*").eq("is_active", true).order("sort_order", {
        ascending: true
      });
      if (error) {
        console.error("Error fetching banners:", error);
      } else if (data && data.length > 0) {
        setBanners(data);
      }
      setLoading(false);
    };
    fetchBanners();
  }, []);

  // Auto-slide effect
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);
  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % banners.length);
  }, [banners.length]);

  // Show default hero if no banners
  if (loading || banners.length === 0) {
    return <DefaultHero />;
  }
  const currentBanner = banners[currentIndex];
  return <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-foreground">
      {/* Banner Images */}
      <AnimatePresence mode="wait">
        <motion.div key={currentBanner.id} initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 0.7
      }} className="absolute inset-0">
          <img src={currentBanner.image_url} alt={currentBanner.title || "Banner"} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50" />
        </motion.div>
      </AnimatePresence>

      {/* Gold Accent Lines */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-[0.3em]">
              {SITE_TAGLINE}
            </span>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div key={currentBanner.id + "-content"} initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: -20
          }} transition={{
            duration: 0.5
          }}>
              <h1 className="font-serif text-5xl md:text-7xl font-medium text-white mb-6 leading-tight">
                {currentBanner.title || "Discover Your"}
                <span className="text-gradient block mt-2">
                  {currentBanner.subtitle || "Signature Scent"}
                </span>
              </h1>
            </motion.div>
          </AnimatePresence>

          <motion.p initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="text-lg text-white/70 mb-8 max-w-lg">Your Trust Is Our Identity</motion.p>

          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.3
        }} className="flex flex-col sm:flex-row gap-4">
            <Link to={currentBanner.button_link || "/products"}>
              <Button size="lg" className="btn-gold px-8 py-6 text-base group">
                {currentBanner.button_text || "Shop Now"}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="px-8 py-6 text-base border-white/30 text-white hover:bg-white/10 hover:text-white">
                Our Story
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && <>
          <button onClick={goToPrevious} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors" aria-label="Previous slide">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors" aria-label="Next slide">
            <ChevronRight className="h-6 w-6" />
          </button>
        </>}

      {/* Dots Indicator */}
      {banners.length > 1 && <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {banners.map((_, index) => <button key={index} onClick={() => goToSlide(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? "bg-primary w-8" : "bg-white/40 hover:bg-white/60"}`} aria-label={`Go to slide ${index + 1}`} />)}
        </div>}

      {/* Floating Gold Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => <motion.div key={i} className="absolute w-2 h-2 bg-primary/40 rounded-full" style={{
        left: `${15 + i * 15}%`,
        top: `${20 + i % 3 * 25}%`
      }} animate={{
        y: [0, -20, 0],
        opacity: [0.4, 0.8, 0.4]
      }} transition={{
        duration: 3 + i * 0.5,
        repeat: Infinity,
        delay: i * 0.3
      }} />)}
      </div>
    </section>;
}

// Default hero when no banners are configured
function DefaultHero() {
  return <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-foreground">
      <div className="absolute inset-0" style={{
      backgroundImage: `url("https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=2048")`,
      backgroundSize: "cover",
      backgroundPosition: "center"
    }} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/80 to-black/70" />
      
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="flex items-center gap-2 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-[0.3em]">
              {SITE_TAGLINE}
            </span>
          </motion.div>

          <motion.h1 initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.1
        }} className="font-serif text-5xl md:text-7xl font-medium text-white mb-6 leading-tight">
            Discover Your
            <span className="text-gradient block mt-2">Signature Scent</span>
          </motion.h1>

          <motion.p initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="text-lg text-white/70 mb-8 max-w-lg">
            Explore our curated collection of premium perfumes, crafted to evoke emotions and create lasting impressions.
          </motion.p>

          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6,
          delay: 0.3
        }} className="flex flex-col sm:flex-row gap-4">
            <Link to="/products">
              <Button size="lg" className="btn-gold px-8 py-6 text-base group">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="outline" size="lg" className="px-8 py-6 text-base border-white/30 text-white hover:bg-white/10 hover:text-white">
                Our Story
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <motion.div initial={{
      opacity: 0,
      scale: 0.8,
      x: 100
    }} animate={{
      opacity: 1,
      scale: 1,
      x: 0
    }} transition={{
      duration: 1,
      delay: 0.5
    }} className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
        <div className="relative w-[500px] h-[600px]">
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-black/80 z-10" />
          <img src="https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600" alt="Luxury Perfume" className="w-full h-full object-cover" />
          <div className="absolute inset-4 border border-primary/30 pointer-events-none" />
        </div>
      </motion.div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => <motion.div key={i} className="absolute w-2 h-2 bg-primary/40 rounded-full" style={{
        left: `${15 + i * 15}%`,
        top: `${20 + i % 3 * 25}%`
      }} animate={{
        y: [0, -20, 0],
        opacity: [0.4, 0.8, 0.4]
      }} transition={{
        duration: 3 + i * 0.5,
        repeat: Infinity,
        delay: i * 0.3
      }} />)}
      </div>
    </section>;
}