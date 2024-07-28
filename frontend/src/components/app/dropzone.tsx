import React from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';

interface DropzoneProps extends DropzoneOptions {
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  icon?: React.ReactNode;
  shape?: 'rectangle' | 'circle';
  size?: 'small' | 'medium' | 'large';
  borderStyle?: 'dashed' | 'solid' | 'none';
}

export const Dropzone: React.FC<DropzoneProps> = ({
  children,
  className = '',
  activeClassName = '',
  icon,
  shape = 'rectangle',
  size = 'medium',
  borderStyle = 'dashed',
  ...dropzoneOptions
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const shapeClasses = {
    rectangle: 'rounded',
    circle: 'rounded-full',
  };

  const sizeClasses = {
    small: 'w-24 h-24',
    medium: 'w-32 h-32',
    large: 'w-40 h-40',
  };

  const borderClasses = {
    dashed: 'border-dashed',
    solid: 'border-solid',
    none: 'border-none',
  };

  return (
    <div
      {...getRootProps()}
      className={`
        ${className}
        ${isDragActive ? activeClassName : ''}
        ${shapeClasses[shape]}
        ${sizeClasses[size]}
        flex items-center justify-center cursor-pointer border-2
        ${borderClasses[borderStyle]}
        ${isDragActive ? 'border-primary' : 'border-gray-300'}
      `}
    >
      <input {...getInputProps()} />
      {icon && <div className="absolute">{icon}</div>}
      {children}
    </div>
  );
};