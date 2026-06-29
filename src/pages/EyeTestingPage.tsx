import { Link } from 'react-router-dom';
import { Eye, Monitor, Check, Clock, Stethoscope, Glasses } from 'lucide-react';
import SEOPage from './SEOPage';

export default function EyeTestingPage() {
  const content = (
    <div className="space-y-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-4">Eye Testing in Hyderabad</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">Comprehensive eye examinations at S V Opticals in Abids, Hyderabad. Our certified optometrists use advanced digital equipment for accurate prescriptions and eye health assessments.</p>
      </div>

      {/* Tests */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: 'Vision Acuity Test', desc: 'Measures how clearly you see at various distances using Snellen chart and digital displays.', icon: Eye },
          { title: 'Refraction Test', desc: 'Determines your exact prescription for glasses or contact lenses using autorefractor and trial frame.', icon: Glasses },
          { title: 'Eye Health Check', desc: 'Comprehensive examination of eye health including pressure check, retina examination, and more.', icon: Stethoscope },
          { title: 'Digital Eye Strain', desc: 'Specialized testing for computer users to assess blue light impact and recommend solutions.', icon: Monitor },
          { title: 'Contact Lens Fitting', desc: 'Corneal curvature measurement and lens fitting for comfortable and safe contact lens wear.', icon: Eye },
          { title: 'Children Eye Test', desc: 'Gentle, child-friendly eye testing for kids with special charts and techniques.', icon: Eye },
        ].map((t) => (
          <div key={t.title} className="bg-white rounded-xl shadow-sm p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <t.icon size={24} className="text-green-600" />
            </div>
            <h3 className="font-semibold text-navy-900 mb-2">{t.title}</h3>
            <p className="text-sm text-gray-600">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Equipment */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-6">Our Digital Equipment</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            'Digital Auto-Refractor for accurate prescriptions',
            'Slit Lamp for detailed eye health examination',
            'Tonometer for eye pressure measurement',
            'Lensometer for verifying existing glasses',
            'Pupillometer for precise PD measurement',
            'Corneal Topographer for contact lens fitting',
            'Visual Field Analyzer for peripheral vision',
            'Fundus Camera for retina imaging',
          ].map((e, i) => (
            <div key={i} className="flex items-center gap-3">
              <Check size={20} className="text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">{e}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Process */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-6">Eye Testing Process</h2>
        <div className="space-y-4">
          {[
            { step: '1', title: 'Registration', desc: 'Walk in or book an appointment. Our staff will guide you through the process.' },
            { step: '2', title: 'Preliminary Tests', desc: 'Auto-refractor and preliminary vision tests to get baseline measurements.' },
            { step: '3', title: 'Detailed Examination', desc: 'Comprehensive eye examination by our certified optometrist.' },
            { step: '4', title: 'Prescription', desc: 'Accurate prescription provided with detailed explanation and recommendations.' },
            { step: '5', title: 'Frame & Lens Selection', desc: 'Choose frames and lenses based on your prescription, lifestyle, and budget.' },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-4">
              <div className="w-8 h-8 bg-gold-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {s.step}
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-6">Eye Testing Pricing</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: 'Basic Eye Test', price: 'Free', desc: 'Included with frame purchase. Vision acuity + refraction.' },
            { title: 'Comprehensive Eye Test', price: '₹200', desc: 'Full examination including eye health check.' },
            { title: 'Contact Lens Fitting', price: '₹500', desc: 'Corneal topography + trial lens fitting + training.' },
          ].map((p) => (
            <div key={p.title} className="border rounded-xl p-6 text-center">
              <h3 className="font-semibold text-navy-900 mb-2">{p.title}</h3>
              <p className="text-2xl font-bold text-gold-600 mb-2">{p.price}</p>
              <p className="text-sm text-gray-600">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-gradient-to-br from-navy-900 to-purple-900 rounded-xl p-8 text-white">
        <h2 className="font-display text-2xl font-bold mb-4">Book Your Eye Test Today</h2>
        <p className="text-gray-300 mb-6 max-w-xl mx-auto">Free basic eye testing with any frame purchase. Walk in or call to book an appointment.</p>
        <div className="flex justify-center gap-4">
          <Link to="/contact" className="bg-gold-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors">Book Appointment</Link>
          <Link to="/services" className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">Our Services</Link>
        </div>
      </div>
    </div>
  );

  return (
    <SEOPage
      title="Eye Testing in Hyderabad | Digital Eye Examination"
      description="Professional eye testing in Hyderabad at S V Opticals. Digital auto-refractor, comprehensive eye health check, contact lens fitting. Free with frame purchase. Walk in or book."
      keywords={['Eye Testing Hyderabad', 'Eye Examination Abids', 'Digital Eye Test Hyderabad', 'Optometrist Hyderabad', 'Eye Checkup Abids', 'Vision Test Hyderabad', 'Eye Health Check', 'Contact Lens Fitting Hyderabad']}
      content={content}
      pageName="eye-testing-hyderabad"
    />
  );
}
