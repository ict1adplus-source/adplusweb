import { 
  Palette, 
  Globe, 
  Users, 
  Layout, 
  Video, 
  Share2,
  CheckCircle,
  Target,
  BarChart,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react'
import ServiceCard from '@/components/services/ServiceCard'

export default function ServicesPage() {
  const services = [
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Branding",
      description: "A brand is a result, it is a customer's gut feeling about a product, service or company. Your brand name and logo carry a big part of your entire business and gives you an identity.",
      features: [
        "Brand Strategy & Naming",
        "Logo Design",
        "Business Card Design",
        "T-shirt Design",
        "Product Design"
      ],
      quote: "A brand is a result, it is a customer's gut feeling about a product, service or company.",
      quoteAuthor: "Marty Neumeier",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Graphic Design",
      description: "Creativity is seeing what others see and thinking what no one else ever thought. Our creative team helps you to attract and present your messaging in a unique way.",
      features: [
        "Social Media Ad Designs",
        "Flyer Design",
        "Banner Design",
        "Outdoor Advert Design",
        "Packaging Design",
        "Newspaper Ads Design",
        "Info-graphics"
      ],
      quote: "Creativity is seeing what others see and thinking what no one else ever thought.",
      quoteAuthor: "Albert Einstein",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Web & Mobile App Design",
      description: "Great Web Design without functionality is like a sports car without an engine. We help you establish your digital presence with cutting-edge web and mobile solutions.",
      features: [
        "Website Design",
        "User Experience Design",
        "Web Development",
        "Search Engine Optimization",
        "Website Management",
        "Content Creation"
      ],
      quote: "Great Web Design without functionality is like a sports car without an engine.",
      quoteAuthor: "Paul Cookson",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Layout className="w-8 h-8" />,
      title: "Layout Design",
      description: "Words have meaning. Type has spirit. We create unique layouts for business correspondence and stationary that effectively communicate with your audience.",
      features: [
        "Stationary Design",
        "Brochures",
        "Magazine Layout",
        "Book Design",
        "Newsletters",
        "Catalogue Design",
        "Business Profile"
      ],
      quote: "Words have meaning. Type has spirit.",
      quoteAuthor: "Paula Scher",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: "Social Media Marketing",
      description: "Social media puts the 'public' into public relations and the 'market' into marketing. With 2 billion active users, we help you gather and interact with your audience.",
      features: [
        "Profile Creation",
        "Social Media Management",
        "Paid Advertising",
        "Content Creation",
        "Community Management",
        "Analytics & Reporting"
      ],
      quote: "Social media puts the 'public' into public relations and the 'market' into marketing.",
      quoteAuthor: "Chris Brogan",
      color: "from-pink-500 to-rose-500"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Motion Graphics",
      description: "Motion is one of the best ways to capture attention in marketing. It's your best tool for conveying longer messages and getting customers to act according to your request.",
      features: [
        "Scripting & Storyboarding",
        "2D Animation",
        "3D Animation",
        "Info-graphics Animation",
        "Video Editing",
        "Visual Effects"
      ],
      quote: "Stopping advertising to save money is like stopping your watch to save time.",
      quoteAuthor: "Henry Ford",
      color: "from-indigo-500 to-blue-500"
    }
  ];

  const benefits = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Targeted Solutions",
      description: "Custom strategies tailored to your specific business needs and goals"
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: "Measurable Results",
      description: "Transparent reporting and analytics to track your ROI and growth"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Turnaround",
      description: "Efficient processes ensuring timely delivery without compromising quality"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Proven Expertise",
      description: "Years of experience delivering successful campaigns for diverse clients"
    }
  ];

  const clients = [
    'Kelfoods', 'Malawi Hostit', 'Yohane Banda Foundation', 'Love Burials',
    'ComputerLand', 'Mjwallet', 'NextGen Basketball Academy', 'Tinyanule Logistics',
    'Proto Chicks', 'Muit Securitas', 'Chiweta', 'Rising Gone',
    'Skills Hub', 'Super Run Rice', 'Tigule', 'Donvas Eggs', 'Traveloka Guest House'
  ];

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-r from-orange-500 to-yellow-500 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/50 to-yellow-600/50"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-poppins">
              WHAT WE <span className="text-white">DO</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Comprehensive digital marketing solutions designed to transform your business 
              and drive measurable results in today&apos;s competitive landscape.
            </p>
            <a
              href="/auth/login?redirect=/client/projects/create"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-5 h-5" />
              <span>Start Your Project</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-lg mb-4 group-hover:bg-orange-200 transition-colors">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-poppins">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={index} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Our Process
            </h2>
            <p className="text-gray-600 text-lg">
              A systematic approach to ensure your success
            </p>
          </div>
          
          <div className="relative">
            {/* Process Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-yellow-400 to-amber-400 transform -translate-y-1/2"></div>
            
            <div className="grid lg:grid-cols-4 gap-8 relative">
              {[
                { step: "01", title: "Discovery", description: "Understanding your business goals and challenges" },
                { step: "02", title: "Strategy", description: "Developing tailored marketing strategies" },
                { step: "03", title: "Execution", description: "Implementing campaigns with precision" },
                { step: "04", title: "Optimization", description: "Continuous improvement and scaling success" }
              ].map((process, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 relative z-10">
                    {process.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 font-poppins">
                    {process.title}
                  </h3>
                  <p className="text-gray-600">
                    {process.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Clients Showcase */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Trusted by Leading Businesses
            </h2>
            <p className="text-gray-600 text-lg">
              We&apos;ve worked with amazing companies across Malawi
            </p>
          </div>
          
          {/* Scrollable Logos Container */}
          <div className="relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>
            
            <div className="flex animate-scroll space-x-8 py-4">
              {/* Duplicate items for infinite scroll effect */}
              {[
                ...clients,
                ...clients  // Duplicate for seamless scrolling
              ].map((client, index) => (
                <div key={index} className="flex-shrink-0">
                  <div className="w-48 h-32 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 flex items-center justify-center p-6 hover:shadow-lg transition-all duration-300 hover:border-orange-300 group">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:from-orange-200 group-hover:to-yellow-200 transition-colors">
                        <span className="text-xl font-bold">
                          {client.split(' ')[0].charAt(0)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">
                        {client.length > 15 ? client.substring(0, 15) + '...' : client}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

     {/* CTA Section */}
<section className="py-20 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
  <div className="container mx-auto px-4 text-center">
    <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
      Ready to Transform Your Digital Presence?
    </h2>
    <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
      Log in or create an account to start your project with us
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <a
        href="/auth/login?redirect=/client/projects/create"
        className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
      >
        <Sparkles className="w-5 h-5" />
        <span>Start Your Project</span>
        <ArrowRight className="w-5 h-5" />
      </a>
      <a
        href="/auth/login"
        className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-colors"
      >
        <span>Login to Dashboard</span>
        <ArrowRight className="w-5 h-5" />
      </a>
    </div>
    <p className="text-white/80 text-sm mt-4">
      Already have an account? <a href="/auth/login" className="font-semibold underline hover:text-white">Login here</a>
      <span className="mx-2">•</span>
      New to Ad Plus? <a href="/auth/login#signup" className="font-semibold underline hover:text-white">Create account</a>
    </p>
  </div>
</section>
    </div>
  )
}