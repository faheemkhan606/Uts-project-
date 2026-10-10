import React, { useState } from 'react';
import { Customer, PackagePlan } from '../types/vals';
import { Plus, Search, Building2, User, Phone, Mail, MapPin } from 'lucide-react';

interface Props {
  customers: Customer[];
  packages: PackagePlan[];
  onRefresh: () => void;
}

export const CustomersView: React.FC<Props> = ({ customers, packages, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [customerType, setCustomerType] = useState<'Company' | 'Individual'>('Company');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('+92 300 ');
  const [email, setEmail] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [city, setCity] = useState('Karachi');
  const [creditLimit, setCreditLimit] = useState(250000);
  const [packageId, setPackageId] = useState(packages[0]?.id || '');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          customerType,
          contactPerson: contactPerson || name,
          nationalIdOrReg: `REG-${Math.floor(1000000 + Math.random() * 9000000)}`,
          phone,
          whatsapp: phone,
          email,
          billingAddress,
          city,
          province: city === 'Karachi' ? 'Sindh' : city === 'Lahore' ? 'Punjab' : 'Federal',
          salesRep: 'Omer Farooq',
          accountManager: 'Zubair Sheikh',
          status: 'Active',
          packageId,
          creditLimit: Number(creditLimit),
          paymentTerms: 'Net 30 Days',
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setName('');
        setEmail('');
        setBillingAddress('');
        onRefresh();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create customer');
      }
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
            <span>Customer Core</span>
            <span aria-hidden="true">·</span>
            <span>Accounts &amp; Subscriptions</span>
            <span aria-hidden="true">·</span>
            <span>Server Sequence: CUS-{`{000000}`}</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Customer Accounts &amp; Fleet Clients
          </h2>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer Account</span>
        </button>
      </div>

      {/* Search and Stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer name, ID, phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Showing {filtered.length} of {customers.length} Accounts
        </div>
      </div>

      {/* Table Data */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Account Name</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Phone / WhatsApp</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Credit Limit</th>
                <th className="py-3 px-4">Service Package</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(cus => {
                const pkg = packages.find(p => p.id === cus.packageId);

                return (
                  <tr key={cus.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {cus.customerId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {cus.customerType === 'Company' ? (
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        ) : (
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span className="font-bold text-slate-900">{cus.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">{cus.email}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {cus.contactPerson}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {cus.phone}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {cus.city}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-800 font-medium">
                      PKR {cus.creditLimit.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {pkg?.name || 'Standard'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 font-medium ${
                        cus.status === 'Active' ? 'text-emerald-700' :
                        cus.status === 'Prospect' ? 'text-blue-700' :
                        'text-slate-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          cus.status === 'Active' ? 'bg-emerald-500' :
                          cus.status === 'Prospect' ? 'bg-blue-500' :
                          'bg-slate-400'
                        }`} />
                        {cus.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Create Customer Account
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Account Type</label>
                  <select
                    value={customerType}
                    onChange={e => setCustomerType(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    <option value="Company">Corporate / Company</option>
                    <option value="Individual">Individual Consumer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">City *</label>
                  <select
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    <option value="Karachi">Karachi</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Company / Account Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Atlas Logistics Pakistan (Pvt) Ltd"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Asad Ullah (Fleet Head)"
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Phone / Mobile *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="billing@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Billing &amp; Yard Address</label>
                <input
                  type="text"
                  placeholder="Plot 10, Industrial Estate"
                  value={billingAddress}
                  onChange={e => setBillingAddress(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Credit Limit (PKR)</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={e => setCreditLimit(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Telematics Package</label>
                  <select
                    value={packageId}
                    onChange={e => setPackageId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
