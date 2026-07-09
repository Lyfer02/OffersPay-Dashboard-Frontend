import { Eye, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { FullSizeImageModal, StoreAdditionalInfo } from '.';

export const StoreCategoryForm=({onClose, onSubmit ,initialStore = null}) =>{
     const [newStore, setNewStore] = useState({
        id: null,
        name: '',
        slogan: '',
        logo: null,
        banner: null,
        parentCategory: '',
        isFeaturable: false,
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

const handleSubmit = (e) => {
    e.preventDefault();
    // Submit the complete data
    onSubmit(newStore);
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

// Effect to populate form when editing an existing store
useEffect(() => {
    if (initialStore) {
        const updatedStore = {
            ...initialStore,
            logo: initialStore.logo || null,
            banner: initialStore.banner || null,
            isFeaturable: initialStore.isFeaturable || false,
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
    }
}, [initialStore])


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
                  {initialStore ? 'Edit Category' : 'Add New Category'}
              </h2>
          

              <form onSubmit={handleSubmit} className='space-y-4'>
                  <div>
                      <div className='lg:flex'>
                          <div className='flex-1'> 
                              <div className='gap-4 '>
                                  {/* Basic Information */}
                                  <div className='col-span-2'>
                                      <label className='block text-sm font-medium text-gray-700'> Name</label>
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
                  <label className='block text-sm font-medium text-gray-700 pt-2'>Slogan</label>
                  <input 
                    type='text'
                    name='slogan'
                    value={newStore.slogan}
                    onChange={handleInputChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 pt-2'> Parent Category</label>
                  <input 
                    type='text'
                    name='category'
                    value={newStore.category}
                    onChange={handleInputChange}
                    className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                  />
                </div>

                {/* File Uploads  for store category img */}
                <div>
                                    <label className='block text-sm font-medium text-gray-700 pt-2' >Logo</label>
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

                {/* File Uploads  for store category Header img */}
                                <div>
                                    <label className='block text-sm font-medium text-gray-700 pt-2' >Banner</label>
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
              

                {/* Checkboxes */}
                <div className='col-span-2 grid grid-cols-3 gap-4 pt-4'>
                  

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
                  {initialStore ? 'Update Category' : 'Create Category'}
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

export default StoreCategoryForm;
