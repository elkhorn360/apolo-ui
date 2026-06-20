import React, { useState } from 'react';
import { Box, Plus, Trash2, Edit2, Save, X, Layout, Copy, Hammer } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const INITIAL_FORM = { model: '', name: '', modelCode: '', variantCode: '' };

const ManageVariants = () => {
  const { variants, addVariant, deleteVariant, updateVariantName, updateModelDetails, deleteModel } = useAppContext();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editVariantCode, setEditVariantCode] = useState('');
  
  // Model editing state
  const [editingModelName, setEditingModelName] = useState(null);
  const [editModelNameVal, setEditModelNameVal] = useState('');
  const [editModelCodeVal, setEditModelCodeVal] = useState('');

  const [addingVariantToModel, setAddingVariantToModel] = useState(null);
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantCode, setNewVariantCode] = useState('');

  const handleSave = async () => {
    if (!formData.model || !formData.name) {
      alert("Please provide both model name and variant name");
      return;
    }

    await addVariant({
      modelName: formData.model,
      name: formData.name,
      modelCode: formData.modelCode,
      variantCode: formData.variantCode,
      labourAllocations: {},
      utilityAllocations: {},
      bom: []
    });

    setIsAdding(false);
    setFormData(INITIAL_FORM);
  };

  const handleQuickAdd = async (modelName) => {
    if (!newVariantName) return;
    await addVariant({
      modelName: modelName,
      name: newVariantName,
      modelCode: variants.find(v => v.modelName === modelName)?.modelCode || '',
      variantCode: newVariantCode,
      bom: [],
      labourAllocations: {},
      utilityAllocations: {}
    });
    setAddingVariantToModel(null);
    setNewVariantName('');
    setNewVariantCode('');
  };

  const handleDeleteVariant = (variant) => {
    const id = variant._id || variant.id;
    if (confirm(`Are you sure you want to delete the variant "${variant.name}"? This action cannot be undone.`)) {
      deleteVariant(id);
    }
  };

  const startEditModel = (modelName, modelCode) => {
    setEditingModelName(modelName);
    setEditModelNameVal(modelName);
    setEditModelCodeVal(modelCode || '');
  };

  const handleSaveModel = async (oldModelName) => {
    if (!editModelNameVal.trim()) {
      alert("Model Name is required");
      return;
    }
    await updateModelDetails(oldModelName, editModelNameVal.trim(), editModelCodeVal.trim());
    setEditingModelName(null);
  };

  const handleDeleteModel = async (modelName, count) => {
    if (confirm(`Are you sure you want to delete the model "${modelName}" and all its ${count} variant(s)? This action cannot be undone.`)) {
      await deleteModel(modelName);
    }
  };

  const startEdit = (variant) => {
    setEditingId(variant._id || variant.id);
    setEditName(variant.name);
    setEditVariantCode(variant.variantCode || '');
  };

  const saveEdit = async (variant) => {
    if (!editName) return;
    await updateVariantName(
      variant._id || variant.id, 
      editName, 
      variant.modelName, 
      variant.modelCode, 
      editVariantCode
    );
    setEditingId(null);
  };

  const handleDuplicate = async (v) => {
    const newName = prompt(`Enter name for the new variant of ${v.modelName}:`, `${v.name} (Copy)`);
    if (!newName) return;
    
    // variantCode must be unique — leave it blank so the user can set it.
    // Appending "-COPY" would fail on repeated duplicates and when the original code is empty.
    await addVariant({
      modelName: v.modelName,
      name: newName,
      modelCode: v.modelCode,
      variantCode: '',
      bom: v.bom.map(b => ({ rawMaterial: b.rawMaterial?._id || b.rawMaterial, quantity: b.quantity })),
      labourAllocations: v.labourAllocations instanceof Map
        ? Object.fromEntries(v.labourAllocations)
        : (v.labourAllocations || {}),
      utilityAllocations: v.utilityAllocations instanceof Map
        ? Object.fromEntries(v.utilityAllocations)
        : (v.utilityAllocations || {})
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Layout color="var(--accent-color)" />
          Shoe Model Management
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Add, edit, or remove shoe models from the system. Each model can have its own BOM and labor costs.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Product Lineup</h2>
          {!isAdding && (
            <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
              <Plus size={18} /> New Shoe Model
            </button>
          )}
        </div>

        {isAdding && (
          <div className="glass-panel card animate-scale-in" style={{ border: '2px solid var(--accent-color)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Create New Model & Initial Variant</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem' }}>Shoe Model Name</label>
                <input 
                  autoFocus 
                  placeholder="e.g. Classic Runner" 
                  value={formData.model} 
                  onChange={e => setFormData({...formData, model: e.target.value})} 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem' }}>Model Code</label>
                <input 
                  placeholder="e.g. CR-01" 
                  value={formData.modelCode} 
                  onChange={e => setFormData({...formData, modelCode: e.target.value})} 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem' }}>Initial Variant Name</label>
                <input 
                  placeholder="e.g. Original Leather / White" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem' }}>Variant Code</label>
                <input 
                  placeholder="e.g. WHT-01" 
                  value={formData.variantCode} 
                  onChange={e => setFormData({...formData, variantCode: e.target.value})} 
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary" onClick={handleSave}><Save size={18} /> Create Model</button>
              <button className="btn btn-secondary" onClick={() => setIsAdding(false)}><X size={18} /> Cancel</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {variants.length === 0 && !isAdding && (
            <div className="glass-panel card" style={{ textAlign: 'center', padding: '4rem' }}>
              <Layout size={48} color="var(--border-color)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>No shoe models found. Create your first model to begin costing.</p>
              <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setIsAdding(true)}>Create First Model</button>
            </div>
          )}

          {Object.entries(
            variants.reduce((acc, v) => {
              const m = v.modelName || 'Default Model';
              if (!acc[m]) acc[m] = [];
              acc[m].push(v);
              return acc;
            }, {})
          ).map(([model, modelVariants]) => {
            const isEditingModel = editingModelName === model;
            const modelCode = modelVariants[0]?.modelCode || '';
            return (
              <div key={model} className="glass-panel card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Card Header (Model Name) */}
                {isEditingModel ? (
                  <div style={{ 
                    padding: '1.25rem 1.5rem', 
                    backgroundColor: 'rgba(99, 102, 241, 0.12)', 
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '250px' }}>
                      <Layout size={22} color="var(--accent-color)" />
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flex: 1 }}>
                        <div style={{ flex: 2 }}>
                          <input 
                            type="text" 
                            value={editModelNameVal} 
                            onChange={e => setEditModelNameVal(e.target.value)} 
                            placeholder="Model Name"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.95rem' }}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <input 
                            type="text" 
                            value={editModelCodeVal} 
                            onChange={e => setEditModelCodeVal(e.target.value)} 
                            placeholder="Model Code"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.95rem' }}
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--success-color)' }}
                        onClick={() => handleSaveModel(model)}
                      >
                        <Save size={16} /> Save
                      </button>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.8rem' }}
                        onClick={() => setEditingModelName(null)}
                      >
                        <X size={16} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    padding: '1.25rem 1.5rem', 
                    backgroundColor: 'rgba(99, 102, 241, 0.08)', 
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Layout size={22} color="var(--accent-color)" />
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800' }}>
                            {model} {modelCode ? `[${modelCode}]` : ''}
                          </h3>
                          <button 
                            onClick={() => startEditModel(model, modelCode)} 
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', opacity: 0.6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Edit Model Name & Code"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteModel(model, modelVariants.length)} 
                            style={{ background: 'none', border: 'none', color: 'var(--danger-color)', opacity: 0.6, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            title="Delete Model & All Variants"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{modelVariants.length} Variants defined</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                        onClick={() => {
                            setAddingVariantToModel(model);
                            setNewVariantName('');
                        }}
                      >
                        <Plus size={16} /> Add Variant
                      </button>
                    </div>
                  </div>
                )}

                {/* Variants List Inside Card */}
                <div style={{ padding: '0.5rem 0' }}>
                  {modelVariants.map((variant, index) => {
                    const id = variant._id || variant.id;
                    const isEditing = editingId === id;
                    return (
                      <div 
                        key={id} 
                        style={{ 
                          padding: '1rem 1.5rem', 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          borderBottom: index === modelVariants.length - 1 && addingVariantToModel !== model ? 'none' : '1px solid rgba(255,255,255,0.05)',
                          backgroundColor: index % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                              <input 
                                type="text" 
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                placeholder="Variant Name"
                                style={{ width: '200px', padding: '0.25rem 0.6rem', fontSize: '0.9rem' }}
                              />
                              <input 
                                type="text" 
                                value={editVariantCode}
                                onChange={e => setEditVariantCode(e.target.value)}
                                placeholder="Variant Code"
                                style={{ width: '120px', padding: '0.25rem 0.6rem', fontSize: '0.9rem' }}
                              />
                              <button onClick={() => saveEdit(variant)} style={{ color: 'var(--success-color)', background: 'none', border: 'none', cursor: 'pointer' }}><Save size={16} /></button>
                              <button onClick={() => setEditingId(null)} style={{ color: 'var(--danger-color)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={16} /></button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: '600', fontSize: '1.05rem' }}>{variant.name} {variant.variantCode ? `[${variant.variantCode}]` : ''}</span>
                              <button onClick={() => startEdit(variant)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', opacity: 0.5, cursor: 'pointer' }}><Edit2 size={12} /></button>
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                             <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                               <Box size={12} /> {variant.bom?.length || 0} Materials
                             </span>
                             <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                               <Hammer size={12} /> {Object.keys(variant.labourAllocations || {}).length} Labour Steps
                             </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                             onClick={() => handleDuplicate(variant)} 
                             title="Duplicate Variant"
                             className="btn btn-secondary"
                             style={{ padding: '0.5rem', minWidth: 'auto' }}
                          >
                             <Copy size={16} />
                          </button>
                          <button 
                             onClick={() => handleDeleteVariant(variant)} 
                             className="btn btn-secondary" 
                             style={{ padding: '0.5rem', minWidth: 'auto', color: 'var(--danger-color)' }}
                             title="Delete Variant"
                          >
                             <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {/* INLINE QUICK ADD ROW */}
                  {addingVariantToModel === model && (
                    <div style={{ 
                      padding: '1.5rem', 
                      backgroundColor: 'rgba(16, 185, 129, 0.05)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem',
                      borderTop: '1px solid rgba(16, 185, 129, 0.2)'
                    }}>
                      <div style={{ flex: 1, display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--success-color)', marginBottom: '0.25rem', display: 'block' }}>New Variant Name</label>
                          <input 
                            autoFocus
                            placeholder="e.g. Suede / Midnight Blue" 
                            value={newVariantName}
                            onChange={e => setNewVariantName(e.target.value)}
                            style={{ width: '100%', fontSize: '1rem', padding: '0.5rem 0.75rem' }}
                          />
                        </div>
                        <div style={{ width: '150px' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--success-color)', marginBottom: '0.25rem', display: 'block' }}>Variant Code</label>
                          <input 
                            placeholder="e.g. SUE-MB" 
                            value={newVariantCode}
                            onChange={e => setNewVariantCode(e.target.value)}
                            style={{ width: '100%', fontSize: '1rem', padding: '0.5rem 0.75rem' }}
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
                        <button className="btn btn-primary" style={{ backgroundColor: 'var(--success-color)', padding: '0.5rem' }} onClick={() => handleQuickAdd(model)}><Save size={18} /></button>
                        <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setAddingVariantToModel(null)}><X size={18} /></button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ManageVariants;
