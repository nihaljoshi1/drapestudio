import Hero from '../../components/home/Hero'
import Categories from '../../components/home/Categories'
import FeaturedProducts from '../../components/home/FeaturedProducts'
import BrandStory from '../../components/home/BrandStory'
import Testimonials from '../../components/home/Testimonials'
import UGCGrid from '../../components/home/UGCGrid'
import Newsletter from '../../components/home/Newsletter'

export default function Home() {
  return (
    <div>
      <Hero />
      <Categories />
      <FeaturedProducts />
      <BrandStory />
      <Testimonials />
      <UGCGrid />
      <Newsletter />
    </div>
  )
}