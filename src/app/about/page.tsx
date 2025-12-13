import { CheckCircle, Users, Target, Eye, Award } from 'lucide-react'

export default function AboutPage() {
  const clients = [
    { name: "KELFOODS", category: "Animal Protein Producer - Retailer" },
    { name: "MALAWI HOSTIT", category: "Hospitality" },
    { name: "Yohane Banda Foundation", category: "Non-Profit" },
    { name: "Love Burials", category: "Apparel" },
    { name: "ComputerLand", category: "Technology" },
    { name: "Mjwallet", category: "Fintech" },
    { name: "NextGen Basketball Academy", category: "Sports" },
    { name: "Tinyanule Logistics", category: "Logistics" },
    { name: "Proto Chicks", category: "Agriculture" },
    { name: "MUIT SECURITAS", category: "Security" },
    { name: "CHIWETA", category: "Local Business" },
    { name: "RISING GONE", category: "Local Business" },
    { name: "Skills Hub", category: "Education" },
    { name: "SUPER RUN RICE", category: "Agriculture" },
    { name: "Tigule", category: "Groceries" },
    { name: "DONVAS EGGS", category: "Agriculture" },
    { name: "Traveloka Guest House", category: "Hospitality" },
  ];

  const values = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Creativity",
      description: "Thinking outside the box to deliver unique marketing solutions"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Simplicity",
      description: "Making complex marketing strategies easy to understand and implement"
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Quality",
      description: "Delivering exceptional work that exceeds client expectations"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Customer Satisfaction",
      description: "Putting our clients' success at the heart of everything we do"
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-poppins">
              WHO <span className="text-white">WE ARE</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-95">
              Ad Plus is a digital marketing agency that focuses on creating and developing 
              marketing solutions for its clients. We help you brand, visualize, and provide 
              digital marketing solutions to move your business forward.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Mission */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Target size={16} />
                Our Mission
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 font-poppins">
                Team On A Mission
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our mission is to provide innovative solutions in the digital marketing industry 
                thus solving the challenges marketing sector faces in the digital world.
              </p>
            </div>

            {/* Vision */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <Eye size={16} />
                Our Vision
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 font-poppins">
                A View Into The Future
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our vision is to be the leading Digital Marketing agency in developing creative 
                marketing strategies that best provides desired outcome.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-poppins">
              What We Believe In
            </h2>
            <p className="text-gray-600 text-lg">
              These core values guide everything we do at Ad Plus
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-lg group">
                <div className="text-orange-600 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    {value.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-poppins">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Overview Section (Replaces Team Section) */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-2 rounded-full text-sm font-semibold mb-6">
              <Users size={16} />
              About Our Agency
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6 font-poppins">
              Our Commitment to Excellence
            </h2>
            <div className="space-y-6 text-gray-700 text-lg">
              <p>
                At Ad Plus Digital Marketing Agency, we bring together a team of passionate 
                professionals dedicated to transforming businesses through innovative digital 
                solutions. Our expertise spans across branding, graphic design, web development, 
                and social media marketing.
              </p>
              <p>
                With over 3 years of industry experience and 50+ successful projects delivered, 
                we have established ourselves as a trusted partner for businesses across Malawi. 
                Our approach combines creativity with data-driven strategies to ensure measurable 
                results for our clients.
              </p>
              <p>
                We believe in building lasting relationships with our clients, working 
                collaboratively to understand their unique needs and deliver solutions that 
                drive growth and success in the digital landscape.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clients Showcase Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-poppins">
              WHO WE HAVE WORKED WITH
            </h2>
            <p className="text-gray-600 text-lg">
              Trusted by leading businesses and organizations across Malawi
            </p>
          </div>
          
          {/* Scrolling Logos Container */}
          <div className="relative overflow-hidden">
            {/* Gradient overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10"></div>
            
            {/* First Row - Scroll Left to Right */}
            <div className="flex animate-scroll space-x-8 py-4 mb-4">
              {clients.map((client, index) => (
                <div key={`row1-${index}`} className="flex-shrink-0">
                  <div className="w-48 h-32 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 flex flex-col items-center justify-center p-4 hover:shadow-lg transition-all duration-300 hover:border-orange-300 group">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-full flex items-center justify-center mb-3 group-hover:from-orange-200 group-hover:to-yellow-200 transition-colors">
                      <span className="text-lg font-bold text-orange-600">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                        {client.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{client.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Second Row - Scroll Right to Left */}
            <div className="flex animate-scroll-reverse space-x-8 py-4">
              {[...clients].reverse().map((client, index) => (
                <div key={`row2-${index}`} className="flex-shrink-0">
                  <div className="w-48 h-32 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border border-orange-100 flex flex-col items-center justify-center p-4 hover:shadow-lg transition-all duration-300 hover:border-orange-400 group">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full flex items-center justify-center mb-3 group-hover:from-orange-300 group-hover:to-yellow-300 transition-colors">
                      <span className="text-lg font-bold text-orange-700">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div className="text-center">
                      <h3 className="font-bold text-gray-800 group-hover:text-orange-700 transition-colors">
                        {client.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{client.category}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* CTA */}
          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <span className="text-lg font-semibold">There is space for your BRAND here!</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">3+</div>
              <p className="text-sm opacity-90">Years Experience</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <p className="text-sm opacity-90">Projects Completed</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">40+</div>
              <p className="text-sm opacity-90">Happy Clients</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">100%</div>
              <p className="text-sm opacity-90">Client Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-poppins">
              Why Choose Ad Plus?
            </h2>
            <p className="text-gray-600 text-lg">
              We combine creativity with strategy to deliver exceptional results
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Proven Expertise</h3>
              <p className="text-gray-600">
                Years of experience delivering successful campaigns for diverse clients
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Custom Solutions</h3>
              <p className="text-gray-600">
                Tailored strategies designed specifically for your business needs
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Dedicated Support</h3>
              <p className="text-gray-600">
                Continuous support and communication throughout your project
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-12">
            <a
              href="/auth/login?action=start_project"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <span>Start Your Project With Us</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}