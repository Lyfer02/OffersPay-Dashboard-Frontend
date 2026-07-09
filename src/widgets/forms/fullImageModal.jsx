import React from 'react'
import { X } from 'lucide-react'

export const FullSizeImageModal = ({ src, type = 'image', onClose }) => {
    if (!src) return null

    return (
        <div 
            className='fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4'
            onClick={onClose}
        >
            <div className='relative max-w-full max-h-full'>
                <button 
                    onClick={onClose}
                    className='absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2'
                >
                    <X size={24} color='white' />
                </button>
                <img 
                    src={src} 
                    alt={`Full Size ${type.toUpperCase()} Preview`} 
                    className='max-w-full max-h-full object-contain'
                />
            </div>
        </div>
    )
}

export default FullSizeImageModal