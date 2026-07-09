import { Button, Typography } from '@material-tailwind/react'
import { Plus, PlusCircle, Search } from 'lucide-react'
import React from 'react'

export const NoDataFound=( {onClick})=> {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="bg-blue-50 p-3 rounded-full mb-4">
                <Search className="text-blue-500" size={24} />
              </div>
              <Typography variant="h6" className="mb-2">No offers found</Typography>
              <Typography variant="paragraph" color="blue-gray" className="max-w-sm">
                Try adjusting your search or filter criteria, or add a new offer to get started.
              </Typography>
              <Button
                variant="text"
                color="blue"
                className="mt-4"
                onClick={onClick}
              >
                <div className='flex justify-between items-center '>
                    <PlusCircle size={18} className="mr-2" />
                     <Typography variant='small'>Add New Offer</Typography>
                </div>
              </Button>
            </div>
  )
}

export default NoDataFound
