import React, { useState, useEffect } from 'react';
import { Box, Plus, Trash2, Edit2, Save, X, Hammer, Zap, Layout } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const INITIAL_FORM = { rawMaterialId: '', quantity: '' };

const CostConfig = () => {
  const { 
    variants, rawMaterials, manpowerRates, utilityRates,
    getBomForVariant, addMaterialToBom, updateMaterialInBom, deleteMaterialFromBom,
    addLabourToVariant, updateLabourInVariant, deleteLabourFromVariant,
    addUtilityToVariant, updateUtilityInVariant, deleteUtilityFromVariant
  } = useAppContext();
  
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  
  // Material State
  const [isAddingMat, setIsAddingMat] = useState(false);
  const [editingMatId, setEditingMatId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Manpower State
  const [isAddingLabour, setIsAddingLabour] = useState(false);
  const [editingLabourId, setEditingLabourId] = useState(null);
  const [labourFormData, setLabourFormData] = useState({ stageId: '', quantity: '' });

  // Utility State
  const [isAddingUtility, setIsAddingUtility] = useState(false);
  const [editingUtilityId, setEditingUtilityId] = useState(null);
  const [utilityFormData, setUtilityFormData] = useState({ utilityId: '', quantity: '' });

  useEffect(() => {
    if (variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(variants[0]._id || variants[0].id);
    }
  }, [variants, selectedVariantId]);

  const bom = getBomForVariant(selectedVariantId);
  const variant = variants.find(v => (v._id === selectedVariantId || v.id === selectedVariantId));

  const handleVariantChange = (e) => {
    setSelectedVariantId(e.target.value);
    setEditingMatId(null);
    setIsAddingMat(false);
    setEditingLabourId(null);
    setIsAddingLabour(false);
    setEditingUtilityId(null);
    setIsAddingUtility(false);
  };

  /* ----- MATERIAL ACTIONS ----- */
  const handleEditMatClick = (bomEntry) => {
    setEditingMatId(bomEntry.id);
    setFormData({
      rawMaterialId: bomEntry.rawMaterialId,
      quantity: bomEntry.quantity,
    });
    setIsAddingMat(false);
  };

  const handleDeleteMatClick = (id) => {
    if (confirm('Are you sure you want to remove this material from the BOM?')) {
      deleteMaterialFromBom(selectedVariantId, id);
    }
  };

  const handleSaveMat = () => {
    if (!formData.rawMaterialId || !formData.quantity) {
      alert("Please select a material and enter the required consumption quantity.");
      return;
    }

    const payload = {
      rawMaterialId: formData.rawMaterialId,
      quantity: parseFloat(formData.quantity)
    };

    if (editingMatId) {
      updateMaterialInBom(selectedVariantId, editingMatId, payload);
    } else {
      addMaterialToBom(selectedVariantId, payload);
    }

    setEditingMatId(null);
    setIsAddingMat(false);
    setFormData(INITIAL_FORM);
  };

  const calculateTotalMaterials = () => {
    return bom.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0).toFixed(2);
  };

  const selectedRawMaterial = rawMaterials.find(rm => (rm._id === formData.rawMaterialId || rm.id === formData.rawMaterialId));

  const getRawMaterialsByCategory = () => {
    const cats = {};
    rawMaterials.forEach(rm => {
      if (!cats[rm.category]) cats[rm.category] = [];
      cats[rm.category].push(rm);
    });
    return Object.entries(cats);
  };

  /* ----- LABOUR ACTIONS ----- */
  const handleEditLabourClick = (alloc) => {
    setEditingLabourId(alloc._id || alloc.id);
    setLabourFormData({
      stageId: alloc.stageId,
      quantity: alloc.quantity,
    });
    setIsAddingLabour(false);
  };

  const handleDeleteLabourClick = (id) => {
    if (confirm('Are you sure you want to remove this labour stage allocation?')) {
      deleteLabourFromVariant(selectedVariantId, id);
    }
  };

  const handleSaveLabour = () => {
    if (!labourFormData.stageId || labourFormData.quantity === '') {
      alert("Please select a stage and enter the quantity.");
      return;
    }

    if (editingLabourId) {
      updateLabourInVariant(selectedVariantId, editingLabourId, {
        stageId: labourFormData.stageId,
        quantity: parseFloat(labourFormData.quantity)
      });
    } else {
      addLabourToVariant(selectedVariantId, labourFormData.stageId, parseFloat(labourFormData.quantity));
    }

    setEditingLabourId(null);
    setIsAddingLabour(false);
    setLabourFormData({ stageId: '', quantity: '' });
  };

  const calculateTotalLabour = () => {
    if (!variant || !variant.labourAllocations || !Array.isArray(variant.labourAllocations)) return '0.00';
    return variant.labourAllocations.reduce((sum, alloc) => {
      const rate = manpowerRates.find(r => r.id === alloc.stageId || r.stageId === alloc.stageId);
      const unitCost = rate ? rate.unitCost : 0;
      return sum + (alloc.quantity * unitCost);
    }, 0).toFixed(2);
  };

  /* ----- UTILITY ACTIONS ----- */
  const handleEditUtilityClick = (alloc) => {
    setEditingUtilityId(alloc._id || alloc.id);
    setUtilityFormData({
      utilityId: alloc.utilityId,
      quantity: alloc.quantity,
    });
    setIsAddingUtility(false);
  };

  const handleDeleteUtilityClick = (id) => {
    if (confirm('Are you sure you want to remove this utility allocation?')) {
      deleteUtilityFromVariant(selectedVariantId, id);
    }
  };

  const handleSaveUtility = () => {
    if (!utilityFormData.utilityId || utilityFormData.quantity === '') {
      alert("Please select a utility and enter the quantity.");
      return;
    }

    if (editingUtilityId) {
      updateUtilityInVariant(selectedVariantId, editingUtilityId, {
        utilityId: utilityFormData.utilityId,
        quantity: parseFloat(utilityFormData.quantity)
      });
    } else {
      addUtilityToVariant(selectedVariantId, utilityFormData.utilityId, parseFloat(utilityFormData.quantity));
    }

    setEditingUtilityId(null);
    setIsAddingUtility(false);
    setUtilityFormData({ utilityId: '', quantity: '' });
  };

  const calculateTotalUtility = () => {
    if (!variant || !variant.utilityAllocations || !Array.isArray(variant.utilityAllocations)) return '0.00';
    return variant.utilityAllocations.reduce((sum, alloc) => {
      const rate = utilityRates.find(r => r.id === alloc.utilityId || r.utilityId === alloc.utilityId);
      const unitCost = rate ? rate.unitCost : 0;
      return sum + (alloc.quantity * unitCost);
    }, 0).toFixed(2);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Box color="var(--accent-color)" />
          Cost Configuration
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Allocate materials, manpower units, and utilities for each shoe model.</p>
      </div>

      <div className="glass-panel card" style={{ padding: '1.5rem', marginBottom: '-0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layout size={20} color="var(--accent-color)" />
            Step 1: Select Shoe Model
          </h2>
          <select 
            value={selectedVariantId || ''} 
            onChange={handleVariantChange}
            style={{ fontSize: '1.1rem', padding: '0.75rem 1rem', minWidth: '300px' }}
          >
            <option value="">-- Choose a model to configure --</option>
            {variants.map(v => <option key={v._id || v.id} value={v._id || v.id}>{v.modelName} - {v.name}</option>)}
          </select>
        </div>

        {selectedVariantId && (
          <div style={{ textAlign: 'right', background: 'var(--bg-primary)', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', minWidth: '200px' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Total Configured Base Cost</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', verticalAlign: 'middle', marginRight: '0.25rem' }}>LKR</span>
              <span className="stat-value">{(parseFloat(calculateTotalMaterials()) + parseFloat(calculateTotalLabour()) + parseFloat(calculateTotalUtility())).toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* SECTION: MATERIALS */}
      <div className="glass-panel card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', margin: 0 }}>
             <Box size={22} color="var(--danger-color)" /> Material Bill of Materials (BOM)
          </h2>
          <div style={{ fontSize: '1.1rem' }}>
            Material Base Cost: <span style={{ fontWeight: 'bold', color: 'var(--danger-color)' }}>LKR {calculateTotalMaterials()}</span>
          </div>
        </div>

        <div className="table-container">
          <table style={{ width: '100%', minWidth: '700px' }}>
            {/* Same material table as before */}
            <thead>
              <tr>
                <th>Category</th>
                <th>Material Description</th>
                <th>Unit</th>
                <th>Consumption</th>
                <th>Unit Cost (LKR)</th>
                <th>Total (LKR)</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bom.length === 0 && !isAddingMat && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No materials configured for this variant.
                  </td>
                </tr>
              )}
              
              {bom.map(item => (
                <React.Fragment key={item.id}>
                  {editingMatId === item.id ? (
                    <tr style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                      <td colSpan="3">
                        <select 
                          value={formData.rawMaterialId} 
                          onChange={e => setFormData({...formData, rawMaterialId: e.target.value})}
                          style={{ width: '100%' }}
                        >
                          <option value="">-- Select Material --</option>
                          {rawMaterials.map(rm => (
                            <option key={rm._id || rm.id} value={rm._id || rm.id}>{rm.name} ({rm.unit}) - LKR {rm.unitCost.toFixed(2)}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input type="number" step="0.01" min="0" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                      </td>
                      <td>LKR {selectedRawMaterial ? selectedRawMaterial.unitCost.toFixed(2) : '0.00'}</td>
                      <td style={{ fontWeight: 'bold' }}>
                        LKR {selectedRawMaterial ? ((parseFloat(formData.quantity)||0) * selectedRawMaterial.unitCost).toFixed(2) : '0.00'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={handleSaveMat}><Save size={16} /></button>
                          <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setEditingMatId(null)}><X size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td><span style={{ padding: '0.25rem 0.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: '4px', fontSize: '0.8rem', textTransform: 'capitalize' }}>{item.category.replace('_', ' ')}</span></td>
                      <td style={{ fontWeight: '500' }}>{item.name}</td>
                      <td>{item.unit}</td>
                      <td>{item.quantity}</td>
                      <td>LKR {item.unitCost.toFixed(2)}</td>
                      <td style={{ fontWeight: 'bold' }}>LKR {(item.quantity * item.unitCost).toFixed(2)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button onClick={() => handleEditMatClick(item)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', outline: 'none' }}><Edit2 size={18} /></button>
                          <button onClick={() => handleDeleteMatClick(item.id)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', outline: 'none' }}><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

              {isAddingMat && (
                <tr style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <td colSpan="3">
                    <select 
                      value={formData.rawMaterialId} 
                      onChange={e => setFormData({...formData, rawMaterialId: e.target.value})}
                      style={{ width: '100%' }}
                    >
                      <option value="">-- Select Material from Inventory --</option>
                      {getRawMaterialsByCategory().map(([category, items]) => (
                        <optgroup key={category} label={category.toUpperCase()}>
                          {items.map(rm => (
                            <option key={rm._id || rm.id} value={rm._id || rm.id}>{rm.name} [{rm.unit}] - LKR {rm.unitCost.toFixed(2)}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input type="number" step="0.01" min="0" placeholder="Qty Consumed" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                  </td>
                  <td>LKR {selectedRawMaterial ? selectedRawMaterial.unitCost.toFixed(2) : '0.00'}</td>
                  <td style={{ fontWeight: 'bold' }}>
                    LKR {selectedRawMaterial ? ((parseFloat(formData.quantity)||0) * selectedRawMaterial.unitCost).toFixed(2) : '0.00'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-primary" style={{ padding: '0.5rem', backgroundColor: 'var(--success-color)' }} onClick={handleSaveMat}><Save size={16} /></button>
                      <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setIsAddingMat(false)}><X size={16} /></button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!isAddingMat && !editingMatId && (
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={() => { setFormData(INITIAL_FORM); setIsAddingMat(true); }}>
              <Plus size={18} /> Add Component
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* SECTION: MANPOWER */}
        <div className="glass-panel card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', margin: 0 }}>
              <Hammer size={22} color="var(--accent-color)" /> Manpower Allocation
            </h2>
            <div style={{ fontSize: '1.1rem' }}>
              Labour Base Cost: <span style={{ fontWeight: 'bold', color: 'var(--accent-color)' }}>LKR {calculateTotalLabour()}</span>
            </div>
          </div>

          <div className="table-container">
            <table style={{ width: '100%', minWidth: '400px' }}>
              <thead>
                <tr>
                  <th>Stage</th>
                  <th>Baseline Rate</th>
                  <th>Allocated Qty/Hours</th>
                  <th>Total Cost (LKR)</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(!variant || !variant.labourAllocations || variant.labourAllocations.length === 0) && !isAddingLabour && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      No labour stages allocated.
                    </td>
                  </tr>
                )}

                {variant && variant.labourAllocations && variant.labourAllocations.map(alloc => {
                  const rateObj = manpowerRates.find(r => r.id === alloc.stageId || r.stageId === alloc.stageId);
                  const isEditing = editingLabourId === alloc._id || editingLabourId === alloc.id;
                  const unitCost = rateObj ? rateObj.unitCost : 0;
                  const name = rateObj ? rateObj.name : alloc.stageId;
                  const total = alloc.quantity * unitCost;

                  return (
                    <React.Fragment key={alloc._id || alloc.id}>
                      {isEditing ? (
                        <tr style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                          <td>
                            <select
                              value={labourFormData.stageId}
                              onChange={e => setLabourFormData({ ...labourFormData, stageId: e.target.value })}
                              style={{ width: '100%' }}
                            >
                              <option value="">-- Select Stage --</option>
                              {manpowerRates.map(mr => (
                                <option key={mr.id || mr._id} value={mr.id || mr._id}>{mr.name}</option>
                              ))}
                            </select>
                          </td>
                          <td>LKR {unitCost.toFixed(2)}</td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={labourFormData.quantity}
                              onChange={e => setLabourFormData({ ...labourFormData, quantity: e.target.value })}
                              style={{ width: '100%' }}
                            />
                          </td>
                          <td style={{ fontWeight: 'bold' }}>
                            LKR {((parseFloat(labourFormData.quantity) || 0) * unitCost).toFixed(2)}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={handleSaveLabour}><Save size={16} /></button>
                              <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setEditingLabourId(null)}><X size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td style={{ fontWeight: '500' }}>{name}</td>
                          <td>LKR {unitCost.toFixed(2)}</td>
                          <td>{alloc.quantity}</td>
                          <td style={{ fontWeight: 'bold' }}>LKR {total.toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button onClick={() => handleEditLabourClick(alloc)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', outline: 'none' }}><Edit2 size={18} /></button>
                              <button onClick={() => handleDeleteLabourClick(alloc._id || alloc.id)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', outline: 'none' }}><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {isAddingLabour && (
                  <tr style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                    <td>
                      <select
                        value={labourFormData.stageId}
                        onChange={e => setLabourFormData({ ...labourFormData, stageId: e.target.value })}
                        style={{ width: '100%' }}
                      >
                        <option value="">-- Select Stage --</option>
                        {manpowerRates.map(mr => (
                          <option key={mr.id || mr._id} value={mr.id || mr._id}>{mr.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      LKR {(() => {
                        const selected = manpowerRates.find(mr => mr.id === labourFormData.stageId || mr._id === labourFormData.stageId);
                        return selected ? selected.unitCost.toFixed(2) : '0.00';
                      })()}
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Hours/Qty"
                        value={labourFormData.quantity}
                        onChange={e => setLabourFormData({ ...labourFormData, quantity: e.target.value })}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td style={{ fontWeight: 'bold' }}>
                      LKR {(() => {
                        const selected = manpowerRates.find(mr => mr.id === labourFormData.stageId || mr._id === labourFormData.stageId);
                        const rate = selected ? selected.unitCost : 0;
                        return ((parseFloat(labourFormData.quantity) || 0) * rate).toFixed(2);
                      })()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" style={{ padding: '0.5rem', backgroundColor: 'var(--success-color)' }} onClick={handleSaveLabour}><Save size={16} /></button>
                        <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setIsAddingLabour(false)}><X size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!isAddingLabour && !editingLabourId && (
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => { setLabourFormData({ stageId: '', quantity: '' }); setIsAddingLabour(true); }}>
                <Plus size={18} /> Add Stage
              </button>
            </div>
          )}
        </div>

        {/* SECTION: UTILITY */}
        <div className="glass-panel card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', margin: 0 }}>
              <Zap size={22} color="var(--success-color)" /> Utility Allocation
            </h2>
            <div style={{ fontSize: '1.1rem' }}>
              Utility Base Cost: <span style={{ fontWeight: 'bold', color: 'var(--success-color)' }}>LKR {calculateTotalUtility()}</span>
            </div>
          </div>

          <div className="table-container">
            <table style={{ width: '100%', minWidth: '400px' }}>
              <thead>
                <tr>
                  <th>Utility</th>
                  <th>Baseline Rate</th>
                  <th>Allocated Qty</th>
                  <th>Total Cost (LKR)</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(!variant || !variant.utilityAllocations || variant.utilityAllocations.length === 0) && !isAddingUtility && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      No utilities allocated.
                    </td>
                  </tr>
                )}

                {variant && variant.utilityAllocations && variant.utilityAllocations.map(alloc => {
                  const rateObj = utilityRates.find(r => r.id === alloc.utilityId || r.utilityId === alloc.utilityId);
                  const isEditing = editingUtilityId === alloc._id || editingUtilityId === alloc.id;
                  const unitCost = rateObj ? rateObj.unitCost : 0;
                  const name = rateObj ? rateObj.name : alloc.utilityId;
                  const total = alloc.quantity * unitCost;

                  return (
                    <React.Fragment key={alloc._id || alloc.id}>
                      {isEditing ? (
                        <tr style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                          <td>
                            <select
                              value={utilityFormData.utilityId}
                              onChange={e => setUtilityFormData({ ...utilityFormData, utilityId: e.target.value })}
                              style={{ width: '100%' }}
                            >
                              <option value="">-- Select Utility --</option>
                              {utilityRates.map(ur => (
                                <option key={ur.id || ur._id} value={ur.id || ur._id}>{ur.name}</option>
                              ))}
                            </select>
                          </td>
                          <td>LKR {unitCost.toFixed(2)}</td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={utilityFormData.quantity}
                              onChange={e => setUtilityFormData({ ...utilityFormData, quantity: e.target.value })}
                              style={{ width: '100%' }}
                            />
                          </td>
                          <td style={{ fontWeight: 'bold' }}>
                            LKR {((parseFloat(utilityFormData.quantity) || 0) * unitCost).toFixed(2)}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button className="btn btn-primary" style={{ padding: '0.5rem' }} onClick={handleSaveUtility}><Save size={16} /></button>
                              <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setEditingUtilityId(null)}><X size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td style={{ fontWeight: '500' }}>{name}</td>
                          <td>LKR {unitCost.toFixed(2)}</td>
                          <td>{alloc.quantity}</td>
                          <td style={{ fontWeight: 'bold' }}>LKR {total.toFixed(2)}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button onClick={() => handleEditUtilityClick(alloc)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', outline: 'none' }}><Edit2 size={18} /></button>
                              <button onClick={() => handleDeleteUtilityClick(alloc._id || alloc.id)} style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', outline: 'none' }}><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}

                {isAddingUtility && (
                  <tr style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                    <td>
                      <select
                        value={utilityFormData.utilityId}
                        onChange={e => setUtilityFormData({ ...utilityFormData, utilityId: e.target.value })}
                        style={{ width: '100%' }}
                      >
                        <option value="">-- Select Utility --</option>
                        {utilityRates.map(ur => (
                          <option key={ur.id || ur._id} value={ur.id || ur._id}>{ur.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      LKR {(() => {
                        const selected = utilityRates.find(ur => ur.id === utilityFormData.utilityId || ur._id === utilityFormData.utilityId);
                        return selected ? selected.unitCost.toFixed(2) : '0.00';
                      })()}
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Quantity"
                        value={utilityFormData.quantity}
                        onChange={e => setUtilityFormData({ ...utilityFormData, quantity: e.target.value })}
                        style={{ width: '100%' }}
                      />
                    </td>
                    <td style={{ fontWeight: 'bold' }}>
                      LKR {(() => {
                        const selected = utilityRates.find(ur => ur.id === utilityFormData.utilityId || ur._id === utilityFormData.utilityId);
                        const rate = selected ? selected.unitCost : 0;
                        return ((parseFloat(utilityFormData.quantity) || 0) * rate).toFixed(2);
                      })()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" style={{ padding: '0.5rem', backgroundColor: 'var(--success-color)' }} onClick={handleSaveUtility}><Save size={16} /></button>
                        <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setIsAddingUtility(false)}><X size={16} /></button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!isAddingUtility && !editingUtilityId && (
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => { setUtilityFormData({ utilityId: '', quantity: '' }); setIsAddingUtility(true); }}>
                <Plus size={18} /> Add Utility
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostConfig;
