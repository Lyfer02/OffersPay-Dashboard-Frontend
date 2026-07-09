import { Eye, X, Calendar } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import StoreAdditionalInfo from './additionalform';
import DatePicker from '../components/DatePicker';
import { FullSizeImageModal } from '.';

export const AddOffers =({onClose, onSubmit, initialOffer = null}) =>{

     const [newOffer, setNewOffer] = useState({
        id: null,
        title: '',
        store: '',
        description: '',
        couponCode: '',
        offerLink: '', // New field
        isAffiliateLink: false, // New field
        category: '', // New field
        network: '', // New field
        startDate: null, // New field
        expiryDate: null, // New field
        logo: null,
        banner: null,
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
    const [additionalOfferInfo, setAdditionalOfferInfo] = useState({
        heading1: '',
        heading2: '',
        metaTitle: '',
        metaDescription: '',
        metaKeywords: '',
        termsTodo: '',
        termsNotTodo: '',
        about: ''
    });


    // Effect to populate form when editing an existing offer
    useEffect(() => {
        if (initialOffer) {
            const updatedOffer = {
                ...initialOffer,
                logo: initialOffer.logo || null,
                banner: initialOffer.banner || null,
                offerLink: initialOffer.offerLink || '',
                isAffiliateLink: initialOffer.isAffiliateLink || false,
                category: initialOffer.category || '',
                network: initialOffer.network || '',
                startDate: initialOffer.startDate || null,
                expiryDate: initialOffer.expiryDate || null,
            }
            setNewOffer(updatedOffer)
    
            // Set initial previews if existing images
            const updatePreviews = {}
            if (initialOffer.logo) {
                updatePreviews.logo = typeof initialOffer.logo === 'string' 
                    ? initialOffer.logo 
                    : URL.createObjectURL(initialOffer.logo)
            }
            if (initialOffer.banner) {
                updatePreviews.banner = typeof initialOffer.banner === 'string' 
                    ? initialOffer.banner 
                    : URL.createObjectURL(initialOffer.banner)
            }
            setPreviews(prev => ({...prev, ...updatePreviews}))
            
            // If initialOffer has additionalInfo property, populate additional info state
            if (initialOffer.additionalOfferInfo) {
                setAdditionalOfferInfo({
                    heading1: initialOffer.additionalOfferInfo.heading1 || '',
                    heading2: initialOffer.additionalOfferInfo.heading2 || '',
                    metaTitle: initialOffer.additionalOfferInfo.metaTitle || '',
                    metaDescription: initialOffer.additionalOfferInfo.metaDescription || '',
                    metaKeywords: initialOffer.additionalOfferInfo.metaKeywords || '',
                    termsTodo: initialOffer.additionalOfferInfo.termsTodo || '',
                    termsNotTodo: initialOffer.additionalOfferInfo.termsNotTodo || '',
                    about: initialOffer.additionalOfferInfo.about || ''
                });
            }
        }
    }, [initialOffer])


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
                
                // Update both newOffer and previews
                setNewOffer(prev => ({
                    ...prev,
                    [name]: file
                }))
                
                setPreviews(prev => ({
                    ...prev,
                    [name]: objectUrl
                }))
            } else {
                // Clear both newOffer and previews if no file
                setNewOffer(prev => ({
                    ...prev,
                    [name]: null
                }))
                
                setPreviews(prev => ({
                    ...prev,
                    [name]: null
                }))
            }
        } else {
            setNewOffer(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }))
        }
    }
    
    // Handle date changes
    const handleDateChange = (date, name) => {
        setNewOffer(prev => ({
            ...prev,
            [name]: date
        }));
    };
    
    // Handle additional info input changes
    const handleAdditionalInputChange = (e) => {
        const { name, value } = e.target;
        setAdditionalOfferInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Handle rich text editor changes
    const handleRichTextChange = (value, name) => {
        setAdditionalOfferInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = (e) => {
      e.preventDefault();
      
      // Create a complete store data object with all information
      const completeOfferData = {
          ...newOffer,
          additionalOfferInfo: {
              heading1: additionalOfferInfo.heading1,
              heading2: additionalOfferInfo.heading2,
              metaTitle: additionalOfferInfo.metaTitle,
              metaDescription: additionalOfferInfo.metaDescription,
              metaKeywords: additionalOfferInfo.metaKeywords,
              termsTodo: additionalOfferInfo.termsTodo,
              termsNotTodo: additionalOfferInfo.termsNotTodo,
              about: additionalOfferInfo.about
          },
          
      };
      // Submit the complete data
      onSubmit(completeOfferData);
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
    
        setNewOffer(prev => ({
            ...prev,
            [type]: null
        }))
        setPreviews(prev => ({
            ...prev,
            [type]: null
        }))
    }
    

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
                  {initialOffer ? 'Edit Offer' : 'Add New Offer'}
              </h2>
          

              <form onSubmit={handleSubmit} className='space-y-4'>
                  <div>
                      <div className='lg:flex'>
                          <div className='flex-1'> 
                              <div className='grid grid-cols-2 gap-4'>
                                  {/* Basic Information */}

                                  <div className=''>
                                      <label className='block text-sm font-medium text-gray-700'>Title</label>
                                      <input 
                                          type='text'
                                          name='title'
                                          value={newOffer.title}
                                          onChange={handleInputChange}
                                          className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                                          required
                                      />
                                  </div>

                                  <div>
                                      <label className='block text-sm font-medium text-gray-700'>Store</label>
                                      <select 
                                        name='store'
                                        value={newOffer.store}
                                        onChange={handleInputChange}
                                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                                      >
                                        <option value=''>Select Store</option>
                                        <option value='Store1'>Store1</option>
                                        <option value='Store2'>Store2</option>
                                      </select>
                                  </div>

                                  <div>
                                      <label className='block text-sm font-medium text-gray-700'>Coupon Code</label>
                                      <input 
                                        type='text'
                                        name='couponCode'
                                        value={newOffer.couponCode}
                                        onChange={handleInputChange}
                                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                                      />
                                  </div>

                                  <div>
                                      <label className='block text-sm font-medium text-gray-700'>Description</label>
                                      <input 
                                        type='text'
                                        name='description'
                                        value={newOffer.description}
                                        onChange={handleInputChange}
                                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                                      />
                                  </div>

                                  <div>
                                      <label className='block text-sm font-medium text-gray-700'>Status</label>
                                      <select 
                                        name='status'
                                        value={newOffer.status}
                                        onChange={handleInputChange}
                                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                                      >
                                        <option value='draft'>Draft</option>
                                        <option value='publish'>Publish</option>
                                        <option value='trash'>Trash</option>
                                      </select>
                                  </div>
                                  
                                  {/* New Fields */}
                                  <div>
                                      <label className='block text-sm font-medium text-gray-700'>Offer Link</label>
                                      <input 
                                        type='url'
                                        name='offerLink'
                                        value={newOffer.offerLink}
                                        onChange={handleInputChange}
                                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                                      />
                                  </div>
                                  
                                  
                                  
                                  <div>
                                      <label className='block text-sm font-medium text-gray-700'>Category</label>
                                      <select 
                                        name='category'
                                        value={newOffer.category}
                                        onChange={handleInputChange}
                                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                                      >
                                        <option value=''>Select Category</option>
                                        <option value='eye-wear'>Eye Wear</option>
                                        <option value='health-devices'>Health Devices</option>
                                        <option value='electronics'>Electronics</option>
                                        <option value='clothing'>Clothing</option>
                                        <option value='home-appliances'>Home Appliances</option>
                                      </select>
                                  </div>
                                  
                                  <div>
                                      <label className='block text-sm font-medium text-gray-700'>Network</label>
                                      <select 
                                        name='network'
                                        value={newOffer.network}
                                        onChange={handleInputChange}
                                        className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3'
                                      >
                                        <option value=''>Select Network</option>
                                        <option value='mock'>Mock</option>
                                        <option value='network'>Network</option>
                                        <option value='partner'>Partner</option>
                                      </select>
                                  </div>
                                  
                                  <div>
                                      <label className='block text-sm font-medium text-gray-700'>Start Date</label>
                                      <DatePicker
                                        selectedDate={newOffer.startDate}
                                        onChange={(date) => handleDateChange(date, 'startDate')}
                                        placeholderText="Select start date"
                                        showIcon={true}
                                        icon={<Calendar size={16} />}
                                      />
                                  </div>
                                  
                                  <div>
                                      <label className='block text-sm font-medium text-gray-700'>Expiry Date</label>
                                      <DatePicker 
                                        selectedDate={newOffer.expiryDate}
                                        onChange={(date) => handleDateChange(date, 'expiryDate')}
                                        placeholderText="Select expiry date"
                                        showIcon={true}
                                        icon={<Calendar size={16} />}
                                        minDate={newOffer.startDate}
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

                                  <div className="flex items-center mt-4">
                                      <input 
                                        type='checkbox'
                                        id='isAffiliateLink'
                                        name='isAffiliateLink'
                                        checked={newOffer.isAffiliateLink}
                                        onChange={handleInputChange}
                                        className='h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                                      />
                                      <label htmlFor='isAffiliateLink' className='ml-2 block text-sm text-gray-700'>
                                        Is Affiliate Link
                                      </label>
                                  </div>
                              </div>
                          </div>
    
                          {/* Store additional info starts from here  */}
                          <div className='flex-1 mt-2'> 
                              <StoreAdditionalInfo
                                  additionalStoreInfo={additionalOfferInfo}
                                  handleAdditionalInputChange={handleAdditionalInputChange}
                                  handleRichTextChange={handleRichTextChange}
                              />
                          </div>
                          {/* Additional info ends here */}
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
                        {initialOffer ? 'Update Offer' : 'Create Offer'}
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

export default AddOffers;