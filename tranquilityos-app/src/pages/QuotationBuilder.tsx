import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuotationBuilder = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  
  // Quote State
  const [customerId, setCustomerId] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [taxRate, setTaxRate] = useState(8.5); // Default tax rate
  
  // Line Items Array
  const [items, setItems] = useState([
    { description: '', quantity: 1, unit_price: 0, total_price: 0 }
  ]);
  
  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  useEffect(() => {
    const fetchCustomers = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setCustomers(await res.json());
    };
    fetchCustomers();
  }, []);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unit_price: 0, total_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return; // Must have at least 1
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];

    if (field === 'description') {
      item.description = value as string;
    } else {
      const val = parseFloat(value as string) || 0;
      if (field === 'quantity') item.quantity = val;
      if (field === 'unit_price') item.unit_price = val;
      
      // Auto-compute line total
      item.total_price = item.quantity * item.unit_price;
    }
    
    setItems(newItems);
  };

  const handleSaveQuotation = async () => {
    if (!customerId) return alert("Please select a customer.");
    if (items.some(i => !i.description)) return alert("Please fill all item descriptions.");

    const token = localStorage.getItem('token');
    try {
      const payload = {
        customer_id: customerId,
        title: title || 'New Proposal',
        items,
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        total,
        notes
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        navigate('/quotations');
      } else {
        alert("Failed to save quotation.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto">
      <button onClick={() => navigate('/quotations')} className="flex items-center gap-2 text-text-muted hover:text-white mb-8 transition-colors">
        <ArrowLeft size={18} /> Back to Quotations
      </button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Quotation Builder</h1>
          <p className="text-text-secondary">Draft detailed service proposals easily.</p>
        </div>
        <button onClick={handleSaveQuotation} className="btn btn-primary shadow-glow flex items-center gap-2">
          <CheckCircle2 size={18} /> Save Proposal
        </button>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold mb-4">Quote Details</h3>
            <div className="space-y-4">
              <div className="input-group mb-0">
                <label className="input-label">Project Title</label>
                <input type="text" className="input-field" placeholder="e.g. Master Bedroom Renovation" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="input-group mb-0">
                <label className="input-label">Assign to Customer *</label>
                <select className="input-field bg-bg-secondary" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="">Select a Customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.company_name ? `(${c.company_name})` : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Line Items</h3>
              <button onClick={handleAddItem} className="btn btn-secondary py-1.5 px-3 flex items-center gap-1 text-sm text-cyan-400">
                <Plus size={16} /> Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 items-start p-4 bg-white/5 border border-border-color rounded-lg relative group">
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Description</label>
                      <input type="text" className="input-field bg-transparent border-b rounded-none px-1" placeholder="Service or product description" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} />
                    </div>
                    <div className="flex gap-4">
                      <div className="w-24">
                        <label className="text-xs text-text-muted mb-1 block">Quantity</label>
                        <input type="number" min="1" className="input-field bg-transparent border-b rounded-none px-1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                      </div>
                      <div className="w-32">
                        <label className="text-xs text-text-muted mb-1 block">Unit Price ($)</label>
                        <input type="number" step="0.01" className="input-field bg-transparent border-b rounded-none px-1" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} />
                      </div>
                      <div className="w-32 ml-auto text-right flex flex-col justify-end">
                        <label className="text-xs text-text-muted mb-1 block">Line Total</label>
                        <div className="text-white font-medium mb-2">${item.total_price.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                  {items.length > 1 && (
                    <button onClick={() => handleRemoveItem(index)} className="absolute top-4 right-4 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-1 space-y-6">
          <div className="glass-card p-6 sticky top-8">
            <h3 className="text-xl font-bold mb-6">Financial Summary</h3>
            
            <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span className="text-white">${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex items-center justify-between text-text-secondary">
                <span>Tax Rate (%)</span>
                <input type="number" step="0.1" className="bg-white/5 border border-border-color rounded px-2 py-1 w-20 text-right text-white outline-none" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Tax Amount</span>
                <span className="text-white">${taxAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-6">
              <span className="text-text-primary font-medium">Grand Total</span>
              <span className="text-3xl font-bold text-accent-primary">${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
            </div>

            <div className="input-group mb-0">
              <label className="text-sm text-text-muted mb-2 block">Customer Notes</label>
              <textarea className="input-field bg-bg-secondary h-24 resize-none" placeholder="Any terms, conditions or personal notes to include." value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationBuilder;
