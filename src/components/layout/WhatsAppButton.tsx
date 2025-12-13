'use client'

import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function WhatsAppButton() {
  const whatsappNumber = '+265881234567'
  const message = 'Hello Ad Plus Digital! I\'d like to learn more about your services.'

  const handleClick = () => {
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleClick}
        className="rounded-full w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  )
}