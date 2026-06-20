import React, { useState } from 'react';
import { Hammer, Save, HelpCircle, Plus, X, Trash2, Edit2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ManpowerConfig = () => {
  const { manpowerRates, updateManpowerRate, addManpowerRate, deleteManpowerRate } = useAppContext();
  const [rates, setRates] = useState(
    manpowerRates.reduce((acc, stage) => {
      acc[stage.id] = stage.unitCost;
      return acc;
    }, {})
  );
  const [isSaved, setIsSaved] = useState(false);
  
  // New Stage State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCost, setNewCost] = useState('');
  
  // Rename State
  const [editingNameId, setEditingNameId] = useState(null);
  const [tempName, setTempName] = useState('');

  React.useEffect(() => {
    if (manpowerRates.length > 0) {
      setRates(manpowerRates.reduce((acc, stage) => {
        acc[stage.id] = stage.unitCost;
        return acc;
      }, {}));
    }
  }, [manpowerRates]);

  const handleChange = (stageId, value) => {
    setRates(prev => ({
      ...prev,
      [stageId]: parseFloat(value) || 0
    }));
    setIsSaved(false);
  };

  const handleSave = () => {
    Object.entries(rates).forEach(([id, cost]) => {
      updateManpowerRate(id, cost);
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleAddNew = async () => {
    if (!newName || !newCost) {
      alert("Please provide both name and cost");
      return;
    }
    await addManpowerRate(newName, parseFloat(newCost));
    setIsAddingNew(false);
    setNewName('');
    setNewCost('');
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this stage? This may affect existing variants.')) {
      deleteManpowerRate(id);
    }
  };

  const startRename = (stage) => {
    setEditingNameId(stage.id);
    setTempName(stage.name);
  };

  const saveRename = async () => {
    if (!tempName) return;
    await updateManpowerRate(editingNameId, rates[editingNameId], tempName);
    setEditingNameId(null);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Hammer color="var(--accent-color)" />
          Global Manpower Rates
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure global baseline unit/hourly costs for each manufacturing stage.</p>
      </div>

      <div className="glass-panel card" style={{ maxWidth: '900px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          {manpowerRates.map((stage) => (
            <div key={stage.id} className="rate-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                {editingNameId === stage.id ? (
                  <div style={{ display: 'flex', gap: '0.25rem', flex: 1 }}>
                    <input 
                      autoFocus
                      type="text" 
                      value={tempName} 
                      onChange={e => setTempName(e.target.value)} 
                      style={{ flex: 1, padding: '0.2rem 0.5rem', fontSize: '0.9rem' }}
                    />
                    <button className="btn btn-primary" style={{ padding: '0.2rem 0.4rem' }} onClick={saveRename}><Save size={14} /></button>
                    <button className="btn btn-secondary" style={{ padding: '0.2rem 0.4rem' }} onClick={() => setEditingNameId(null)}><X size={14} /></button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                      <label style={{ margin: 0, fontWeight: '600', color: 'var(--text-primary)' }}>{stage.name}</label>
                      <button onClick={() => startRename(stage)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px', opacity: 0.6 }}><Edit2 size={14} /></button>
                    </div>
                    <button onClick={() => handleDelete(stage.id)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={16} /></button>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', width: '30px' }}>LKR</span>
                <input 
                   type="number" 
                   step="0.01" 
                   min="0"
                   value={rates[stage.id] === undefined ? '' : rates[stage.id]}
                   placeholder="0.00"
                   onChange={(e) => handleChange(stage.id, e.target.value)}
                   style={{ flex: 1, padding: '0.4rem 0.75rem' }}
                />
              </div>
            </div>
          ))}

          {isAddingNew && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', border: '1px dashed var(--accent-color)', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.05)' }}>
              <input 
                type="text" 
                placeholder="Stage Name (e.g. Quality Check)" 
                value={newName} 
                onChange={e => setNewName(e.target.value)}
                style={{ fontSize: '0.9rem', padding: '0.4rem 0.75rem' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>LKR</span>
                <input 
                  type="number" 
                  placeholder="Cost" 
                  value={newCost} 
                  onChange={e => setNewCost(e.target.value)}
                  style={{ flex: 1, fontSize: '0.9rem', padding: '0.4rem 0.75rem' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button className="btn btn-primary" style={{ padding: '0.4rem', flex: 1 }} onClick={handleAddNew}><Save size={14} /> Add</button>
                <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => setIsAddingNew(false)}><X size={14} /></button>
              </div>
            </div>
          )}

          {!isAddingNew && (
            <button 
              onClick={() => setIsAddingNew(true)}
              style={{ 
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                border: '2px dashed var(--border-color)', borderRadius: '12px', background: 'none',
                color: 'var(--text-secondary)', cursor: 'pointer', height: '100%', minHeight: '80px'
              }}
            >
              <Plus size={24} /> <span>Add New Stage</span>
            </button>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            <HelpCircle size={16} />
            These are global rates. You can assign the needed hours/units per variant in the Cost Config page.
          </div>
          <button className="btn btn-primary" onClick={handleSave} style={{ minWidth: '150px' }}>
            {isSaved ? 'Saved!' : <><Save size={18} /> Update Global Rates</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManpowerConfig;
