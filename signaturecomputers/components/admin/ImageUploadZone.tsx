'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { FiUpload, FiTrash2, FiClipboard, FiImage } from 'react-icons/fi';
import { toast } from 'sonner';

interface ImageUploadZoneProps {
    images: File[];
    setImages: React.Dispatch<React.SetStateAction<File[]>>;
    imagePreviews: string[];
    setImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
    existingUrls?: string[];
    setExistingUrls?: React.Dispatch<React.SetStateAction<string[]>>;
    maxImages?: number;
}

export default function ImageUploadZone({
    images,
    setImages,
    imagePreviews,
    setImagePreviews,
    existingUrls = [],
    setExistingUrls,
    maxImages = 10
}: ImageUploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);

    // Total image count
    const totalImages = imagePreviews.length + existingUrls.length;

    // Process files (from any source)
    const processFiles = useCallback((files: FileList | File[]) => {
        const fileArray = Array.from(files);
        const imageFiles = fileArray.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            toast.error('Please select valid image files');
            return;
        }

        if (totalImages + imageFiles.length > maxImages) {
            toast.error(`Maximum ${maxImages} images allowed`);
            return;
        }

        // Add to images array
        setImages(prev => [...prev, ...imageFiles]);

        // Create preview URLs
        const newPreviews = imageFiles.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);

        toast.success(`${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} added`);
    }, [totalImages, maxImages, setImages, setImagePreviews]);

    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
            // Reset input so same file can be selected again
            e.target.value = '';
        }
    };

    // Handle drag events
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set to false if leaving the drop zone entirely
        if (e.relatedTarget && !dropZoneRef.current?.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
        } else if (!e.relatedTarget) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFiles(files);
        }
    };

    // Handle paste
    const handlePaste = useCallback((e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const imageFiles: File[] = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    imageFiles.push(file);
                }
            }
        }

        if (imageFiles.length > 0) {
            e.preventDefault();
            processFiles(imageFiles);
        }
    }, [processFiles]);

    // Add paste event listener
    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => {
            document.removeEventListener('paste', handlePaste);
        };
    }, [handlePaste]);

    // Remove new image
    const removeImage = (index: number) => {
        // Revoke preview URL to prevent memory leak
        URL.revokeObjectURL(imagePreviews[index]);
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Remove existing URL
    const removeExistingUrl = (index: number) => {
        if (setExistingUrls) {
            setExistingUrls(prev => prev.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="space-y-4">
            {/* Image previews grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Existing URLs (for edit mode) */}
                {existingUrls.map((url, idx) => (
                    <div key={`existing-${idx}`} className="relative aspect-square group">
                        <img
                            src={url}
                            alt={`Existing ${idx + 1}`}
                            className="w-full h-full object-cover rounded-lg border dark:border-gray-700"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => removeExistingUrl(idx)}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                            >
                                <FiTrash2 size={18} />
                            </button>
                        </div>
                        <span className="absolute bottom-2 left-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                            Saved
                        </span>
                    </div>
                ))}

                {/* New image previews */}
                {imagePreviews.map((src, idx) => (
                    <div key={`new-${idx}`} className="relative aspect-square group">
                        <img
                            src={src}
                            alt={`Preview ${idx + 1}`}
                            className="w-full h-full object-cover rounded-lg border dark:border-gray-700"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                            >
                                <FiTrash2 size={18} />
                            </button>
                        </div>
                        <span className="absolute bottom-2 left-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                            New
                        </span>
                    </div>
                ))}

                {/* Drop zone / Upload button */}
                {totalImages < maxImages && (
                    <div
                        ref={dropZoneRef}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-lg cursor-pointer transition-all
                            ${isDragging
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                                : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                            }
                        `}
                    >
                        {isDragging ? (
                            <>
                                <FiImage className="w-10 h-10 text-blue-500 mb-2 animate-bounce" />
                                <span className="text-sm text-blue-600 font-medium">Drop here!</span>
                            </>
                        ) : (
                            <>
                                <FiUpload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500 text-center px-2">
                                    Click, Drag & Drop, or Paste
                                </span>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                    <FiUpload size={12} />
                    <span>Click to upload</span>
                </div>
                <div className="flex items-center gap-1">
                    <FiImage size={12} />
                    <span>Drag & drop</span>
                </div>
                <div className="flex items-center gap-1">
                    <FiClipboard size={12} />
                    <span>Ctrl+V to paste</span>
                </div>
                <div className="ml-auto text-gray-400">
                    {totalImages}/{maxImages} images
                </div>
            </div>
        </div>
    );
}
