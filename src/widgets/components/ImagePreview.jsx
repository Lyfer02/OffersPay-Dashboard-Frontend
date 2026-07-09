import React from 'react';
import { Button } from '@material-tailwind/react';

const ImagePreviewGallery = ({ images = [], onRemove }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 ">
      {images.map((img, index) => (
        <div key={img.id || `${img.name}-${index}`} className="relative rounded-lg border border-dashed shadow-md border-gray-500 p-1">
          <Button
            size="md"
            color="red"
            className="absolute rounded-full pl-2 pr-2 pt-1 pb-1 z-10"
            onClick={() => onRemove(index)}
          >
            X
          </Button>
          <img
            src={img.preview}
            alt={`Preview ${index + 1}`}
            className="w-full h-24 object-cover rounded-lg"
          />
          
        </div>
      ))}
    </div>
  );
};

export default ImagePreviewGallery;
