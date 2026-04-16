import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import CategoryTiles from "@/components/CategoryTiles";
import FeaturedGrid from "@/components/FeaturedGrid";
import NewArrivals from "@/components/NewArrivals";
import ShopBySport from "@/components/ShopBySport";
import SeasonalCampaign from "@/components/SeasonalCampaign";
import Spotlight from "@/components/Spotlight";
import GlassesSection from "@/components/GlassesSection";
import MerchandiseSection from "@/components/MerchandiseSection";
import UpcomingDropsBanner from "@/components/UpcomingDropsBanner";
import AllProductsSection from "@/components/AllProductsSection";
import RecentlyViewedSection from "@/components/RecentlyViewedSection";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import ScrollReveal from "@/components/ScrollReveal";
import NewsletterModal from "@/components/NewsletterModal";
import ThisWeeksVibe from "@/components/ThisWeeksVibe";
import FeaturedArtist from "@/components/FeaturedArtist";
import ShopByVibe from "@/components/ShopByVibe";
import CulturePreview from "@/components/CulturePreview";
import { UpcomingEventsSection } from "@/components/HomepageSections";
import useSEO from "@/hooks/useSEO";

const Index = () => {
  useSEO({
    title: "Style n Tunes | Where Fashion Meets Music — Streetwear Kenya",
    description: "Kenya's boldest fashion + music culture platform. Shop sneakers, drops, artist collabs & more. Where style meets rhythm.",
    canonical: "https://stylentunes.com/",
  });
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartSidebar />
      <NewsletterModal />
      <main>
        <HeroBanner />
        <ScrollReveal>
          <ThisWeeksVibe />
        </ScrollReveal>
        <ScrollReveal>
          <RecentlyViewedSection />
        </ScrollReveal>
        <ScrollReveal>
          <CategoryTiles />
        </ScrollReveal>
        <ScrollReveal>
          <UpcomingDropsBanner />
        </ScrollReveal>
        <ScrollReveal>
          <FeaturedGrid />
        </ScrollReveal>
        <ScrollReveal>
          <ShopByVibe />
        </ScrollReveal>
        <ScrollReveal>
          <AllProductsSection />
        </ScrollReveal>
        <ScrollReveal>
          <NewArrivals />
        </ScrollReveal>
        <ScrollReveal>
          <FeaturedArtist />
        </ScrollReveal>
        <ScrollReveal>
          <ShopBySport />
        </ScrollReveal>
        <SeasonalCampaign />
        <ScrollReveal>
          <CulturePreview />
        </ScrollReveal>
        <ScrollReveal>
          <UpcomingEventsSection />
        </ScrollReveal>
        <ScrollReveal>
          <Spotlight />
        </ScrollReveal>
        <ScrollReveal>
          <MerchandiseSection />
        </ScrollReveal>
        <ScrollReveal>
          <GlassesSection />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
