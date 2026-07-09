import React, { useCallback, useEffect, useState } from 'react'
import { X,Eye } from 'lucide-react'
import 'react-quill/dist/quill.snow.css'; // Import Quill styles 
import { FullSizeImageModal, StoreAdditionalInfo, StoreCashbackRate } from '.';

export const StoreForm=({ onClose, onSubmit ,initialStore = null})=> {

  // In StoreForm.jsx, add state for cashback rates
const [cashbackRates, setCashbackRates] = useState(initialStore?.cashbackRates || []);



  const [newStore, setNewStore] = useState({
    id: null,
    name: '',
    slogan: '',
    logo: null,
    banner: null,
    homepage: '',
    domainName: '',
    category: '',
    deeplink: '',
    cashbackEarn: '',
    cashbackPercentage: '',
    cashbackType: 'cashback',
    trackingSpeed: '',
    confirmDuration: '',
    isClaimable: false,
    isSharable: false,
    isFeaturable: false,
    excludeSitemap: false,
    network: 'mock',
    networkComplainId: '',
    ghost: '',
    status: 'draft'
})

// State for image previews
const [previews, setPreviews] = useState({
    logo: null,
    banner: null
})

// State for full-size image modal
const [fullSizeImage, setFullSizeImage] = useState({
    type: null,
    src: null
})

// State for additional store info
const [additionalStoreInfo, setAdditionalStoreInfo] = useState({
    heading1: '',
    heading2: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    termsTodo: '',
    termsNotTodo: '',
    about: ''
});

const completeStoreData = {
  ...newStore,
  additionalInfo: additionalStoreInfo
};

// Effect to populate form when editing an existing store
useEffect(() => {
    if (initialStore) {
        const updatedStore = {
            ...initialStore,
            logo: initialStore.logo || null,
            banner: initialStore.banner || null,
            cashbackPercentage: initialStore.cashbackPercentage || '',
            isClaimable: initialStore.isClaimable || false,
            isSharable: initialStore.isSharable || false,
            isFeaturable: initialStore.isFeaturable || false,
            excludeSitemap: initialStore.excludeSitemap || false
        }
        setNewStore(updatedStore)

        // Set initial previews if existing images
        const updatePreviews = {}
        if (initialStore.logo) {
            updatePreviews.logo = typeof initialStore.logo === 'string' 
                ? initialStore.logo 
                : URL.createObjectURL(initialStore.logo)
        }
        if (initialStore.banner) {
            updatePreviews.banner = typeof initialStore.banner === 'string' 
                ? initialStore.banner 
                : URL.createObjectURL(initialStore.banner)
        }
        setPreviews(prev => ({...prev, ...updatePreviews}))
        
        // If initialStore has additionalInfo property, populate additional info state
        if (initialStore.additionalInfo) {
            setAdditionalStoreInfo(prev => ({
                ...prev,
                ...initialStore.additionalInfo
            }));
        }

        // If initialStore has cashbackRates property, populate rates state
        if (initialStore.cashbackRates) {
          setCashbackRates(initialStore.cashbackRates);
      }
      // If initialStore has additionalInfo property, populate additional info state
      if (initialStore.additionalInfo) {
        setAdditionalStoreInfo({
            heading1: initialStore.additionalInfo.heading1 || '',
            heading2: initialStore.additionalInfo.heading2 || '',
            metaTitle: initialStore.additionalInfo.metaTitle || '',
            metaDescription: initialStore.additionalInfo.metaDescription || '',
            metaKeywords: initialStore.additionalInfo.metaKeywords || '',
            termsTodo: initialStore.additionalInfo.termsTodo || '',
            termsNotTodo: initialStore.additionalInfo.termsNotTodo || '',
            about: initialStore.additionalInfo.about || ''
        });
    }
    }
}, [initialStore])

const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target
    
    if (type === 'file') {
        const file = files[0]
        
        // Clear any previous object URLs to prevent memory leaks
        if (previews[name]) {
            URL.revokeObjectURL(previews[name])
        }

        if (file) {
            // Create a new object URL for the file
            const objectUrl = URL.createObjectURL(file)
            
            // Update both newStore and previews
            setNewStore(prev => ({
                ...prev,
                [name]: file
            }))
            
            setPreviews(prev => ({
                ...prev,
                [name]: objectUrl
            }))
        } else {
            // Clear both newStore and previews if no file
            setNewStore(prev => ({
                ...prev,
                [name]: null
            }))
            
            setPreviews(prev => ({
                ...prev,
                [name]: null
            }))
        }
    } else {
        setNewStore(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }
}

// Handle additional info input changes
const handleAdditionalInputChange = (e) => {
    const { name, value } = e.target;
    setAdditionalStoreInfo(prev => ({
        ...prev,
        [name]: value
    }));
};

// Handle rich text editor changes
const handleRichTextChange = (value, name) => {
    setAdditionalStoreInfo(prev => ({
        ...prev,
        [name]: value
    }));
};

const handleSubmit = (e) => {
  e.preventDefault();
  
  // Create a complete store data object with all information
  const completeStoreData = {
      ...newStore,
      additionalInfo: {
          heading1: additionalStoreInfo.heading1,
          heading2: additionalStoreInfo.heading2,
          metaTitle: additionalStoreInfo.metaTitle,
          metaDescription: additionalStoreInfo.metaDescription,
          metaKeywords: additionalStoreInfo.metaKeywords,
          termsTodo: additionalStoreInfo.termsTodo,
          termsNotTodo: additionalStoreInfo.termsNotTodo,
          about: additionalStoreInfo.about
      },
      cashbackRates: cashbackRates
  };
  // Submit the complete data
  onSubmit(completeStoreData);
  onClose();
};

const openFullSizeImage = (type) => {
    setFullSizeImage({
        type,
        src: previews[type]
    })
}

const closeFullSizeImage = () => {
    setFullSizeImage({
        type: null,
        src: null
    })
}

const removeImage = (type) => {
    // Revoke previous object URL to prevent memory leaks
    if (previews[type]) {
        URL.revokeObjectURL(previews[type])
    }

    setNewStore(prev => ({
        ...prev,
        [type]: null
    }))
    setPreviews(prev => ({
        ...prev,
        [type]: null
    }))
}

const handleCashbackRatesChange = useCallback((updatedRates) => {
  console.log("Rates updated:", updatedRates);
  setCashbackRates(updatedRates);
}, []);

// Cleanup object URLs when component unmounts
useEffect(() => {
    return () => {
        // Cleanup any remaining object URLs
        Object.values(previews).forEach(preview => {
            if (preview) {
                URL.revokeObjectURL(preview)
            }
        })
    }
}, [])


  return (
    <>
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg w-full m-10 max-w-7xl max-h-[90vh] overflow-y-auto p-6 relative'>
              <button 
                  onClick={onClose}
                  className='absolute top-4 right-4 text-gray-600 hover:text-gray-900'
              >
                  <X size={24} />
              </button>
              <h2 className='text-2xl font-bold mb-6'>
                  {initialStore ? 'Edit Store' : 'Add New Store'}
              </h2>
          

              <form onSubmit={handleSubmit} className='space-y-4'>
                  <div>
                      <div className='lg:flex'>
                          <div className='flex-1'> 
                              <div className='grid grid-cols-2 gap-4'>
                                  {/* Basic Information */}
                                  <div className='col-span-2'>
                                      <label className='block text-sm font-medium text-gray-700'>Store Name</label>
                                      <input 
                                          type='text'
                                          name='name'
                                          value={newStore.name}
                                          onChange={handleInputChange}
                                          className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                                          required
                                      />
                                  </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>Slogan</label>
                  <input 
                    type='text'
                    name='slogan'
                    value={newStore.slogan}
                    onChange={handleInputChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>Category</label>
                  <input 
                    type='text'
                    name='category'
                    value={newStore.category}
                    onChange={handleInputChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                  />
                </div>

                {/* File Uploads */}
                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Logo</label>
                                    <input 
                                        type='file'
                                        name='logo'
                                        onChange={handleInputChange}
                                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                                        accept='image/*'
                                        // Add key to force reset of input
                                        key={previews.logo || 'logo-input'}
                                    />
                                    {previews.logo && (
                                        <div className='mt-2 flex items-center space-x-2'>
                                            <img 
                                                src={previews.logo} 
                                                alt='Logo Preview' 
                                                className='h-20 w-20 object-cover rounded'
                                            />
                                            <div className='flex space-x-2'>
                                                <button 
                                                    type='button'
                                                    onClick={() => openFullSizeImage('logo')}
                                                    className='text-blue-500 hover:text-blue-700'
                                                    title='View Full Size'
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                <button 
                                                    type='button'
                                                    onClick={() => removeImage('logo')}
                                                    className='text-red-500 hover:text-red-700'
                                                    title='Remove Image'
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                </div>

                                <div>
                                    <label className='block text-sm font-medium text-gray-700'>Banner</label>
                                    <input 
                                        type='file'
                                        name='banner'
                                        onChange={handleInputChange}
                                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                                        accept='image/*'
                                        // Add key to force reset of input
                                        key={previews.banner || 'banner-input'}
                                    />
                                    {previews.banner && (
                                        <div className='mt-2 flex items-center space-x-2'>
                                            <img 
                                                src={previews.banner} 
                                                alt='Banner Preview' 
                                                className='h-20 w-20 object-cover rounded'
                                            />
                                            <div className='flex space-x-2'>
                                                <button 
                                                    type='button'
                                                    onClick={() => openFullSizeImage('banner')}
                                                    className='text-blue-500 hover:text-blue-700'
                                                    title='View Full Size'
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                <button 
                                                    type='button'
                                                    onClick={() => removeImage('banner')}
                                                    className='text-red-500 hover:text-red-700'
                                                    title='Remove Image'
                                                >
                                                    <X size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                {/* URLs and Links */}
                <div>
                  <label className='block text-sm font-medium text-gray-700'>Homepage</label>
                  <input 
                    type='url'
                    name='homepage'
                    value={newStore.homepage}
                    onChange={handleInputChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>Domain Name</label>
                  <input 
                    type='text'
                    name='domainName'
                    value={newStore.domainName}
                    onChange={handleInputChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>Deeplink</label>
                  <input 
                    type='url'
                    name='deeplink'
                    value={newStore.deeplink}
                    onChange={handleInputChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                  />
                </div>

                {/* Cashback Details */}
                <div>
                  <label className='block text-sm font-medium text-gray-700'>Cashback Earn</label>
                  <input 
                    type='text'
                    name='cashbackEarn'
                    value={newStore.cashbackEarn}
                    onChange={handleInputChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>Cashback Percentage</label>
                  <input 
                    type='number'
                    name='cashbackPercentage'
                    value={newStore.cashbackPercentage}
                    onChange={handleInputChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                    min='0'
                    max='100'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>Cashback Type</label>
                  <select 
                    name='cashbackType'
                    value={newStore.cashbackType}
                    onChange={handleInputChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                  >
                    <option value='cashback'>Cashback</option>
                    <option value='reward'>Reward</option>
                  </select>
                </div>

                {/* Advanced Settings */}
                <div>
                  <label className='block text-sm font-medium text-gray-700'>Tracking Speed</label>
                  <input 
                    type='text'
                    name='trackingSpeed'
                    value={newStore.trackingSpeed}
                    onChange={handleInputChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>Confirm Duration</label>
                  <input 
                    type='text'
                    name='confirmDuration'
                    value={newStore.confirmDuration}
                    onChange={handleInputChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>Network</label>
                  <select 
                    name='network'
                    value={newStore.network}
                    onChange={handleInputChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                  >
                    <option value='mock'>Mock</option>
                    <option value='admited'>Admited</option>
                    <option value='new'>New Network</option>
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>Network Complain ID</label>
                  <input 
                    type='text'
                    name='networkComplainId'
                    value={newStore.networkComplainId}
                    onChange={handleInputChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>Ghost</label>
                  <input 
                    type='text'
                    name='ghost'
                    value={newStore.ghost}
                    onChange={handleInputChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700'>Status</label>
                  <select 
                    name='status'
                    value={newStore.status}
                    onChange={handleInputChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                  >
                    <option value='draft'>Draft</option>
                    <option value='publish'>Publish</option>
                    <option value='trash'>Trash</option>
                  </select>
                </div>

                {/* Checkboxes */}
                <div className='col-span-2 grid grid-cols-3 gap-4'>
                  <div className='flex items-center'>
                    <input 
                      type='checkbox'
                      name='isClaimable'
                      checked={newStore.isClaimable}
                      onChange={handleInputChange}
                      className='mr-2'
                    />
                    <label className='text-sm'>Is Claimable</label>
                  </div>
                  <div className='flex items-center'>
                    <input 
                      type='checkbox'
                      name='isSharable'
                      checked={newStore.isSharable}
                      onChange={handleInputChange}
                      className='mr-2'
                    />
                    <label className='text-sm'>Is Sharable</label>
                  </div>
                  <div className='flex items-center'>
                    <input 
                      type='checkbox'
                      name='isFeaturable'
                      checked={newStore.isFeaturable}
                      onChange={handleInputChange}
                      className='mr-2'
                    />
                    <label className='text-sm'>Is Featurable</label>
                  </div>
                  <div className='flex items-center'>
                    <input 
                      type='checkbox'
                      name='excludeSitemap'
                      checked={newStore.excludeSitemap}
                      onChange={handleInputChange}
                      className='mr-2'
                    />
                    <label className='text-sm'>Exclude Sitemap</label>
                  </div>
                </div>
                              </div>
                          </div>
    
                {/* Store additional info starts from here  */}
                <div className='flex-1 mt-2'> 
                <StoreAdditionalInfo
                      additionalStoreInfo={additionalStoreInfo}
                      handleAdditionalInputChange={handleAdditionalInputChange}
                      handleRichTextChange={handleRichTextChange}
                  />
                          </div>
                {/* Additional info ennds here */}
              </div>
                <div className="w-full  rounded-lg mb-6">
                <StoreCashbackRate 
                  initialRates={cashbackRates}
                  onRatesChange={handleCashbackRatesChange}
                />
                </div>
            </div>
          
          
    {/* submit and cancel button div */}
            <div className='flex justify-end space-x-4 mt-6'>
                <button 
                  type='button'
                  onClick={onClose}
                  className='bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition'
                >
                  Cancel
                </button>
                <button 
                  type='submit'
                  className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition'
                >
                  {initialStore ? 'Update Store' : 'Create Store'}
                </button>
              </div>
              </form>


          </div>
        </div>

     {/* Full Size Image Modal */}
     {fullSizeImage.src && (
                <FullSizeImageModal
                    src={fullSizeImage.src}
                    type={fullSizeImage.type}
                    onClose={closeFullSizeImage}
                />
            )}
      
            

    </>
  )
}

export default StoreForm;