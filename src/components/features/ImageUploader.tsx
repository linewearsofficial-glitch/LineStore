import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  bucket?: string;
  folder?: string;
  currentUrl?: string;
  onUpload: (url: string) => void;
  label?: string;
  className?: string;
  accept?: string;
}

export default function ImageUploader({
  bucket = 'product-images',
  folder = '',
  currentUrl,
  onUpload,
  label = 'Upload Image',
  className,
  accept = 'image/*',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    if (!file) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be under 10MB');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = folder
      ? `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      : `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) {
      toast.error('Upload failed: ' + error.message);
      setUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    onUpload(publicUrl);
    toast.success('Image uploaded');
    setUploading(false);
  };

  const handleFile = (files: FileList | null) => {
    if (files?.[0]) uploadFile(files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpload('');
  };

  return (
    <div className={cn('relative', className)}>
      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files)}
      />

      {currentUrl ? (
        <div className="relative group">
          <img src={currentUrl} alt="Uploaded" className="w-full aspect-video object-cover border border-line-border" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="bg-white text-line-black px-3 py-2 text-xs font-semibold uppercase tracking-widest"
            >
              Replace
            </button>
            <button
              onClick={handleClear}
              className="bg-red-600 text-white p-2"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn('upload-area', dragging && 'dragging')}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-line-black border-t-transparent rounded-full animate-spin" />
              <p className="font-sans text-sm text-line-gray">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload size={24} className="text-line-gray mb-2" />
              <p className="font-sans text-sm font-medium">{label}</p>
              <p className="font-sans text-xs text-line-gray mt-1">Drag & drop or click to upload</p>
              <p className="font-sans text-xs text-line-gray">JPG, PNG, WEBP up to 10MB</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
