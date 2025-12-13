import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Sparkles,
  CheckCircle
} from 'lucide-react'

export default function ContactPage() {
  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Call Us",
      details: ["+265 995 373 232", "+265 882 367 459"],
      description: "Monday to Friday, 8:00 AM - 5:00 PM"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Us",
      details: ["adplusdigitalmarketing@gmail.com"],
      description: "We respond within 24 hours"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Visit Us",
      details: ["Blantyre, Malawi"],
      description: "Digital Marketing Agency Headquarters"
    }
  ];

  const benefits = [
    "3+ Years of Industry Experience",
    "50+ Successful Projects Delivered",
    "Expert Team of Digital Professionals",
    "Custom Solutions for Every Client",
    "Fast Turnaround Times",
    "Transparent Communication"
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-orange-500 to-yellow-500 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 font-poppins">
              Get In Touch With Us
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Ready to transform your business? Let&apos;s create something amazing together.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-100 text-orange-600 rounded-xl mb-4">
                  {info.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 font-poppins">
                  {info.title}
                </h3>
                <div className="space-y-1 mb-3">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-700 font-medium">
                      {detail}
                    </p>
                  ))}
                </div>
                <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                  <Clock size={14} />
                  {info.description}
                </p>
              </div>
            ))}
          </div>

          {/* Why Choose Us Section */}
          <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-8 border border-orange-100 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 font-poppins text-center">
              Why Choose Ad Plus?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-lg border border-orange-100">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Start Project CTA - Same as Services page */}
          <div className="text-center">
            <div className="inline-block">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">
                Ready to Start Your Project?
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Log in or create an account to get started with your digital marketing project
              </p>
              <a
                href="/auth/login?action=start_project"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="w-5 h-5" />
                <span>Start Your Project</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
              <p className="text-gray-500 text-sm mt-4">
                Already have an account? <a href="/auth/login" className="text-orange-600 hover:text-orange-700 font-medium">Login here</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*{/* Map Section 
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 font-poppins text-center">
              Our Location
            </h2>
            <div className="aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold">Blantyre, Malawi</p>
                  <p className="text-gray-500">Digital Marketing Agency Headquarters</p>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow">
                <p className="text-sm font-semibold text-gray-700">📍 Central Business District</p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Visit our office in Blantyre for a face-to-face consultation about your project
              </p>
            </div>
          </div>
        </div>
      </section>*/}
    </div>
  )
}