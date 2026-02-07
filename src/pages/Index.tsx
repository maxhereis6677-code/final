import { MainLayout } from "@/components/layout/MainLayout";
import { BannerCarousel } from "@/components/home/BannerCarousel";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Categories } from "@/components/home/Categories";
import { Features } from "@/components/home/Features";

const Index = () => {
  return (
    <MainLayout>
      <BannerCarousel />
      <Features />
      <FeaturedProducts />
      <Categories />
    </MainLayout>
  );
};

export default Index;
