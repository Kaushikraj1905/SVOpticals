import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Send via WhatsApp
    const message = `New enquiry from S V Opticals website:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}

Message:
${formData.message}`;

    const whatsappUrl = `https://wa.me/919441273074?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-navy-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t('contact')}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Have questions or need assistance? We're here to help!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <h2 className="section-title mb-8">{t('getInTouch')}</h2>

              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-navy-700" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">{t('storeLocation')}</h3>
                    <p className="text-gray-600">
                      S. No. G-4 Malti Naik Plaza,<br />
                      Abids, Hyderabad,<br />
                      Telangana 500001, India
                    </p>
                    <a
                      href="https://maps.app.goo.gl/Sib48ePerWs8Tua2A"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-600 hover:text-gold-700 font-medium text-sm mt-2 inline-flex items-center gap-1"
                    >
                      View on Google Maps
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="text-gold-700" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">{t('phone')}</h3>
                    <a href="tel:+919441273074" className="text-gray-600 hover:text-gold-600 transition-colors">
                      +91 9441273074
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="text-green-700" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">{t('whatsapp')}</h3>
                    <a
                      href="https://wa.me/919441273074"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-green-600 transition-colors"
                    >
                      +91 9441273074
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-blue-700" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">{t('email')}</h3>
                    <a
                      href="mailto:drrkgupta037@gmail.com"
                      className="text-gray-600 hover:text-gold-600 transition-colors"
                    >
                      drrkgupta037@gmail.com
                    </a>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="text-purple-700" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-navy-900 mb-1">{t('businessHours')}</h3>
                    <div className="text-gray-600">
                      <p>{t('mondayFriday')}: 10:00 AM - 9:00 PM</p>
                      <p>{t('saturdaySunday')}: 12:00 PM - 9:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Embed */}
              <div className="mt-8">
                <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center">
                  <a
                    href="https://maps.app.goo.gl/Sib48ePerWs8Tua2A"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    <MapPin size={20} className="mr-2" />
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="section-title mb-8">{t('sendMessage')}</h2>

              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="text-green-600" size={32} />
                  </div>
                  <h3 className="font-semibold text-navy-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-600">We'll get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-2">
                      {t('yourName')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-field"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-800 mb-2">
                        {t('yourEmail')}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-800 mb-2">
                        {t('yourPhone')}
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-2">
                      {t('message')}
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="input-field"
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                    <MessageCircle size={20} />
                    Send via WhatsApp
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
