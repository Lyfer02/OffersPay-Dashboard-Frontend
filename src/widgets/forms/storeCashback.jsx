import React, { useEffect, useState } from 'react';

export const StoreCashbackRate = ({ initialRates = [], onRatesChange }) => {
    const [rates, setRates] = useState(initialRates.length > 0 ? initialRates : [{
        id: 1,
        title: '',
        description: '',
        rateType: '',
        commission: '',
        enabled: true,
        isManual: false,
        lockTitle: false
      }]);
    const addNewItem = () => {
        const newItem = {
        id: rates.length + 1,
        title: '',
        description: '',
        rateType: '',
        commission: '',
        enabled: true,
        isManual: false,
        lockTitle: false
        };
        setRates([...rates, newItem]);
    };

    const removeItem = (id) => {
        setRates(rates.filter(rate => rate.id !== id));
    };

    const handleChange = (id, field, value) => {
        setRates(rates.map(rate => {
        if (rate.id === id) {
            return { ...rate, [field]: value };
        }
        return rate;
        }));
    };

  // Custom toggle switch component
  const ToggleSwitch = ({ enabled, onChange }) => (
    <div 
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
      onClick={onChange}
    >
      <div 
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0'}`} 
      />
    </div>
  );

   // Update parent component when rates change
   useEffect(() => {
    if (onRatesChange) {
      onRatesChange([...rates]);
    }
  }, [rates, onRatesChange]);


  return (
    <div className="w-full py-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Store Cashback Rates</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        {/* Header for desktop */}
        <div className="hidden md:grid md:grid-cols-7 gap-4 p-4 bg-gray-50 font-medium text-sm">
          <div>Title</div>
          <div>Description</div>
          <div>Rate Type</div>
          <div>Commission</div>
          <div className="text-center">Enabled</div>
          <div className="text-center">Is Manual</div>
          <div className="text-center">Lock Title</div>
        </div>
        
        {/* Responsive container for rates */}
        <div className="divide-y divide-gray-200 my-2">
          {rates.map((rate) => (
            <div key={rate.id} className="p-4">
              {/* Mobile header (only visible on small screens) */}
              <div className="md:hidden font-medium mb-3 text-lg border-b pb-2 border-gray-200">
                Rate #{rate.id}
              </div>
              
              {/* Grid layout that's responsive */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {/* Mobile labels are shown beside inputs on small screens */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 md:hidden">Title</label>
                  <input
                    type="text"
                    placeholder="Title"
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    value={rate.title}
                    onChange={(e) => handleChange(rate.id, 'title', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 md:hidden">Description</label>
                  <input
                    type="text"
                    placeholder="Description"
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    value={rate.description}
                    onChange={(e) => handleChange(rate.id, 'description', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 md:hidden">Rate Type</label>
                  <select
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    value={rate.rateType}
                    onChange={(e) => handleChange(rate.id, 'rateType', e.target.value)}
                  >
                    <option value="">Select type</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 md:hidden">Commission</label>
                  <input
                    type="text"
                    placeholder="Commission"
                    className="w-full border border-gray-300 rounded p-2 text-sm"
                    value={rate.commission}
                    onChange={(e) => handleChange(rate.id, 'commission', e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="block text-sm font-medium text-gray-700 md:hidden">Enabled</label>
                  <div className="flex justify-center md:justify-start">
                    <ToggleSwitch 
                      enabled={rate.enabled} 
                      onChange={() => handleChange(rate.id, 'enabled', !rate.enabled)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <label className="block text-sm font-medium text-gray-700 md:hidden">Is Manual</label>
                  <div className="flex justify-center md:justify-start">
                    <ToggleSwitch 
                      enabled={rate.isManual} 
                      onChange={() => handleChange(rate.id, 'isManual', !rate.isManual)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <label className="block text-sm font-medium text-gray-700 md:hidden">Lock Title</label>
                    <ToggleSwitch 
                      enabled={rate.lockTitle} 
                      onChange={() => handleChange(rate.id, 'lockTitle', !rate.lockTitle)}
                    />
                  </div>
                  
                  <button 
                    className="bg-red-500 hover:bg-red-600 text-white rounded p-2 h-8 w-8 flex items-center justify-center transition-colors"
                    onClick={(e) => {
                        e.preventDefault();
                        removeItem(rate.id)}}
                    title="Remove Item"
                  >
                    <span className="text-sm">−</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <button 
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center transition-colors"
        onClick={(e)=>{
            e.preventDefault();
            addNewItem()}}
      >
        <span className="mr-1">+</span> Add New Rate
      </button>
    </div>
  );
};

export default StoreCashbackRate;