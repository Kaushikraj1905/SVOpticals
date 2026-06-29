import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Upload, MessageCircle, ArrowLeft, Truck, Loader, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const WHATSAPP_NUMBER = '919441273074';

export default function CheckoutPage() {
  const { t, language } = useLanguage();
  const { items, subtotal, gstAmount, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '',
    notes: '',
  });
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPrescriptionFile(e.target.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Create customer if not exists
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', formData.phone)
        .maybeSingle();

      let customerId = customer?.id;

      if (!customerId) {
        const { data: newCustomer, error: createError } = await supabase
          .from('customers')
          .insert({
            name: formData.name,
            phone: formData.phone,
            email: formData.email || null,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            user_id: user?.id || null,
          })
          .select('id')
          .single();

        if (createError) throw createError;
        customerId = newCustomer.id;
      }

      // Generate order number
      const orderPrefix = 'ORD';
      const timestamp = Date.now().toString(36).toUpperCase();
      const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
      const newOrderNumber = `${orderPrefix}-${timestamp}${randomSuffix}`;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_id: customerId,
          order_number: newOrderNumber,
          subtotal: subtotal,
          gst_amount: gstAmount,
          total: total,
          status: 'pending',
          customer_name: formData.name,
          customer_phone: formData.phone,
          customer_address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
          notes: formData.notes || null,
        })
        .select('id')
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
        total: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      // Create initial status history
      const { error: historyError } = await supabase.from('order_status_history').insert({
        order_id: order.id,
        status: 'pending',
        notes: 'Order placed via website',
      });
      if (historyError) throw historyError;

      // Upload prescription if provided
      let prescriptionUrl = '';
      if (prescriptionFile) {
        const fileName = `prescriptions/${order.id}/${Date.now()}_${prescriptionFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('prescriptions')
          .upload(fileName, prescriptionFile);

        if (!uploadError) {
          const { data: urlData } = await supabase.storage
            .from('prescriptions')
            .getPublicUrl(fileName);
          prescriptionUrl = urlData.publicUrl;

          // Save prescription record
          await supabase.from('prescriptions').insert({
            order_id: order.id,
            user_id: user?.id || null,
            file_url: prescriptionUrl,
            file_name: prescriptionFile.name,
          });
        }
      }

      // Build WhatsApp message
      const productList = items.map((item, index) => {
        const productName = language === 'te' && item.product.name_te ? item.product.name_te : item.product.name;
        return `${index + 1}. ${productName} (SKU: ${item.product.sku}) - Qty: ${item.quantity} - ₹${item.product.price * item.quantity}`;
      }).join('\n');

      const message = `*New Order from S V Opticals Website*

*Order Number:* ${newOrderNumber}

*Customer Details:*
Name: ${formData.name}
Phone: ${formData.phone}
${formData.email ? `Email: ${formData.email}` : ''}

*Delivery Address:*
${formData.address}
${formData.city}, ${formData.state} - ${formData.pincode}

*Products Ordered:*
${productList}

*Total Items:* ${items.length}
*Subtotal:* ₹${subtotal.toLocaleString('en-IN')}
*GST:* ₹${gstAmount.toLocaleString('en-IN')}
*Grand Total:* ₹${total.toLocaleString('en-IN')}

${prescriptionUrl ? '*Prescription:* ' + prescriptionUrl : ''}
${formData.notes ? `*Notes:* ${formData.notes}` : ''}

Please confirm this order.`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

      window.open(whatsappUrl, '_blank');
      setOrderNumber(newOrderNumber);
      setOrderSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error('Order error:', err);
      setErrors({ general: 'Failed to place order. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <h1 className="font-display text-2xl font-bold text-navy-900 mb-4">Your cart is empty</h1>
            <Link to="/products" className="btn-primary">
              {t('continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} className="text-green-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-navy-900 mb-4">
            {t('orderSuccess')}
          </h1>
          {orderNumber && (
            <p className="text-lg font-semibold text-gold-600 mb-2">Order #{orderNumber}</p>
          )}
          <p className="text-gray-600 mb-4">{t('orderSuccessMessage')}</p>
          <div className="flex flex-col gap-3 mb-6">
            <Link to={`/order-tracking?order=${orderNumber}`} className="btn-primary">
              Track Your Order
            </Link>
            <Link to="/" className="btn-outline">
              Back to Home
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            You can track your order anytime using your order number.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900 text-white py-12">
        <div className="container mx-auto px-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-300 hover:text-white mb-4">
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="font-display text-3xl md:text-4xl font-bold">{t('checkoutTitle')}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">{errors.general}</div>
              )}

              {/* Personal Information */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-6">{t('personalInfo')}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-navy-800 mb-2">{t('fullName')} *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={`input-field ${errors.name ? 'border-red-500' : ''}`} />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-2">{t('phoneNumber')} *</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`input-field ${errors.phone ? 'border-red-500' : ''}`} placeholder="+91 9876543210" />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-2">{t('email')}</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" />
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-6">{t('deliveryAddress')}</h2>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-navy-800 mb-2">{t('address')} *</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className={`input-field ${errors.address ? 'border-red-500' : ''}`} />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-navy-800 mb-2">{t('city')}</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-800 mb-2">{t('state')}</label>
                      <input type="text" name="state" value={formData.state} onChange={handleChange} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy-800 mb-2">{t('pincode')}</label>
                      <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="input-field" placeholder="500001" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Prescription Upload */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-6">{t('prescription')}</h2>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" id="prescription-upload" />
                  <label htmlFor="prescription-upload" className="cursor-pointer">
                    <Upload size={40} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">{prescriptionFile ? prescriptionFile.name : t('uploadPrescription')}</p>
                    <p className="text-sm text-gray-400">Drag and drop or click to upload (Image or PDF)</p>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-6">{t('orderNotes')}</h2>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="input-field" placeholder="Any special instructions..." />
              </div>

              {/* Submit Button */}
              <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50">
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <MessageCircle size={20} />
                    {t('placeOrder')}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="font-display text-xl font-semibold text-navy-900 mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => {
                  const productName = language === 'te' && item.product.name_te ? item.product.name_te : item.product.name;
                  return (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{productName} x {item.quantity}</span>
                      <span className="font-medium">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
              </div>
              <hr />
              <div className="space-y-4 mt-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('subtotal')}</span>
                  <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('gst')}</span>
                  <span className="font-medium">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-navy-900">{t('total')}</span>
                  <span className="font-bold text-navy-900">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
