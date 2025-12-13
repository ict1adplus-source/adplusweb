import { Mail, Phone, Linkedin, Award } from 'lucide-react'

interface TeamMemberCardProps {
  member: {
    name: string
    role: string
    image: string
    description: string
    phone: string
    email: string
    linkedin: string
    skills: string[]
  }
}

export default function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-orange-50 to-yellow-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"></div>
        <div className="absolute bottom-4 left-4 z-20">
          <h3 className="text-xl font-bold text-white font-poppins">{member.name}</h3>
          <p className="text-orange-200 font-medium">{member.role}</p>
        </div>
        
        {/* Default avatar */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {member.name.charAt(0)}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="mb-4">
          <p className="text-gray-600 leading-relaxed text-sm">{member.description}</p>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Award size={16} className="text-orange-500" />
            <span className="font-semibold text-gray-700">Expertise</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {member.skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-100"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 pt-4 border-t border-gray-100">
          <a
            href={`tel:${member.phone}`}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors text-sm"
          >
            <Phone size={14} className="text-gray-400" />
            <span className="font-medium">{member.phone}</span>
          </a>
          <a
            href={`mailto:${member.email}`}
            className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors text-sm"
          >
            <Mail size={14} className="text-gray-400" />
            <span className="font-medium">{member.email}</span>
          </a>
          <a
            href={`https://linkedin.com/in/${member.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors text-sm"
          >
            <Linkedin size={14} className="text-gray-400" />
            <span className="font-medium">LinkedIn Profile</span>
          </a>
        </div>
      </div>
    </div>
  )
}