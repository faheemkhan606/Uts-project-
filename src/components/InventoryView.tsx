import React, { useState } from 'react';
import { InventoryItem, StockTransaction, Warehouse } from '../types/vals';
import { Plus, Search, Warehouse as WhIcon, ArrowDownRight, ArrowUpRight, AlertTriangle, Layers } from 'lucide-react';

interface Props {
  items: InventoryItem[];
  transactions: StockTransaction[];
  warehouses: Warehouse[];
  onRefresh: () => void;
}

export const InventoryView: React.FC<Props> = ({ items, transactions, warehouses, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'balances' | 'transactions'>('balances');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTxModal, setShowTxModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Transaction Form State
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id || '');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouses[0]?.id || '');
  const [txType, setTxType] = useState<StockTransaction['transactionType']>('Receipt');
  const [quantity, setQuantity] = useState(10);
  const [serialNumber, setSerialNumber] = useState('');
  const [refDocNo, setRefDocNo] = useState('PO-000049');
  const [refDocType, setRefDocType] = useState<StockTransaction['referenceDocType']>('Purchase Order');
  const [performedBy, setPerformedBy] = useState('Muddasir Butt (SCM)');
  const [notes, setNotes] = useState('Standard stock intake');

  const filteredItems = items.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTx = transactions.filter(t =>
    t.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.referenceDocNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExecuteTx = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/inventory/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItemId,
          warehouseId: selectedWarehouseId,
          transactionType: txType,
          quantity: Number(quantity),
          serialNumber: serialNumber || undefined,
          referenceDocType: refDocType,
          referenceDocNo: refDocNo,
          performedBy,
          notes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setShowTxModal(false);
        onRefresh();
      } else {
        alert(data.error || 'Stock transaction failed');
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
            <span>Supply Chain Management</span>
            <span aria-hidden="true">·</span>
            <span>Immutable Stock Ledger</span>
            <span aria-hidden="true">·</span>
            <span>Negative-Balance Barrier Active</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Central Warehousing &amp; Hardware Inventory
          </h2>
        </div>

        <button
          onClick={() => setShowTxModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Execute Stock Transaction</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('balances')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
              activeTab === 'balances' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
            }`}
          >
            Stock Balances &amp; Reorder Levels
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
              activeTab === 'transactions' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600'
            }`}
          >
            Immutable Movement Ledger ({transactions.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search item, transaction, ref doc..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white"
          />
        </div>
      </div>

      {/* Tab 1: Current Stock Balances */}
      {activeTab === 'balances' ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Item Code</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Warehouse Location</th>
                  <th className="py-3 px-4">Unit Cost</th>
                  <th className="py-3 px-4">Reorder Limit</th>
                  <th className="py-3 px-4 text-right">Available Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map(item => {
                  const isLowStock = item.currentStock <= item.minReorderLevel;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {item.itemCode}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {item.name}
                        {item.isSerialised && (
                          <span className="text-[11px] font-normal text-blue-600 block">Serialised Tracking (IMEI/ICCID)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {item.category}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.warehouseName}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-800">
                        PKR {item.unitCost.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                        {item.minReorderLevel} {item.unit}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`font-mono text-sm font-bold tabular-nums ${
                          isLowStock ? 'text-rose-600' : 'text-slate-900'
                        }`}>
                          {item.currentStock} {item.unit}
                        </span>
                        {isLowStock && (
                          <span className="text-[10px] text-rose-600 block font-medium">Reorder Alert</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Tab 2: Immutable Stock Transaction Ledger */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tx Number</th>
                  <th className="py-3 px-4">Item &amp; Warehouse</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Reference Document</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTx.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      {tx.transactionNumber}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{tx.itemName}</span>
                      <span className="text-[11px] text-slate-500">{tx.warehouseName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 font-semibold ${
                        tx.transactionType === 'Receipt' ? 'text-emerald-700' :
                        tx.transactionType === 'Issue' ? 'text-amber-700' :
                        'text-blue-700'
                      }`}>
                        {tx.transactionType === 'Receipt' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 tabular-nums">
                      {tx.transactionType === 'Issue' ? '-' : '+'}{tx.quantity}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800">
                      {tx.referenceDocType}: {tx.referenceDocNo}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {tx.performedBy}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-lg w-full shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Execute Stock Movement Transaction
              </h3>
              <button onClick={() => setShowTxModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteTx} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Select Stock Item *</label>
                <select
                  value={selectedItemId}
                  onChange={e => setSelectedItemId(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                >
                  {items.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.itemCode}) · Balance: {i.currentStock} {i.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Transaction Type *</label>
                  <select
                    value={txType}
                    onChange={e => setTxType(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900 font-medium"
                  >
                    <option value="Receipt">Receipt (Stock In)</option>
                    <option value="Issue">Issue (Stock Out)</option>
                    <option value="Return">Return (Stock In)</option>
                    <option value="Damage">Damage (Stock Out)</option>
                    <option value="Adjustment">Adjustment (+/-)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Target Warehouse</label>
                  <select
                    value={selectedWarehouseId}
                    onChange={e => setSelectedWarehouseId(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Reference Doc Type</label>
                  <select
                    value={refDocType}
                    onChange={e => setRefDocType(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                  >
                    <option value="Purchase Order">Purchase Order</option>
                    <option value="Installation">Installation Order</option>
                    <option value="Maintenance">Maintenance Service</option>
                    <option value="Manual Adjustment">Manual Audit Adjustment</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Reference Document No *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PO-000049"
                  value={refDocNo}
                  onChange={e => setRefDocNo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Audit Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors"
                >
                  {isSubmitting ? 'Posting...' : 'Commit Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
