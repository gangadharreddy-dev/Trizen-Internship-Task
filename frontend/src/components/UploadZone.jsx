import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import api from '../api/client';

export const UploadZone = ({ eventId, onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);
  const fileInputRef = useRef(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSizeBytes = 25 * 1024 * 1024; // 25MB

  const handleFiles = (incomingFiles) => {
    setStatusMessage(null);
    const valid = [];
    const errors = [];

    Array.from(incomingFiles).forEach((f) => {
      if (!allowedTypes.includes(f.type)) {
        errors.push(`${f.name}: Invalid file type (only JPG, PNG, WEBP, GIF allowed)`);
        return;
      }
      if (f.size > maxSizeBytes) {
        errors.push(`${f.name}: Exceeds max size limit of 25MB`);
        return;
      }
      valid.push({
        file: f,
        preview: URL.createObjectURL(f),
        id: Math.random().toString(36).substring(7),
      });
    });

    if (errors.length > 0) {
      setStatusMessage({ type: 'error', text: errors.join('; ') });
    }

    setFiles((prev) => [...prev, ...valid]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const clearAll = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setProgress(0);
  };

  const startUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setProgress(10);
    setStatusMessage(null);

    const formData = new FormData();
    files.forEach((item) => {
      formData.append('files', item.file);
    });

    try {
      const response = await api.post(`/api/events/${eventId}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || 1;
          const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
          setProgress(Math.min(percentCompleted, 95));
        },
      });

      setProgress(100);
      const uploadedCount = response.data.uploaded?.length || 0;
      setStatusMessage({
        type: 'success',
        text: `Successfully uploaded ${uploadedCount} photo${uploadedCount === 1 ? '' : 's'}!`,
      });

      clearAll();
      if (onUploadComplete) {
        onUploadComplete(response.data.uploaded);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to upload photos. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Card */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-200">
              Click to select photos or drag & drop here
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports batch upload • JPG, PNG, WEBP, GIF up to 25MB each
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {statusMessage && (
        <div
          className={`flex items-start gap-2.5 p-3.5 rounded-xl text-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Selected Photos Staging Area */}
      {files.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Ready for upload: {files.length} {files.length === 1 ? 'photo' : 'photos'}
            </span>
            <button
              onClick={clearAll}
              disabled={uploading}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-50"
            >
              Clear all
            </button>
          </div>

          {/* Thumbnails grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {files.map((item) => (
              <div
                key={item.id}
                className="relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-950 aspect-square"
              >
                <img
                  src={item.preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
                {!uploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(item.id);
                    }}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-[9px] text-slate-300 truncate">
                  {item.file.name}
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {uploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Uploading to Cloud Storage...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={startUpload}
            disabled={uploading}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading {files.length} photos...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload {files.length} Photos Now</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
