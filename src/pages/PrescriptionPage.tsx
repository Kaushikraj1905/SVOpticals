import { useState } from 'react';
import { FileText, Upload, Eye, ChevronLeft, ChevronRight, Save, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

export default function PrescriptionPage() {
  const [mode, setMode] = useState<'manual' | 'upload' | 'saved'>('manual');
  const [form, setForm] = useState({
    right_sph: '', right_cyl: '', right_axis: '', right_add: '', right_va: '',
    left_sph: '', left_cyl: '', left_axis: '', left_add: '', left_va: '',
    pd: '', notes: '',
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [savedPrescriptions, setSavedPrescriptions] = useState<any[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        right_eye_sphere: form.right_sph ? parseFloat(form.right_sph) : null,
        right_eye_cylinder: form.right_cyl ? parseFloat(form.right_cyl) : null,
        right_eye_axis: form.right_axis ? parseInt(form.right_axis) : null,
        right_eye_add: form.right_add ? parseFloat(form.right_add) : null,
        right_eye_va: form.right_va || null,
        left_eye_sphere: form.left_sph ? parseFloat(form.left_sph) : null,
        left_eye_cylinder: form.left_cyl ? parseFloat(form.left_cyl) : null,
        left_eye_axis: form.left_axis ? parseInt(form.left_axis) : null,
        left_eye_add: form.left_add ? parseFloat(form.left_add) : null,
        left_eye_va: form.left_va || null,
        pd: form.pd ? parseFloat(form.pd) : null,
        notes: form.notes || null,
        prescription_date: new Date().toISOString().split('T')[0],
      };

      const { error } = await supabase.from('prescriptions').insert(payload);
      if (error) throw error;
      showToast('Prescription saved successfully');
      setForm({
        right_sph: '', right_cyl: '', right_axis: '', right_add: '', right_va: '',
        left_sph: '', left_cyl: '', left_axis: '', left_add: '', left_va: '',
        pd: '', notes: '',
      });
    } catch (err: any) {
      showToast('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!uploadedFile) return;
    setLoading(true);
    try {
      const filePath = `prescriptions/${Date.now()}-${uploadedFile.name}`;
      const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, uploadedFile);
      if (uploadError) throw uploadError;
      const { data: publicUrl } = supabase.storage.from('documents').getPublicUrl(filePath);
      const { error } = await supabase.from('prescriptions').insert({
        file_url: publicUrl.publicUrl,
        file_name: uploadedFile.name,
        prescription_date: new Date().toISOString().split('T')[0],
      });
      if (error) throw error;
      showToast('Prescription uploaded successfully');
      setUploadedFile(null);
    } catch (err: any) {
      showToast('Upload error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none text-sm";
  const labelClass = "text-xs font-medium text-gray-500 mb-1 block";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-navy-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in-down">
          {toast}
        </div>
      )}

      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">Upload Your Eye Prescription</h1>
          <p className="text-gray-600">Choose how you'd like to provide your prescription details</p>
        </div>

        {/* Mode Selection */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { key: 'manual', label: 'Manual Entry', icon: Eye, desc: 'Enter prescription details' },
            { key: 'upload', label: 'Upload File', icon: Upload, desc: 'JPG, PNG, PDF' },
            { key: 'saved', label: 'Saved Prescriptions', icon: FileText, desc: 'Use previous' },
          ].map((m) => (
            <button
              key={m.key}
              onClick={() => setMode(m.key as any)}
              className={`bg-white rounded-xl p-6 text-center transition-all ${
                mode === m.key ? 'ring-2 ring-gold-500 shadow-md' : 'hover:shadow-md'
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                mode === m.key ? 'bg-gold-100' : 'bg-gray-100'
              }`}>
                <m.icon size={24} className={mode === m.key ? 'text-gold-600' : 'text-gray-500'} />
              </div>
              <h3 className="font-semibold text-navy-900">{m.label}</h3>
              <p className="text-xs text-gray-500 mt-1">{m.desc}</p>
            </button>
          ))}
        </div>

        {/* Manual Entry */}
        {mode === 'manual' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-navy-900 mb-6 flex items-center gap-2">
              <Eye size={20} /> Manual Prescription Entry
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Right Eye */}
              <div>
                <h3 className="text-sm font-semibold text-navy-900 mb-3">Right Eye (OD)</h3>
                <div className="space-y-3">
                  <div><label className={labelClass}>Sphere (SPH)</label><input type="text" value={form.right_sph} onChange={(e) => setForm({ ...form, right_sph: e.target.value })} placeholder="-2.00" className={inputClass} /></div>
                  <div><label className={labelClass}>Cylinder (CYL)</label><input type="text" value={form.right_cyl} onChange={(e) => setForm({ ...form, right_cyl: e.target.value })} placeholder="-0.50" className={inputClass} /></div>
                  <div><label className={labelClass}>Axis</label><input type="number" value={form.right_axis} onChange={(e) => setForm({ ...form, right_axis: e.target.value })} placeholder="180" className={inputClass} /></div>
                  <div><label className={labelClass}>Add</label><input type="text" value={form.right_add} onChange={(e) => setForm({ ...form, right_add: e.target.value })} placeholder="+1.50" className={inputClass} /></div>
                  <div><label className={labelClass}>Visual Acuity</label><input type="text" value={form.right_va} onChange={(e) => setForm({ ...form, right_va: e.target.value })} placeholder="6/6" className={inputClass} /></div>
                </div>
              </div>

              {/* Left Eye */}
              <div>
                <h3 className="text-sm font-semibold text-navy-900 mb-3">Left Eye (OS)</h3>
                <div className="space-y-3">
                  <div><label className={labelClass}>Sphere (SPH)</label><input type="text" value={form.left_sph} onChange={(e) => setForm({ ...form, left_sph: e.target.value })} placeholder="-2.00" className={inputClass} /></div>
                  <div><label className={labelClass}>Cylinder (CYL)</label><input type="text" value={form.left_cyl} onChange={(e) => setForm({ ...form, left_cyl: e.target.value })} placeholder="-0.50" className={inputClass} /></div>
                  <div><label className={labelClass}>Axis</label><input type="number" value={form.left_axis} onChange={(e) => setForm({ ...form, left_axis: e.target.value })} placeholder="180" className={inputClass} /></div>
                  <div><label className={labelClass}>Add</label><input type="text" value={form.left_add} onChange={(e) => setForm({ ...form, left_add: e.target.value })} placeholder="+1.50" className={inputClass} /></div>
                  <div><label className={labelClass}>Visual Acuity</label><input type="text" value={form.left_va} onChange={(e) => setForm({ ...form, left_va: e.target.value })} placeholder="6/6" className={inputClass} /></div>
                </div>
              </div>
            </div>

            {/* PD & Notes */}
            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div><label className={labelClass}>PD (Pupillary Distance)</label><input type="text" value={form.pd} onChange={(e) => setForm({ ...form, pd: e.target.value })} placeholder="62 mm" className={inputClass} /></div>
              <div><label className={labelClass}>Additional Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Any special instructions..." className={inputClass} /></div>
            </div>

            <button onClick={handleSave} disabled={loading} className="mt-6 w-full btn-primary flex items-center justify-center gap-2">
              <Save size={18} /> {loading ? 'Saving...' : 'Save Prescription'}
            </button>
          </div>
        )}

        {/* Upload File */}
        {mode === 'upload' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-navy-900 mb-6 flex items-center gap-2">
              <Upload size={20} /> Upload Prescription
            </h2>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop your prescription file here</p>
              <p className="text-sm text-gray-500 mb-4">or click to browse</p>
              <p className="text-xs text-gray-400 mb-4">Accepted formats: JPG, PNG, PDF</p>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                className="hidden"
                id="prescription-upload"
              />
              <label htmlFor="prescription-upload" className="btn-primary cursor-pointer inline-block">
                Select File
              </label>
              {uploadedFile && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-navy-900">{uploadedFile.name}</p>
                  <p className="text-xs text-gray-500">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              )}
            </div>
            {uploadedFile && (
              <button onClick={handleFileUpload} disabled={loading} className="mt-4 w-full btn-primary flex items-center justify-center gap-2">
                <Upload size={18} /> {loading ? 'Uploading...' : 'Upload Prescription'}
              </button>
            )}
          </div>
        )}

        {/* Saved Prescriptions */}
        {mode === 'saved' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-navy-900 mb-6 flex items-center gap-2">
              <FileText size={20} /> Saved Prescriptions
            </h2>
            <div className="text-center py-12">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 mb-2">No saved prescriptions yet</p>
              <p className="text-sm text-gray-500 mb-4">Your prescriptions will appear here after you save them</p>
              <button onClick={() => setMode('manual')} className="btn-primary">Create New Prescription</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
