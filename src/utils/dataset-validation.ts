
import { toast } from 'sonner';

// Validate file type (CSV, JSON, XLSX)
export const validateFileType = (file: File): boolean => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  
  if (!fileExtension || !['csv', 'json', 'xlsx'].includes(fileExtension)) {
    toast.error('Only CSV, JSON, and XLSX files are supported');
    return false;
  }
  
  return true;
};

// Validate file size (10MB max)
export const validateFileSize = (file: File): boolean => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  
  if (file.size > MAX_FILE_SIZE) {
    toast.error('File size must be less than 10MB');
    return false;
  }
  
  return true;
};

// Make sure file is not empty
export const validateFileNotEmpty = (file: File): boolean => {
  if (file.size === 0) {
    toast.error('File cannot be empty');
    return false;
  }
  
  return true;
};

// Combined validation
export const validateDatasetFile = (file: File): boolean => {
  return validateFileType(file) && 
         validateFileSize(file) && 
         validateFileNotEmpty(file);
};
