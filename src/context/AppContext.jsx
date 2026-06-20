import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

const defaultManpowerRates = [
  { id: 'topCut', name: 'Top Cut', unitCost: 5.00 },
  { id: 'topFinish', name: 'Top Finish', unitCost: 4.50 },
  { id: 'mount', name: 'Mount', unitCost: 6.00 },
  { id: 'sole', name: 'Sole', unitCost: 5.50 },
  { id: 'sockline', name: 'Sockline / Insole / Steep', unitCost: 4.00 },
  { id: 'sprayFinish', name: 'Spray Finish', unitCost: 4.50 }
];

const defaultUtilityRates = [
  { id: 'electricity', name: 'Electricity (kWh)', unitCost: 0.15 },
  { id: 'water', name: 'Water (100L)', unitCost: 0.50 },
  { id: 'steam', name: 'Steam (kg)', unitCost: 0.25 },
  { id: 'air', name: 'Compressed Air (CFM)', unitCost: 0.10 }
];

const initialVariants = [
  { 
    id: 'running_basic', 
    name: 'Running Shoe - Basic', 
    labourAllocations: { topCut: 0.3, topFinish: 0.2, mount: 0.4, sole: 0.3, sockline: 0.2, sprayFinish: 0.2 }, 
    utilityAllocations: { electricity: 10, water: 2, steam: 0, air: 5 }
  },
  { 
    id: 'running_pro', 
    name: 'Running Shoe - Pro', 
    labourAllocations: { topCut: 0.5, topFinish: 0.3, mount: 0.5, sole: 0.4, sockline: 0.3, sprayFinish: 0.3 }, 
    utilityAllocations: { electricity: 15, water: 3, steam: 1, air: 6 }
  },
  { 
    id: 'formal_leather', 
    name: 'Formal Leather Shoe', 
    labourAllocations: { topCut: 0.8, topFinish: 0.6, mount: 0.8, sole: 0.5, sockline: 0.6, sprayFinish: 0.5 }, 
    utilityAllocations: { electricity: 18, water: 1, steam: 0, air: 4 }
  },
  { 
    id: 'casual_canvas', 
    name: 'Casual Canvas', 
    labourAllocations: { topCut: 0.2, topFinish: 0.1, mount: 0.3, sole: 0.2, sockline: 0.1, sprayFinish: 0.2 }, 
    utilityAllocations: { electricity: 8, water: 1, steam: 0, air: 3 }
  }
];

const initialRawMaterials = [
  { id: 'm1', category: 'leather', name: 'Synthetic Mesh', unit: 'sq_ft', unitCost: 1.80 },
  { id: 'm2', category: 'sole', name: 'EVA Foam Outsole', unit: 'pairs', unitCost: 5.00 },
  { id: 'm3', category: 'adhesives', name: 'PU Glue', unit: 'g', unitCost: 0.02 },
  { id: 'm4', category: 'spray', name: 'Finishing Spray', unit: 'ml', unitCost: 0.025 },
  { id: 'm5', category: 'threads', name: 'Nylon Thread 40s', unit: 'm', unitCost: 0.10 },
  { id: 'f1', category: 'leather', name: 'Black Leather Grade 2', unit: 'sq_ft', unitCost: 6.50 },
  { id: 'f2', category: 'leather', name: 'Soft Sheep Lining', unit: 'sq_ft', unitCost: 5.30 },
  { id: 'f3', category: 'sole', name: 'Rubber Soles Classic', unit: 'pairs', unitCost: 12.00 },
  { id: 'f4', category: 'adhesives', name: 'Neoprene Contact Cement', unit: 'g', unitCost: 0.025 },
  { id: 'f5', category: 'spray', name: 'Leather Polish Spray', unit: 'ml', unitCost: 0.05 },
  { id: 'f6', category: 'threads', name: 'Waxed Cotton Thread', unit: 'm', unitCost: 0.20 }
];

const initialBOMs = {
  running_basic: [
    { id: 'b1', rawMaterialId: 'm1', quantity: 2.5 },
    { id: 'b2', rawMaterialId: 'm2', quantity: 1 },
    { id: 'b3', rawMaterialId: 'm3', quantity: 50 },
    { id: 'b4', rawMaterialId: 'm4', quantity: 20 },
    { id: 'b5', rawMaterialId: 'm5', quantity: 15 }
  ],
  formal_leather: [
    { id: 'b6', rawMaterialId: 'f1', quantity: 1.75 },
    { id: 'b7', rawMaterialId: 'f2', quantity: 1.25 },
    { id: 'b8', rawMaterialId: 'f3', quantity: 1 },
    { id: 'b9', rawMaterialId: 'f4', quantity: 60 },
    { id: 'b10', rawMaterialId: 'f5', quantity: 30 },
    { id: 'b11', rawMaterialId: 'f6', quantity: 10 }
  ]
};


