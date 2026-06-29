import { useState, useEffect } from 'react';
import { Bell, Calendar, Gift, Eye, Check, X, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Customer, CustomerReminder } from '../../types';

interface ReminderWithCustomer extends CustomerReminder {
  customer?: Customer;
}

export default function AdminCustomerRemindersPage() {
  const [reminders, setReminders] = useState<ReminderWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Get upcoming birthdays
      const { data: customers } = await supabase
        .from('customers')
        .select('*, prescriptions(count)');

      const upcomingReminders: ReminderWithCustomer[] = [];

      customers?.forEach((c: any) => {
        if (c.date_of_birth) {
          const dob = new Date(c.date_of_birth);
          const todayDate = new Date();
          const thisYear = todayDate.getFullYear();
          const nextBirthday = new Date(thisYear, dob.getMonth(), dob.getDate());
          if (nextBirthday < todayDate) {
            nextBirthday.setFullYear(thisYear + 1);
          }
          const daysUntil = Math.ceil((nextBirthday.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntil <= 30) {
            upcomingReminders.push({
              id: `birthday-${c.id}`,
              customer_id: c.id,
              reminder_type: 'birthday',
              reminder_date: nextBirthday.toISOString().split('T')[0],
              message: `Birthday in ${daysUntil} days!`,
              is_sent: false,
              created_at: new Date().toISOString(),
              customer: c,
            });
          }
        }

        // Eye test reminder (1 year since last prescription)
        if (c.prescriptions && c.prescriptions.length > 0) {
          const lastPresc = c.prescriptions[0];
          const lastDate = new Date(lastPresc.created_at);
          const nextCheck = new Date(lastDate);
          nextCheck.setFullYear(nextCheck.getFullYear() + 1);
          const daysUntil = Math.ceil((nextCheck.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntil <= 30) {
            upcomingReminders.push({
              id: `eyetest-${c.id}`,
              customer_id: c.id,
              reminder_type: 'eye_test',
              reminder_date: nextCheck.toISOString().split('T')[0],
              message: `Annual eye test due in ${daysUntil} days`,
              is_sent: false,
              created_at: new Date().toISOString(),
              customer: c,
            });
          }
        }
      });

      setReminders(upcomingReminders.sort((a, b) => new Date(a.reminder_date).getTime() - new Date(b.reminder_date).getTime()));
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleMarkSent = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, is_sent: true } : r));
    showToast('Marked as sent');
  };

  const filtered = filterType ? reminders.filter(r => r.reminder_type === filterType) : reminders;
  const birthdays = reminders.filter(r => r.reminder_type === 'birthday');
  const eyeTests = reminders.filter(r => r.reminder_type === 'eye_test');

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-navy-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in-down">
          {toast}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold text-navy-900">Customer Reminders</h1>
        <div className="flex gap-2">
          <button onClick={() => setFilterType('')} className={`px-3 py-2 rounded-lg text-sm ${!filterType ? 'bg-navy-900 text-white' : 'border border-gray-200'}`}>All</button>
          <button onClick={() => setFilterType('birthday')} className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 ${filterType === 'birthday' ? 'bg-navy-900 text-white' : 'border border-gray-200'}`}><Gift size={14} /> Birthdays</button>
          <button onClick={() => setFilterType('eye_test')} className={`px-3 py-2 rounded-lg text-sm flex items-center gap-1 ${filterType === 'eye_test' ? 'bg-navy-900 text-white' : 'border border-gray-200'}`}><Eye size={14} /> Eye Tests</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">Upcoming Reminders</p>
          <p className="text-2xl font-bold text-navy-900">{reminders.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">Birthdays</p>
          <p className="text-2xl font-bold text-navy-900">{birthdays.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">Eye Tests</p>
          <p className="text-2xl font-bold text-navy-900">{eyeTests.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500">This Week</p>
          <p className="text-2xl font-bold text-navy-900">{reminders.filter(r => {
            const d = new Date(r.reminder_date);
            const now = new Date();
            const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            return diff <= 7;
          }).length}</p>
        </div>
      </div>

      {/* Reminders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-800"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Message</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => {
                  const daysUntil = Math.ceil((new Date(r.reminder_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={r.id} className={`border-b hover:bg-gray-50 ${r.is_sent ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-navy-900">{r.customer?.name}</div>
                        <div className="text-xs text-gray-500">{r.customer?.phone}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          r.reminder_type === 'birthday' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {r.reminder_type === 'birthday' ? <Gift size={12} /> : <Eye size={12} />}
                          {r.reminder_type === 'birthday' ? 'Birthday' : 'Eye Test'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-navy-900">{new Date(r.reminder_date).toLocaleDateString('en-IN')}</div>
                        <div className="text-xs text-gray-500">
                          {daysUntil <= 0 ? 'Today!' : daysUntil <= 7 ? `${daysUntil} days` : `${Math.ceil(daysUntil / 7)} weeks`}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.message}</td>
                      <td className="px-4 py-3">
                        {r.is_sent ? (
                          <span className="text-green-600 text-xs flex items-center gap-1"><Check size={12} /> Sent</span>
                        ) : (
                          <span className="text-orange-600 text-xs flex items-center gap-1"><AlertTriangle size={12} /> Pending</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!r.is_sent && (
                          <button onClick={() => handleMarkSent(r.id)} className="text-xs bg-navy-900 text-white px-3 py-1.5 rounded-lg hover:bg-navy-800">
                            Mark Sent
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-500">No upcoming reminders</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
