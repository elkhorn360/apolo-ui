import React, { useState } from 'react';
import { Database, Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const CATEGORIES = [
  { id: 'leather', name: 'Leather & Uppers' },
  { id: 'sole', name: 'Soles & Bottoms' },
  { id: 'adhesives', name: 'Adhesives & Glues' },
  { id: 'spray', name: 'Sprays & Finishes' },
  { id: 'threads', name: 'Sewing Threads' },
  { id: 'packing_accessories', name: 'Packing & Accessories' }
];

const INITIAL_FORM = { category: 'leather', name: '', unit: '', unitCost: '' };

const RawMaterials = () => {
  const { rawMaterials, addRawMaterial, updateRawMaterial, deleteRawMaterial } = useAppContext();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const handleEditClick = (material) => {
    setEditingId(material._id || material.id);
    setFormData({
      category: material.category,
      name: material.name,
      unit: material.unit,
      unitCost: material.unitCost
    });
    setIsAdding(false);
  };

  const handleDeleteClick = (id) => {
    if (confirm('Are you sure you want to remove this raw material? It will be removed from all variant BOMs.')) {
      deleteRawMaterial(id);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.unit || !formData.unitCost) {
      alert("Please fill all fields");
      return;
    }

    const payload = {
      ...formData,
      unitCost: parseFloat(formData.unitCost)
    };

    if (editingId) {
      updateRawMaterial(editingId, payload);
    } else {
      addRawMaterial(payload);
    }

    setEditingId(null);
    setIsAdding(false);
    setFormData(INITIAL_FORM);
  };

  // Grouping raw materials by category for better display
  const materialsByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat.id] = rawMaterials.filter(m => m.category === cat.id);
    return acc;
  }, {});

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Database color="var(--accent-color)" />
          Raw Materials Inventory
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage the complete list of factory raw materials and their base unit costs.</p>
      </div>

      <div className="glass-panel card">
        <div className="table-container">
          <table style={{ width: '100%', minWidth: '700px' }}>
            <thead>
              <tr>
                <th>Category</th>
                <th>Material Description</th>
                <th>Unit</th>
                <th>Unit Cost (LKR)</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rawMaterials.length === 0 && !isAdding && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No raw materials found. Click "Add New Material" to create one.
                  </td>
                </tr>
              )}

              {/* Loop through categories to render grouped */}
              {CATEGORIES.map(category => (
                <React.Fragment key={category.id}>
                  {materialsByCategory[category.id].map(item => (
                    <React.Fragment key={item._id || item.id}>
                      {editingId === (item._id || item.id) ? (
                        <tr style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                          <td>
                            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </td>
                          <td>
                            <input type="text" placeholder="e.g. Black leather grade 2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                          </td>
                          <td>
                            <input type="text" placeholder="e.g. sq_ft" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                          </td>
                          <td>
                            <input type="number" step="0.01" min="0" value={formData.unitCost} onChange={e => setFormData({...formData, unitCost: e.target.value})} />
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={handleSave}><Save size={16} /></button>
                              <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setEditingId(null)}><X size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td><span style={{ padding: '0.25rem 0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', fontSize: '0.8rem' }}>{category.name}</span></td>
                          <td style={{ fontWeight: '500' }}>{item.name}</td>
                          <td>{item.unit}</td>
                          <td style={{ fontWeight: 'bold' }}>LKR {item.unitCost.toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button onClick={() => handleEditClick(item)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', outline: 'none' }}><Edit2 size={18} /></button>
                              <button onClick={() => handleDeleteClick(item._id || item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', outline: 'none' }}><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}

              {isAdding && (
                <tr style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <td>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </td>
                  <td>
                    <input autoFocus type="text" placeholder="e.g. Black leather grade 2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </td>
                  <td>
                    <input type="text" placeholder="e.g. sq_ft" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                  </td>
                  <td>
                    <input type="number" step="0.01" min="0" placeholder="Price" value={formData.unitCost} onChange={e => setFormData({...formData, unitCost: e.target.value})} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary" style={{ padding: '0.5rem', backgroundColor: 'var(--success-color)' }} onClick={handleSave}><Save size={16} /></button>
                      <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setIsAdding(false)}><X size={16} /></button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!isAdding && !editingId && (
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <button 
              className="btn btn-primary" 
              onClick={() => { setFormData(INITIAL_FORM); setIsAdding(true); }}
            >
              <Plus size={18} /> Add New Material
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RawMaterials;
