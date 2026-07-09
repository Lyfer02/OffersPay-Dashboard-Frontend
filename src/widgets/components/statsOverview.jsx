// StatsOverview.jsx
import { Typography } from '@material-tailwind/react';
import { Tag, Gift, Clock, Trash2 } from 'lucide-react';
import React from 'react';

export const StatsOverview = ({ offersList , heading="Offers"}) => {
  return (
    <div className="grid grid-cols-1 md:flex md:flex-wrap gap-4 my-4">
      <div className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow border border-blue-100">
        <div className="flex items-start justify-between">
          <div>
            <Typography className="text-gray-600 text-sm">Total {heading}</Typography>
            <Typography variant="h4" className="font-bold text-blue-800">{offersList.length}</Typography>
          </div>
          <div className="bg-blue-100 p-2 rounded-full">
            <Tag className="text-blue-500" size={20} />
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow border border-green-100">
        <div className="flex items-start justify-between">
          <div>
            <Typography className="text-gray-600 text-sm">Published {heading}</Typography>
            <Typography variant="h4" className="font-bold text-green-700">
              {offersList.filter(offer => offer.status === 'publish').length}
            </Typography>
          </div>
          <div className="bg-green-100 p-2 rounded-full">
            <Gift className="text-green-500" size={20} />
          </div>
        </div>
      </div>
      
      <div className="flex-1 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg shadow border border-amber-100">
        <div className="flex items-start justify-between">
          <div>
            <Typography className="text-gray-600 text-sm">Draft {heading}</Typography>
            <Typography variant="h4" className="font-bold text-amber-700">
              {offersList.filter(offer => offer.status === 'draft').length}
            </Typography>
          </div>
          <div className="bg-amber-100 p-2 rounded-full">
            <Clock className="text-amber-500" size={20} />
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gradient-to-r from-red-50 to-red-50 p-4 rounded-lg shadow border border-red-100">
        <div className="flex items-start justify-between">
          <div>
            <Typography className="text-gray-600 text-sm">Trash {heading}</Typography>
            <Typography variant="h4" className="font-bold text-red-700">
              {offersList.filter(offer => offer.status === 'trash').length}
            </Typography>
          </div>
          <div className="bg-red-100 p-2 rounded-full">
            <Trash2 className="text-red-500" size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;