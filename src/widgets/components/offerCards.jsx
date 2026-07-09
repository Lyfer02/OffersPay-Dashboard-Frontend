import React from 'react';
import { Typography, Button, Chip, Tooltip, Checkbox } from '@material-tailwind/react';
import { Edit, Trash2, Tag, Copy, Check } from 'lucide-react';

const PLACEHOLDER_IMAGE = "/img/pattern.png";

export const OfferCard = ({ offer, onEdit, onDelete, getStatusColor, isSelected, onSelect, onCopyCode, isCopied }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      
      {/* Image Section with Checkbox + Publish Chip */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img 
          src={offer.imageUrl || PLACEHOLDER_IMAGE}
          alt={offer.title}
          className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
        />
        {/* Checkbox top-left */}
        <div className="absolute top-3 left-3">
          <Checkbox 
            checked={isSelected}
            onChange={() => onSelect(offer.id)}
            className="h-5 w-5"
            color="blue"
          />
        </div>
        {/* Status Chip top-right */}
        <Chip
          value={offer.status}
          color={getStatusColor(offer.status)}
          variant="filled"
          size="sm"
          className="absolute top-3 right-3 capitalize font-medium text-xs"
        />
      </div>

      <div className="p-5 space-y-4">
        
       

        {/* Title */}
        <Typography variant="small" className="text-blue-900 font-bold">
        ID: {offer.id} ({offer.title})
        </Typography>
        
        {/* Store */}
        <div className="flex items-center gap-2 text-blue-600">
          <Tag size={16} />
          <Typography variant="small" className="font-medium">
            {offer.store}
          </Typography>
        </div>

        {/* Description */}
        <Typography className="text-gray-700 text-sm leading-relaxed line-clamp-3">
          {offer.description}
        </Typography>

        {/* Coupon Code */}
        {offer.couponCode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg flex justify-between items-center p-3">
            <Typography className="font-mono text-blue-700 text-sm tracking-wide">
              {offer.couponCode}
            </Typography>
            <Button 
              size="sm" 
              variant="text" 
              color={isCopied ? "green" : "blue"} 
              className="p-1 rounded-full"
              onClick={() => onCopyCode(offer.couponCode, offer.id)}
            >
              {isCopied ? <Check size={16} /> : <Copy size={16} />}
            </Button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
          <Tooltip content="Edit Offer">
            <Button
              variant="text"
              color="blue"
              size="sm"
              className="p-2 rounded-full"
              onClick={() => onEdit(offer)}
            >
              <Edit size={18} />
            </Button>
          </Tooltip>
          <Tooltip content="Delete Offer">
            <Button
              variant="text"
              color="red"
              size="sm"
              className="p-2 rounded-full"
              onClick={() => onDelete(offer.id)}
            >
              <Trash2 size={18} />
            </Button>
          </Tooltip>
        </div>

      </div>
    </div>
  );
};

export default OfferCard;
