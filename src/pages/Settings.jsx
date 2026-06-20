import React, { useRef } from 'react';
import { Database, AlertCircle, Download, Upload, FileSpreadsheet } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const Settings = () => {
  const { sizes, bulkUpdateSizes } = useAppContext();
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        alert('Invalid CSV format. Need header and at least one row.');
        return;
      }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const sizesData = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
        const obj = {};
        headers.forEach((h, i) => {
          // Normalize header names to match what we expect
          if (h.includes('size')) obj.size = values[i];
          if (h.includes('multiplier')) obj.multiplier = values[i];
          if (h.includes('model')) obj.modelCode = values[i];
          if (h.includes('variant')) obj.variantCode = values[i];
        });
        return {
          size: obj.size,
          multiplier: parseFloat(obj.multiplier),
          modelCode: obj.modelCode,
          variantCode: obj.variantCode
        };
      }).filter(s => s.size && s.modelCode && s.variantCode && !isNaN(s.multiplier));

      if (sizesData.length > 0) {
        try {
          await bulkUpdateSizes(sizesData);
          alert(`Successfully imported/updated ${sizesData.length} sizes from CSV.`);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
          alert('Error updating sizes: ' + err.message);
        }
      } else {
        alert('No valid rows found in CSV. Please ensure you have size, multiplier, modelCode, and variantCode columns.');
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const header = ['size', 'multiplier', 'modelCode', 'variantCode'].join(',') + '\n';
    const rows = sizes.map(s => `"${s.size}",${s.multiplier},"${s.modelCode}","${s.variantCode}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sizes.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Database color="var(--accent-color)" />
          Data Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage master data for shoes variants, materials, and sizes here.</p>
      </div>

      <div className="glass-panel card" style={{ padding: '2rem', borderTop: '4px solid var(--accent-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <FileSpreadsheet size={24} color="var(--accent-color)" />
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Sizes Bulk Management (CSV)</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '600px' }}>
          Export the current sizes configuration to a CSV file (one sheet), modify multipliers or add new size records in your spreadsheet software, and import it back to update the system in bulk.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={handleExport} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Download size={18} />
            Export Sizes CSV
          </button>
          
          <div style={{ width: '1px', height: '2rem', backgroundColor: 'var(--border-color)', margin: '0 0.5rem' }}></div>
          
          <input 
            type="file" 
            accept=".csv" 
            style={{ display: 'none' }} 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <Upload size={18} />
            Import Sizes CSV
          </button>
        </div>
      </div>

      <div className="glass-panel card" style={{ padding: '2rem', textAlign: 'center', marginTop: '1rem' }}>
        <AlertCircle size={48} color="var(--text-secondary)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Other Data Configuration Locked</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
          Other modules are currently in read-only mode for the demonstration. In the full production application, you will be able to add, modify, and delete base cost parameters for materials, labour rates, and energy consumptions here.
        </p>
      </div>
    </div>
  );
};

export default Settings;
