import { AlertTriangle } from "lucide-react";

// Confirmation Dialog Component
export const ConfirmationDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title = 'Confirm Deletion', 
    message = 'Are you sure you want to delete this store?' 
  }) => {
    if (!isOpen) return null;
  
    return (
      <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-lg w-full max-w-md p-6 space-y-4'>
          <div className='flex items-center space-x-4'>
            <AlertTriangle size={32} className='text-yellow-500' />
            <h2 className='text-xl font-bold'>{title}</h2>
          </div>
          <p className='text-gray-600'>{message}</p>
          <div className='flex justify-end space-x-4'>
            <button
              onClick={onClose}
              className='bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition'
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition'
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  }

  export default ConfirmationDialog;