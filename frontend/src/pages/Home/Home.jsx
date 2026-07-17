import { motion } from 'framer-motion';
import HeroSection from './sections/HeroSection.jsx';
import FeaturedCollections from './sections/FeaturedCollections.jsx';
import BestSellers from './sections/BestSellers.jsx';
import WhyChooseUs from './sections/WhyChooseUs.jsx';
import NewArrivals from './sections/NewArrivals.jsx';
import InstagramGallery from './sections/InstagramGallery.jsx';

export default function Home() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <HeroSection />
      <FeaturedCollections />
      <BestSellers />
      <WhyChooseUs />
      <NewArrivals />
      <InstagramGallery />
    </motion.div>
  );
}
