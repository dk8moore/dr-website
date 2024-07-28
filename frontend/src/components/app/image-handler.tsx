import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/dialog';
import { Button } from '@ui/button';
import { Dropzone } from './dropzone';
import { Camera, X } from 'lucide-react';

interface ImageHandlerProps {
  onImageSelect: (file: File | null) => void;
  initialImage?: string | null;
}

export const ImageHandler: React.FC<ImageHandlerProps> = ({ onImageSelect, initialImage }) => {
  const [image, setImage] = useState<string | null>(initialImage ?? null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  }, []);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImage = useCallback(async (imageSrc: string, pixelCrop: Area) => {
    const image = new Image();
    image.src = imageSrc;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to get 2D context');
    }
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );
    return new Promise<File>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
          resolve(file);
        }
      }, 'image/jpeg');
    });
  }, []);

  const handleCropSave = useCallback(async () => {
    if (croppedAreaPixels && image) {
      const croppedImage = await getCroppedImage(image, croppedAreaPixels);
      setImage(URL.createObjectURL(croppedImage));
      onImageSelect(croppedImage);
      setCropModalOpen(false);
    }
  }, [croppedAreaPixels, image, getCroppedImage, onImageSelect]);

  const handleRemoveImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent opening file dialog
      setImage(null);
      onImageSelect(null);
    },
    [onImageSelect]
  );

  return (
    <div className='relative'>
      <Dropzone
        onDrop={onDrop}
        accept={{ 'image/*': [] }}
        multiple={false}
        shape='circle'
        size='large'
        borderStyle={image ? 'solid' : 'dashed'}
        className='overflow-hidden relative border-primary/50'
      >
        <div className='w-full h-full rounded-full overflow-hidden relative'>
          {image ? (
            <>
              <img src={image} alt='Profile' className='w-full h-full object-cover' />
              <div className='absolute inset-x-0 bottom-0 h-1/3 bg-primary/50 flex items-center justify-center'>
                <Camera className='text-primary-foreground' size={24} />
              </div>
            </>
          ) : (
            <div className='absolute inset-0 flex items-center justify-center'>
              <Camera className='text-primary/50' size={32} />
            </div>
          )}
        </div>
      </Dropzone>
      {image && (
        <button
          onClick={handleRemoveImage}
          className='absolute -top-2 -right-2 bg-destructive rounded-full p-1 hover:bg-destructive/80 transition-colors'
          aria-label='Remove image'
        >
          <X className='text-destructive-foreground' size={16} />
        </button>
      )}

      <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
          </DialogHeader>
          <div className='relative h-64'>
            {image && (
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className='flex justify-end space-x-2 mt-4'>
            <Button onClick={() => setCropModalOpen(false)} variant='outline'>
              Cancel
            </Button>
            <Button onClick={handleCropSave}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
