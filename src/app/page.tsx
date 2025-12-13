import Hero from '@/components/home/Hero'
import Services from '@/components/home/Services'
//import CTASection from '@/components/home/CTASection'

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Services />
      {/* <CTASection /> */}
    </div>
  )
}