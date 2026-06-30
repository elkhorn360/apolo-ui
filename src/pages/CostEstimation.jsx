import React, { useState } from 'react';
import { DollarSign, Zap, Hammer, Box, Component, Settings2, Layout, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const CostEstimation = () => {
  const { variants, calculateBaseMaterials, getVariantLabourTotal, getVariantUtilityTotal, manpowerRates, utilityRates } = useAppContext();
  
  const [selectedVariantId, setSelectedVariantId] = useState('');
  
  React.useEffect(() => {
    if (variants.length > 0 && !selectedVariantId) {
      setSelectedVariantId(variants[0]._id || variants[0].id);
    }
  }, [variants, selectedVariantId]);
  
  const [materialOverrides, setMaterialOverrides] = useState({});
  const [labourOverrides, setLabourOverrides] = useState({});
  const [utilityOverrides, setUtilityOverrides] = useState({});

  const variant = variants.find(v => (v._id === selectedVariantId || v.id === selectedVariantId)) || variants[0];
  const sizeFactor = 1.0;

  // Calculate dynamic base materials from Context (BOM)
  const baseMaterials = variant ? calculateBaseMaterials(variant._id || variant.id) : { leather: 0, sole: 0, adhesives: 0, spray: 0, threads: 0, other: 0 };

  // Calculate material parts
  const calculateMaterialPart = (key) => {
    return materialOverrides[key] !== undefined && materialOverrides[key] !== '' ? parseFloat(materialOverrides[key]) : (baseMaterials[key] || 0) * sizeFactor;
  };

  // Calculate costs
  const materialCost = Object.keys(baseMaterials).reduce((acc, key) => acc + calculateMaterialPart(key), 0);
  // Calculate labour cost from overrides or variant allocations
  const calculateLabourPart = (alloc) => {
    const rateObj = manpowerRates.find(r => r.id === alloc.stageId || r.stageId === alloc.stageId);
    if (labourOverrides[alloc.stageId] !== undefined && labourOverrides[alloc.stageId] !== '') {
      return parseFloat(labourOverrides[alloc.stageId]);
    }
    return alloc.quantity * (rateObj ? rateObj.unitCost : 0);
  };

  const labourCost = (variant?.labourAllocations || []).reduce((acc, alloc) => acc + calculateLabourPart(alloc), 0);

  // Calculate dynamic utility from overrides or variant allocations
  const calculateUtilityPart = (alloc) => {
    const rateObj = utilityRates.find(r => r.id === alloc.utilityId || r.utilityId === alloc.utilityId);
    if (utilityOverrides[alloc.utilityId] !== undefined && utilityOverrides[alloc.utilityId] !== '') {
      return parseFloat(utilityOverrides[alloc.utilityId]);
    }
    return alloc.quantity * (rateObj ? rateObj.unitCost : 0);
  };

  const energyCost = (variant?.utilityAllocations || []).reduce((acc, alloc) => acc + calculateUtilityPart(alloc), 0);
  
  const totalCost = materialCost + labourCost + energyCost;

  const handleVariantChange = (e) => {
    setSelectedVariantId(e.target.value);
    setMaterialOverrides({});
    setLabourOverrides({});
    setUtilityOverrides({});
  };

  const handleExportAll = () => {
    let csv = "Model Code,Variant Code,Model Name,Variant Name,Size,Multiplier,Material Cost (LKR),Labour Cost (LKR),Utility Cost (LKR),Total Cost (LKR)\n";
    
    variants.forEach(v => {
      let variantSizes = sizes.filter(s => s.modelCode === v.modelCode && s.variantCode === v.variantCode);
      if (variantSizes.length === 0) {
        variantSizes = sizes.length > 0 ? sizes : [{ size: 'Default', multiplier: 1.0 }];
      }

      const baseMats = calculateBaseMaterials(v._id || v.id);
      
      const lCost = (v.labourAllocations || []).reduce((acc, alloc) => {
        const rate = manpowerRates.find(r => r.id === alloc.stageId || r.stageId === alloc.stageId);
        const unitCost = rate ? rate.unitCost : 0;
        return acc + (alloc.quantity * unitCost);
      }, 0);
      
      const uCost = (v.utilityAllocations || []).reduce((acc, alloc) => {
        const rate = utilityRates.find(r => r.id === alloc.utilityId || r.utilityId === alloc.utilityId);
        const unitCost = rate ? rate.unitCost : 0;
        return acc + (alloc.quantity * unitCost);
      }, 0);

      variantSizes.forEach(s => {
        const mCost = Object.values(baseMats).reduce((acc, val) => acc + (val * s.multiplier), 0);
        const total = mCost + lCost + uCost;
        
        csv += `"${v.modelCode || ''}","${v.variantCode || ''}","${v.modelName || ''}","${v.name || ''}","${s.size}",${s.multiplier},${mCost.toFixed(2)},${lCost.toFixed(2)},${uCost.toFixed(2)},${total.toFixed(2)}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'all_models_cost_estimation.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const setMaterialOverride = (key, value) => {
    setMaterialOverrides(prev => ({ ...prev, [key]: value }));
  };

  const renderMaterialInput = (key, label, value, OverrideValue) => {
    const defaultVal = (baseMaterials[key] || 0) * sizeFactor;
    return (
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <label style={{ margin: 0 }}>{label}</label>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>LKR {value.toFixed(2)}</span>
        </div>
        <input 
          type="number" 
          placeholder={`Base: LKR ${defaultVal.toFixed(2)}`} 
          value={OverrideValue}
          onChange={(e) => setMaterialOverride(key, e.target.value)}
          step="0.01"
          min="0"
          style={{ padding: '0.5rem', fontSize: '0.85rem' }}
        />
      </div>
    );
  };

  const renderLabourInput = (key, label, value, OverrideValue, quantity, unitCost) => {
    const defaultCost = quantity * unitCost;

    return (
      <div style={{ marginBottom: '1rem' }} key={key}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <label style={{ margin: 0 }}>{label} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({quantity} hrs/qty × LKR {unitCost.toFixed(2)})</span></label>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>LKR {value.toFixed(2)}</span>
        </div>
        <input 
          type="number" 
          placeholder={`Base: LKR ${defaultCost.toFixed(2)}`} 
          value={OverrideValue}
          onChange={(e) => setLabourOverrides(prev => ({ ...prev, [key]: e.target.value }))}
          step="0.01"
          min="0"
          style={{ padding: '0.5rem', fontSize: '0.85rem' }}
        />
      </div>
    );
  };

  const renderUtilityInput = (key, label, value, OverrideValue, quantity, unitCost) => {
    const defaultCost = quantity * unitCost;

    return (
      <div style={{ marginBottom: '1rem' }} key={key}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <label style={{ margin: 0 }}>{label} <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>({quantity} × LKR {unitCost.toFixed(2)})</span></label>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>LKR {value.toFixed(2)}</span>
        </div>
        <input 
          type="number" 
          placeholder={`Base: LKR ${defaultCost.toFixed(2)}`} 
          value={OverrideValue}
          onChange={(e) => setUtilityOverrides(prev => ({ ...prev, [key]: e.target.value }))}
          step="0.01"
          min="0"
          style={{ padding: '0.5rem', fontSize: '0.85rem' }}
        />
      </div>
    );
  };

  if (!variant) return <div style={{ padding: '2rem' }}>Loading Configuration...</div>;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Settings2 color="var(--accent-color)" />
            Cost Estimation Module
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Select a product variant to generate manufacturing cost estimates.</p>
        </div>
        <button className="btn btn-primary" onClick={handleExportAll} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Download size={18} />
          Export All Breakdowns (CSV)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Configuration Panel */}
        <div className="glass-panel card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Shoe Model Selection</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <label style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Select Model</label>
            <select 
              value={selectedVariantId} 
              onChange={handleVariantChange}
              style={{ fontSize: '1.1rem', padding: '0.75rem 1rem' }}
            >
              <option value="">-- Choose a model --</option>
              {variants.map(v => <option key={v._id || v.id} value={v._id || v.id}>{v.modelName} - {v.name}</option>)}
            </select>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <label style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Available Sizes</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {variant?.sizes && variant.sizes.length > 0 ? (
                variant.sizes.map(sz => (
                  <span
                    key={sz}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '999px',
                      background: 'linear-gradient(135deg, rgba(99,102,241,0.18), rgba(139,92,246,0.18))',
                      border: '1px solid rgba(139,92,246,0.35)',
                      color: 'var(--accent-color)',
                      fontSize: '0.88rem',
                      fontWeight: '600',
                      letterSpacing: '0.03em'
                    }}
                  >
                    EU {sz}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No sizes assigned to this variant.</span>
              )}
            </div>
          </div>
        </div>

        {/* Total Cost Summary */}
        <div className="glass-panel card" style={{ background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))' }}>
          <div className="card-header">
            <h2 className="card-title">Total Estimated Cost</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: 'calc(100% - 60px)' }}>
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', verticalAlign: 'top' }}>LKR </span>
              <span className="stat-value" style={{ fontSize: '4rem' }}>{totalCost.toFixed(2)}</span>
              <span style={{ color: 'var(--text-secondary)' }}> / pair</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--danger-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>LKR {materialCost.toFixed(2)}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Material</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--accent-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>LKR {labourCost.toFixed(2)}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Labour</div>
              </div>
              <div style={{ width: '1px', background: 'var(--border-color)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'var(--success-color)', fontSize: '1.25rem', fontWeight: 'bold' }}>LKR {energyCost.toFixed(2)}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Utility</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginTop: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        Cost Breakdown & Overrides
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        {/* Material Cost Breakdown */}
        <div className="glass-panel card" style={{ borderTop: '4px solid var(--danger-color)' }}>
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title"><Box size={22} color="var(--danger-color)" /> Material breakdown</h3>
            <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--danger-color)' }}>LKR {materialCost.toFixed(2)}</span>
          </div>
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Configure base values in Material Config. Adjust here for custom batch cost overrides.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {Object.keys(baseMaterials).map(key => 
                renderMaterialInput(key, key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '), calculateMaterialPart(key), materialOverrides[key] !== undefined ? materialOverrides[key] : '')
              )}
            </div>
            
            {Object.values(materialOverrides).some(val => val !== '') && (
              <button 
                onClick={() => setMaterialOverrides({})} 
                style={{ fontSize: '0.8rem', color: 'var(--danger-color)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem', textDecoration: 'underline' }}
              >
                Reset all materials to calculated defaults
              </button>
            )}
          </div>
        </div>

        {/* Labour & Energy Stacked container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Labour Cost */}
          <div className="glass-panel card" style={{ borderTop: '4px solid var(--accent-color)' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title"><Hammer size={22} color="var(--accent-color)" /> Labour</h3>
              <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--accent-color)' }}>LKR {labourCost.toFixed(2)}</span>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Base unit rates from Manpower Config. Adjust custom overrides per stage. The final cost will be re-calculated automatically based on the allocated quantity.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {(variant?.labourAllocations || []).map(alloc => {
                    const rateObj = manpowerRates.find(r => r.id === alloc.stageId || r.stageId === alloc.stageId);
                    const name = rateObj ? rateObj.name : alloc.stageId;
                    const calculated = calculateLabourPart(alloc);
                    return renderLabourInput(alloc.stageId, name, calculated, labourOverrides[alloc.stageId] !== undefined ? labourOverrides[alloc.stageId] : '', alloc.quantity, rateObj?.unitCost || 0);
                })}
              </div>

              {Object.values(labourOverrides).some(val => val !== '') && (
                <button 
                  onClick={() => setLabourOverrides({})} 
                  style={{ fontSize: '0.8rem', color: 'var(--accent-color)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem', textDecoration: 'underline' }}
                >
                  Reset all labour to calculated defaults
                </button>
              )}
            </div>
          </div>

          {/* Utility Cost */}
          <div className="glass-panel card" style={{ borderTop: '4px solid var(--success-color)' }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="card-title"><Zap size={22} color="var(--success-color)" /> Utility</h3>
              <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--success-color)' }}>LKR {energyCost.toFixed(2)}</span>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Base unit rates from Utility Config. Adjust custom overrides per process. The final cost will be grouped together inherently.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {(variant?.utilityAllocations || []).map(alloc => {
                    const rateObj = utilityRates.find(r => r.id === alloc.utilityId || r.utilityId === alloc.utilityId);
                    const name = rateObj ? rateObj.name : alloc.utilityId;
                    const calculated = calculateUtilityPart(alloc);
                    return renderUtilityInput(alloc.utilityId, name, calculated, utilityOverrides[alloc.utilityId] !== undefined ? utilityOverrides[alloc.utilityId] : '', alloc.quantity, rateObj?.unitCost || 0);
                })}
              </div>

              {Object.values(utilityOverrides).some(val => val !== '') && (
                <button 
                  onClick={() => setUtilityOverrides({})} 
                  style={{ fontSize: '0.8rem', color: 'var(--success-color)', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem', textDecoration: 'underline' }}
                >
                  Reset all utilities to calculated defaults
                </button>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CostEstimation;
