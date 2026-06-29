import { useState, useEffect } from 'react';
import {
  Search, Eye, Edit, Plus, FileText, Calendar, X,
  Upload, Download, User, ChevronLeft, ChevronRight, Save,
  FileImage, Filter, Eye as EyeIcon, Trash2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Prescription, Customer } from '../../types';

interface PrescriptionWithCustomer extends Prescription {
  customer?: Customer;
}

const LENS_TYPES = ['Single Vision', 'Progressive', 'Bifocal', 'Blue Cut', 'Photochromic'];
const LENS_BRANDS = ['Essilor', 'Zeiss', 'Hoya', 'Nikon', 'SV Opticals', 'Crizal', 'Varilux', 'Kodak', 'Rodenstock', 'Tokai'];
const LENS_COATINGS = ['Anti-Glare', 'Blue Cut', 'UV Protection', 'Scratch Resistant', 'Anti-Glare + UV'];

export default function AdminPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<PrescriptionWithCustomer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<PrescriptionWithCustomer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(15);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showToast, setShowToast] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<Prescription>>({
    customer_id: '',
    right_eye_sphere: null,
    right_eye_cylinder: null,
    right_eye_axis: null,
    right_eye_add: null,
    right_eye_va: '',
    left_eye_sphere: null,
    left_eye_cylinder: null,
    left_eye_axis: null,
    left_eye_add: null,
    left_eye_va: '',
    pd: null,
    lens_type: 'Single Vision',
    lens_brand: '',
    lens_coating: '',
    prescription_date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  useEffect(() => {
    fetchPrescriptions();
    fetchCustomers();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          customer:customers(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (err) {
      console.error('Error fetching prescriptions:', err);
      setShowToast('Failed to load prescriptions');
      setTimeout(() => setShowToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, email')
        .order('name', { ascending: true });
      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const filteredPrescriptions = prescriptions.filter((p) => {
    const matchesSearch =
      !search ||
      (p.customer?.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (p.customer?.phone?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (p.notes?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (p.lens_type?.toLowerCase() || '').includes(search.toLowerCase()) ||
      (p.lens_brand?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesType = !filterType || p.lens_type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredPrescriptions.length / pageSize);
  const paginated = filteredPrescriptions.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openCreate = () => {
    setForm({
      customer_id: '',
      right_eye_sphere: null,
      right_eye_cylinder: null,
      right_eye_axis: null,
      right_eye_add: null,
      right_eye_va: '',
      left_eye_sphere: null,
      left_eye_cylinder: null,
      left_eye_axis: null,
      left_eye_add: null,
      left_eye_va: '',
      pd: null,
      lens_type: 'Single Vision',
      lens_brand: '',
      lens_coating: '',
      prescription_date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsCreating(true);
    setIsEditing(false);
    setSelectedPrescription(null);
  };

  const openEdit = (p: PrescriptionWithCustomer) => {
    setForm({
      customer_id: p.customer_id || '',
      right_eye_sphere: p.right_eye_sphere,
      right_eye_cylinder: p.right_eye_cylinder,
      right_eye_axis: p.right_eye_axis,
      right_eye_add: p.right_eye_add,
      right_eye_va: p.right_eye_va || '',
      left_eye_sphere: p.left_eye_sphere,
      left_eye_cylinder: p.left_eye_cylinder,
      left_eye_axis: p.left_eye_axis,
      left_eye_add: p.left_eye_add,
      left_eye_va: p.left_eye_va || '',
      pd: p.pd,
      lens_type: p.lens_type || 'Single Vision',
      lens_brand: p.lens_brand || '',
      lens_coating: p.lens_coating || '',
      prescription_date: p.prescription_date || new Date().toISOString().split('T')[0],
      notes: p.notes || '',
    });
    setSelectedPrescription(p);
    setIsEditing(true);
    setIsCreating(false);
  };

  const openView = (p: PrescriptionWithCustomer) => {
    setSelectedPrescription(p);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!form.customer_id) {
      setShowToast('Please select a customer');
      setTimeout(() => setShowToast(null), 3000);
      return;
    }

    const payload = {
      customer_id: form.customer_id,
      right_eye_sphere: form.right_eye_sphere ? parseFloat(form.right_eye_sphere as any) : null,
      right_eye_cylinder: form.right_eye_cylinder ? parseFloat(form.right_eye_cylinder as any) : null,
      right_eye_axis: form.right_eye_axis ? parseInt(form.right_eye_axis as any) : null,
      right_eye_add: form.right_eye_add ? parseFloat(form.right_eye_add as any) : null,
      right_eye_va: form.right_eye_va || null,
      left_eye_sphere: form.left_eye_sphere ? parseFloat(form.left_eye_sphere as any) : null,
      left_eye_cylinder: form.left_eye_cylinder ? parseFloat(form.left_eye_cylinder as any) : null,
      left_eye_axis: form.left_eye_axis ? parseInt(form.left_eye_axis as any) : null,
      left_eye_add: form.left_eye_add ? parseFloat(form.left_eye_add as any) : null,
      left_eye_va: form.left_eye_va || null,
      pd: form.pd ? parseFloat(form.pd as any) : null,
      lens_type: form.lens_type || null,
      lens_brand: form.lens_brand || null,
      lens_coating: form.lens_coating || null,
      prescription_date: form.prescription_date || new Date().toISOString().split('T')[0],
      notes: form.notes || null,
    };

    try {
      if (isCreating) {
        const { error } = await supabase.from('prescriptions').insert(payload);
        if (error) throw error;
        setShowToast('Prescription created successfully');
      } else if (isEditing && selectedPrescription) {
        const { error } = await supabase.from('prescriptions').update(payload).eq('id', selectedPrescription.id);
        if (error) throw error;
        setShowToast('Prescription updated successfully');
      }
      setIsCreating(false);
      setIsEditing(false);
      setSelectedPrescription(null);
      fetchPrescriptions();
    } catch (err: any) {
      setShowToast('Error: ' + err.message);
    }
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('prescriptions').delete().eq('id', id);
      if (error) throw error;
      setShowToast('Prescription deleted');
      setDeleteConfirm(null);
      setSelectedPrescription(null);
      fetchPrescriptions();
    } catch (err: any) {
      setShowToast('Error: ' + err.message);
    }
    setTimeout(() => setShowToast(null), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPrescription) return;

    setUploading(true);
    try {
      const filePath = `prescriptions/${selectedPrescription.customer_id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: publicUrl } = supabase.storage.from('documents').getPublicUrl(filePath);
      const { error: updateError } = await supabase
        .from('prescriptions')
        .update({ file_url: publicUrl.publicUrl, file_name: file.name })
        .eq('id', selectedPrescription.id);
      if (updateError) throw updateError;

      setShowToast('File uploaded successfully');
      setSelectedPrescription({ ...selectedPrescription, file_url: publicUrl.publicUrl, file_name: file.name });
      fetchPrescriptions();
    } catch (err: any) {
      setShowToast('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 focus:border-gold-500 outline-none text-sm";
  const labelClass = "text-xs font-medium text-gray-500 mb-1 block";

  return (
    <div className="space-y-6">
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-navy-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in-down">
          {showToast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-display font-bold text-navy-900">Prescription Management</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-navy-900 text-white px-4 py-2 rounded-lg hover:bg-navy-800 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          New Prescription
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Prescriptions', value: prescriptions.length },
          { label: 'Progressive', value: prescriptions.filter(p => p.lens_type === 'Progressive').length },
          { label: 'Blue Cut', value: prescriptions.filter(p => p.lens_type === 'Blue Cut').length },
          { label: 'Single Vision', value: prescriptions.filter(p => p.lens_type === 'Single Vision').length },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4">
            <p className="text-xs text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search by customer, brand, notes..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gold-500 outline-none text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gold-500 outline-none"
            >
              <option value="">All Lens Types</option>
              {LENS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-800"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Lens Type</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Brand</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">File</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-navy-900">{p.customer?.name || 'Unknown'}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.customer?.phone || '-'}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {p.lens_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{p.lens_brand || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {p.prescription_date ? new Date(p.prescription_date).toLocaleDateString('en-IN') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {p.file_url ? (
                          <span className="text-green-600 flex items-center gap-1 text-xs">
                            <FileText size={14} /> Yes
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openView(p)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye size={16} className="text-gray-500" />
                          </button>
                          <button
                            onClick={() => openEdit(p)}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} className="text-gray-500" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(p.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-xs text-gray-500">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredPrescriptions.length)} of {filteredPrescriptions.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-medium px-2">{currentPage} / {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail / Edit / Create Modal */}
      {(selectedPrescription || isCreating) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-4">
            {/* Header */}
            <div className="p-6 border-b sticky top-0 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-navy-100 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-navy-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-navy-900">
                    {isCreating ? 'New Prescription' : isEditing ? 'Edit Prescription' : 'Prescription Details'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isCreating || isEditing
                      ? 'Fill in the prescription details below'
                      : selectedPrescription?.customer?.name || 'Prescription'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedPrescription(null);
                  setIsEditing(false);
                  setIsCreating(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Selection (for create/edit) */}
              {(isCreating || isEditing) && (
                <div>
                  <label className={labelClass}>Customer *</label>
                  <select
                    value={form.customer_id || ''}
                    onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select a customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* View Mode - Customer Info */}
              {!isCreating && !isEditing && selectedPrescription && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Customer</p>
                      <p className="font-medium text-navy-900">{selectedPrescription.customer?.name || 'Unknown'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-navy-900">{selectedPrescription.customer?.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Prescription Date</p>
                      <p className="font-medium text-navy-900">
                        {selectedPrescription.prescription_date
                          ? new Date(selectedPrescription.prescription_date).toLocaleDateString('en-IN')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">PD</p>
                      <p className="font-medium text-navy-900">{selectedPrescription.pd ? `${selectedPrescription.pd} mm` : '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Right Eye */}
              <div>
                <h3 className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
                  <EyeIcon size={18} /> Right Eye (OD)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className={labelClass}>Sphere</label>
                    {(isCreating || isEditing) ? (
                      <input type="text" value={form.right_eye_sphere ?? ''} onChange={(e) => setForm({ ...form, right_eye_sphere: e.target.value ? parseFloat(e.target.value) : null })} placeholder="-2.00" className={inputClass} />
                    ) : (
                      <p className="text-sm font-medium text-navy-900">{selectedPrescription?.right_eye_sphere ?? '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Cylinder</label>
                    {(isCreating || isEditing) ? (
                      <input type="text" value={form.right_eye_cylinder ?? ''} onChange={(e) => setForm({ ...form, right_eye_cylinder: e.target.value ? parseFloat(e.target.value) : null })} placeholder="-0.50" className={inputClass} />
                    ) : (
                      <p className="text-sm font-medium text-navy-900">{selectedPrescription?.right_eye_cylinder ?? '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Axis</label>
                    {(isCreating || isEditing) ? (
                      <input type="number" value={form.right_eye_axis ?? ''} onChange={(e) => setForm({ ...form, right_eye_axis: e.target.value ? parseInt(e.target.value) : null })} placeholder="180" className={inputClass} />
                    ) : (
                      <p className="text-sm font-medium text-navy-900">{selectedPrescription?.right_eye_axis ?? '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Add</label>
                    {(isCreating || isEditing) ? (
                      <input type="text" value={form.right_eye_add ?? ''} onChange={(e) => setForm({ ...form, right_eye_add: e.target.value ? parseFloat(e.target.value) : null })} placeholder="+1.50" className={inputClass} />
                    ) : (
                      <p className="text-sm font-medium text-navy-900">{selectedPrescription?.right_eye_add ?? '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>VA</label>
                    {(isCreating || isEditing) ? (
                      <input type="text" value={form.right_eye_va || ''} onChange={(e) => setForm({ ...form, right_eye_va: e.target.value })} placeholder="6/6" className={inputClass} />
                    ) : (
                      <p className="text-sm font-medium text-navy-900">{selectedPrescription?.right_eye_va ?? '-'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Left Eye */}
              <div>
                <h3 className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
                  <EyeIcon size={18} /> Left Eye (OS)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className={labelClass}>Sphere</label>
                    {(isCreating || isEditing) ? (
                      <input type="text" value={form.left_eye_sphere ?? ''} onChange={(e) => setForm({ ...form, left_eye_sphere: e.target.value ? parseFloat(e.target.value) : null })} placeholder="-2.00" className={inputClass} />
                    ) : (
                      <p className="text-sm font-medium text-navy-900">{selectedPrescription?.left_eye_sphere ?? '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Cylinder</label>
                    {(isCreating || isEditing) ? (
                      <input type="text" value={form.left_eye_cylinder ?? ''} onChange={(e) => setForm({ ...form, left_eye_cylinder: e.target.value ? parseFloat(e.target.value) : null })} placeholder="-0.50" className={inputClass} />
                    ) : (
                      <p className="text-sm font-medium text-navy-900">{selectedPrescription?.left_eye_cylinder ?? '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Axis</label>
                    {(isCreating || isEditing) ? (
                      <input type="number" value={form.left_eye_axis ?? ''} onChange={(e) => setForm({ ...form, left_eye_axis: e.target.value ? parseInt(e.target.value) : null })} placeholder="180" className={inputClass} />
                    ) : (
                      <p className="text-sm font-medium text-navy-900">{selectedPrescription?.left_eye_axis ?? '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Add</label>
                    {(isCreating || isEditing) ? (
                      <input type="text" value={form.left_eye_add ?? ''} onChange={(e) => setForm({ ...form, left_eye_add: e.target.value ? parseFloat(e.target.value) : null })} placeholder="+1.50" className={inputClass} />
                    ) : (
                      <p className="text-sm font-medium text-navy-900">{selectedPrescription?.left_eye_add ?? '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>VA</label>
                    {(isCreating || isEditing) ? (
                      <input type="text" value={form.left_eye_va || ''} onChange={(e) => setForm({ ...form, left_eye_va: e.target.value })} placeholder="6/6" className={inputClass} />
                    ) : (
                      <p className="text-sm font-medium text-navy-900">{selectedPrescription?.left_eye_va ?? '-'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Lens & Other Info */}
              <div>
                <h3 className="text-sm font-semibold text-navy-900 mb-3">Lens & Other Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className={labelClass}>PD (mm)</label>
                    {(isCreating || isEditing) ? (
                      <input type="text" value={form.pd ?? ''} onChange={(e) => setForm({ ...form, pd: e.target.value ? parseFloat(e.target.value) : null })} placeholder="62" className={inputClass} />
                    ) : (
                      <p className="text-sm font-medium text-navy-900">{selectedPrescription?.pd ?? '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Lens Type</label>
                    {(isCreating || isEditing) ? (
                      <select value={form.lens_type || ''} onChange={(e) => setForm({ ...form, lens_type: e.target.value })} className={inputClass}>
                        {LENS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    ) : (
                      <p className="text-sm font-medium text-navy-900">{selectedPrescription?.lens_type ?? '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Lens Brand</label>
                    {(isCreating || isEditing) ? (
                      <select value={form.lens_brand || ''} onChange={(e) => setForm({ ...form, lens_brand: e.target.value })} className={inputClass}>
                        <option value="">Select</option>
                        {LENS_BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    ) : (
                      <p className="text-sm font-medium text-navy-900">{selectedPrescription?.lens_brand ?? '-'}</p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Coating</label>
                    {(isCreating || isEditing) ? (
                      <select value={form.lens_coating || ''} onChange={(e) => setForm({ ...form, lens_coating: e.target.value })} className={inputClass}>
                        <option value="">Select</option>
                        {LENS_COATINGS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      <p className="text-sm font-medium text-navy-900">{selectedPrescription?.lens_coating ?? '-'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Prescription Date & Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Prescription Date</label>
                  {(isCreating || isEditing) ? (
                    <input type="date" value={form.prescription_date || ''} onChange={(e) => setForm({ ...form, prescription_date: e.target.value })} className={inputClass} />
                  ) : (
                    <p className="text-sm font-medium text-navy-900">{selectedPrescription?.prescription_date ? new Date(selectedPrescription.prescription_date).toLocaleDateString('en-IN') : '-'}</p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Notes</label>
                  {(isCreating || isEditing) ? (
                    <textarea value={form.notes || ''} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Additional notes..." className={inputClass} />
                  ) : (
                    <p className="text-sm font-medium text-navy-900">{selectedPrescription?.notes || '-'}</p>
                  )}
                </div>
              </div>

              {/* File Upload (view mode) */}
              {!isCreating && !isEditing && selectedPrescription && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-navy-900 mb-3">Prescription File</h3>
                  {selectedPrescription.file_url ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText size={20} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-navy-900">{selectedPrescription.file_name || 'Prescription File'}</p>
                        <a
                          href={selectedPrescription.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View / Download
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <FileImage size={32} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-sm text-gray-500 mb-3">No file attached</p>
                    </div>
                  )}
                  <div className="mt-3">
                    <label className="flex items-center gap-2 text-sm text-navy-900 cursor-pointer hover:text-gold-600 transition-colors">
                      <Upload size={16} />
                      <span>{uploading ? 'Uploading...' : selectedPrescription.file_url ? 'Replace file' : 'Upload file'}</span>
                      <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} accept=".pdf,.jpg,.jpeg,.png" />
                    </label>
                  </div>
                </div>
              )}

              {/* File Upload (edit mode) */}
              {(isCreating || isEditing) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-navy-900 mb-3">Prescription File</h3>
                  <p className="text-xs text-gray-500 mb-2">Save the prescription first, then upload files from the detail view.</p>
                  {selectedPrescription?.file_url && (
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText size={16} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-navy-900">{selectedPrescription.file_name || 'Prescription File'}</p>
                        <a href={selectedPrescription.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View file</a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t">
                {(isCreating || isEditing) && (
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-navy-900 text-white px-4 py-2 rounded-lg hover:bg-navy-800 transition-colors text-sm font-medium"
                  >
                    <Save size={16} />
                    {isCreating ? 'Create Prescription' : 'Save Changes'}
                  </button>
                )}
                {!isCreating && !isEditing && selectedPrescription && (
                  <button
                    onClick={() => openEdit(selectedPrescription)}
                    className="flex items-center gap-2 bg-navy-900 text-white px-4 py-2 rounded-lg hover:bg-navy-800 transition-colors text-sm font-medium"
                  >
                    <Edit size={16} />
                    Edit Prescription
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedPrescription(null);
                    setIsEditing(false);
                    setIsCreating(false);
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">Delete Prescription?</h3>
            <p className="text-sm text-gray-500 mb-6">This action cannot be undone. The prescription data will be permanently removed.</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