// Initial sizes removed in favor of fetching from backend

import api from '../api/api';

export const AppProvider = ({ children }) => {
  const [variants, setVariants] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [manpowerRates, setManpowerRates] = useState([]);
  const [utilityRates, setUtilityRates] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Fetching
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch individually to avoid one fail breaking everything
        try {
          const res = await api.get('/variants');
          setVariants(res.data);
        } catch (e) {
          console.error('Failed to fetch variants:', e);
        }

        try {
          const res = await api.get('/sizes');
          setSizes(res.data);
        } catch (e) {
          console.error('Failed to fetch sizes:', e);
        }

        try {
          const res = await api.get('/raw-materials');
          setRawMaterials(res.data);
        } catch (e) {
          console.error('Failed to fetch raw materials:', e);
        }

        try {
          const res = await api.get('/manpower');
          setManpowerRates(res.data.map(r => ({ ...r, id: r.stageId })));
        } catch (e) {
          console.error('Failed to fetch manpower rates:', e);
        }

        try {
          const res = await api.get('/utilities');
          setUtilityRates(res.data.map(r => ({ ...r, id: r.utilityId })));
        } catch (e) {
          console.error('Failed to fetch utility rates:', e);
        }

      } catch (err) {
        console.error('Data fetching error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Manpower Global Actions
  const updateManpowerRate = async (id, newCost, newName) => {
    try {
      const payload = { unitCost: newCost };
      if (newName) payload.name = newName;
      const res = await api.patch(`/manpower/${id}`, payload);
      setManpowerRates(res.data.map(r => ({ ...r, id: r.stageId })));
    } catch (err) {
      console.error('Error updating manpower rate:', err);
    }
  };

  const addManpowerRate = async (name, unitCost) => {
    try {
      const res = await api.post('/manpower', { name, unitCost });
      setManpowerRates(res.data.map(r => ({ ...r, id: r.stageId })));
    } catch (err) {
      console.error('Error adding manpower rate:', err);
    }
  };

  const deleteManpowerRate = async (id) => {
    try {
      const res = await api.delete(`/manpower/${id}`);
      setManpowerRates(res.data.map(r => ({ ...r, id: r.stageId })));
    } catch (err) {
      console.error('Error deleting manpower rate:', err);
    }
  };

  // Utility Global Actions
  const updateUtilityRate = async (id, newCost, newName) => {
    try {
      const payload = { unitCost: newCost };
      if (newName) payload.name = newName;
      const res = await api.patch(`/utilities/${id}`, payload);
      setUtilityRates(res.data.map(r => ({ ...r, id: r.utilityId })));
    } catch (err) {
      console.error('Error updating utility rate:', err);
    }
  };

  const addUtilityRate = async (name, unitCost) => {
    try {
      const res = await api.post('/utilities', { name, unitCost });
      setUtilityRates(res.data.map(r => ({ ...r, id: r.utilityId })));
    } catch (err) {
      console.error('Error adding utility rate:', err);
    }
  };

  const deleteUtilityRate = async (id) => {
    try {
      const res = await api.delete(`/utilities/${id}`);
      setUtilityRates(res.data.map(r => ({ ...r, id: r.utilityId })));
    } catch (err) {
      console.error('Error deleting utility rate:', err);
    }
  };
  
  // Variant Main Actions
  const addVariant = async (variantData) => {
    try {
      const res = await api.post('/variants', variantData);
      setVariants(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      console.error('Error adding variant:', err);
    }
  };

  const deleteVariant = async (id) => {
    try {
      await api.delete(`/variants/${id}`);
      setVariants(prev => prev.filter(v => (v._id !== id && v.id !== id)));
    } catch (err) {
      console.error('Error deleting variant:', err);
    }
  };

  const updateVariantName = async (id, newName, newModel, modelCode, variantCode) => {
    try {
      const res = await api.put(`/variants/${id}`, { name: newName, modelName: newModel, modelCode, variantCode });
      setVariants(prev => prev.map(v => (v._id === id || v.id === id) ? res.data : v));
    } catch (err) {
      console.error('Error updating variant name:', err);
    }
  };

  const updateModelDetails = async (oldModelName, newModelName, newModelCode) => {
    try {
      const res = await api.put('/variants/model/update', { oldModelName, newModelName, newModelCode });
      setVariants(res.data);
    } catch (err) {
      console.error('Error updating model details:', err);
    }
  };

  const deleteModel = async (modelName) => {
    try {
      await api.delete(`/variants/model/${encodeURIComponent(modelName)}`);
      setVariants(prev => prev.filter(v => v.modelName !== modelName));
    } catch (err) {
      console.error('Error deleting model:', err);
    }
  };

  // Variant Allocation Actions
  const updateVariantLabourAllocations = async (variantId, newAllocations) => {
    try {
      const res = await api.put(`/variants/${variantId}`, { labourAllocations: newAllocations });
      setVariants(prev => prev.map(v => (v._id === variantId || v.id === variantId) ? res.data : v));
    } catch (err) {
      console.error('Error updating labour allocations:', err);
    }
  };

  const updateVariantUtilityAllocations = async (variantId, newAllocations) => {
    try {
      const res = await api.put(`/variants/${variantId}`, { utilityAllocations: newAllocations });
      setVariants(prev => prev.map(v => (v._id === variantId || v.id === variantId) ? res.data : v));
    } catch (err) {
      console.error('Error updating utility allocations:', err);
    }
  };

  const getVariantLabourTotal = (variantId) => {
    const variant = variants.find(v => v._id === variantId || v.id === variantId);
    
    // Check if variant has allocations
    if (!variant || !variant.labourAllocations || Object.keys(variant.labourAllocations).length === 0) {
      if (variant && variant.labourAllocations instanceof Map && variant.labourAllocations.size > 0) {
        // Continue, it has map size > 0
      } else {
        return manpowerRates.reduce((acc, rate) => acc + rate.unitCost, 0);
      }
    }
    
    const allocations = variant.labourAllocations instanceof Map ? Object.fromEntries(variant.labourAllocations) : variant.labourAllocations;

    return manpowerRates.reduce((acc, rate) => {
      const val = allocations[rate.id || rate._id];
      const cost = (val !== undefined && val !== null && val !== '') ? parseFloat(val) : rate.unitCost;
      return acc + cost;
    }, 0);
  };

  const getVariantUtilityTotal = (variantId) => {
    const variant = variants.find(v => v._id === variantId || v.id === variantId);
    
    // Check if variant has allocations
    if (!variant || !variant.utilityAllocations || Object.keys(variant.utilityAllocations).length === 0) {
      if (variant && variant.utilityAllocations instanceof Map && variant.utilityAllocations.size > 0) {
        // Continue
      } else {
        return utilityRates.reduce((acc, rate) => acc + rate.unitCost, 0);
      }
    }

    const allocations = variant.utilityAllocations instanceof Map ? Object.fromEntries(variant.utilityAllocations) : variant.utilityAllocations;

    return utilityRates.reduce((acc, rate) => {
      const val = allocations[rate.id || rate._id];
      const cost = (val !== undefined && val !== null && val !== '') ? parseFloat(val) : rate.unitCost;
      return acc + cost;
    }, 0);
  };

  // Raw Material Actions
  const addRawMaterial = async (material) => {
    try {
      const res = await api.post('/raw-materials', material);
      setRawMaterials(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Error adding raw material:', err);
    }
  };

  const updateRawMaterial = async (id, fields) => {
    try {
      const res = await api.put(`/raw-materials/${id}`, fields);
      setRawMaterials(prev => prev.map(m => (m._id === id || m.id === id) ? res.data : m));
      // Refresh variants if BOM entries were affected by unitCost change
      const variantsRes = await api.get('/variants');
      setVariants(variantsRes.data);
    } catch (err) {
      console.error('Error updating raw material:', err);
    }
  };

  const deleteRawMaterial = async (id) => {
    try {
      await api.delete(`/raw-materials/${id}`);
      setRawMaterials(prev => prev.filter(m => m._id !== id && m.id !== id));
      // Refresh variants if BOM entries were affected
      const variantsRes = await api.get('/variants');
      setVariants(variantsRes.data);
    } catch (err) {
      console.error('Error deleting raw material:', err);
    }
  };

  // Size Actions
  const addSize = async (sizeData) => {
    try {
      const res = await api.post('/sizes', sizeData);
      setSizes(prev => [...prev, res.data]);
    } catch (err) {
      console.error('Error adding size:', err);
    }
  };

  const updateSize = async (id, fields) => {
    try {
      const res = await api.put(`/sizes/${id}`, fields);
      setSizes(prev => prev.map(s => (s._id === id || s.id === id) ? res.data : s));
    } catch (err) {
      console.error('Error updating size:', err);
    }
  };

  const deleteSize = async (id) => {
    try {
      await api.delete(`/sizes/${id}`);
      setSizes(prev => prev.filter(s => s._id !== id && s.id !== id));
    } catch (err) {
      console.error('Error deleting size:', err);
    }
  };

  const bulkUpdateSizes = async (sizesData) => {
    try {
      const res = await api.post('/sizes/bulk', { sizes: sizesData });
      setSizes(res.data);
    } catch (err) {
      console.error('Error in bulk size update:', err);
      throw err;
    }
  };

  // BOM Actions
  const getBomForVariant = (variantId) => {
    const variant = variants.find(v => v._id === variantId || v.id === variantId);
    if (!variant || !variant.bom) return [];
    
    return variant.bom.map(entry => {
      const rm = entry.rawMaterial;
      if (!rm) return null;
      return {
        id: entry._id,
        rawMaterialId: rm._id,
        category: rm.category,
        name: rm.name,
        unit: rm.unit,
        unitCost: rm.unitCost,
        quantity: entry.quantity
      };
    }).filter(Boolean);
  };

  const addMaterialToBom = async (variantId, newBOMEntry) => {
    try {
      const res = await api.post(`/variants/${variantId}/bom`, {
        rawMaterial: newBOMEntry.rawMaterialId,
        quantity: newBOMEntry.quantity
      });
      setVariants(prev => prev.map(v => (v._id === variantId || v.id === variantId) ? res.data : v));
    } catch (err) {
      console.error('Error adding material to BOM:', err);
    }
  };

  const updateMaterialInBom = async (variantId, bomId, updatedFields) => {
    try {
      const res = await api.put(`/variants/${variantId}/bom/${bomId}`, {
        rawMaterial: updatedFields.rawMaterialId,
        quantity: updatedFields.quantity
      });
      setVariants(prev => prev.map(v => (v._id === variantId || v.id === variantId) ? res.data : v));
    } catch (err) {
      console.error('Error updating material in BOM:', err);
    }
  };

  const deleteMaterialFromBom = async (variantId, bomId) => {
    try {
      const res = await api.delete(`/variants/${variantId}/bom/${bomId}`);
      setVariants(prev => prev.map(v => (v._id === variantId || v.id === variantId) ? res.data : v));
    } catch (err) {
      console.error('Error deleting material from BOM:', err);
    }
  };

  const calculateBaseMaterials = (variantId) => {
    const defaultTotals = { leather: 0, sole: 0, adhesives: 0, spray: 0, threads: 0, other: 0 };
    const bom = getBomForVariant(variantId);
    
    return bom.reduce((acc, material) => {
      const cost = material.quantity * material.unitCost;
      if (acc[material.category] !== undefined) {
        acc[material.category] += cost;
      } else {
        acc[material.category] = cost;
      }
      return acc;
    }, defaultTotals);
  };

  return (
    <AppContext.Provider value={{
      variants,
      sizes,
      rawMaterials,
      manpowerRates,
      utilityRates,
      isLoading,
      updateManpowerRate,
      updateUtilityRate,
      addManpowerRate,
      addUtilityRate,
      deleteManpowerRate,
      deleteUtilityRate,
      updateVariantLabourAllocations,
      updateVariantUtilityAllocations,
      getVariantLabourTotal,
      getVariantUtilityTotal,
      addRawMaterial,
      updateRawMaterial,
      deleteRawMaterial,
      getBomForVariant,
      addMaterialToBom,
      updateMaterialInBom,
      deleteMaterialFromBom,
      calculateBaseMaterials,
      addVariant,
      deleteVariant,
      updateVariantName,
      updateModelDetails,
      deleteModel,
      addSize,
      updateSize,
      deleteSize,
      bulkUpdateSizes
    }}>
      {!isLoading ? children : (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p>Loading application data...</p>
        </div>
      )}
    </AppContext.Provider>
  );
};
