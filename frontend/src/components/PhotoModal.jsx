import React, { useEffect } from 'react';
import { X, Download, Calendar, User, HardDrive } from 'lucide-react';
import { getPhotoUrl } from '../api/client';

export const PhotoModal = ({ photo, onClose, onPrev, onNext, hasPrev, hasNext }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  if (!photo) return null;

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDownload = async () => {
    const photoUrl = getPhotoUrl(photo.storage_location);
    try {
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = photo.filename || 'photoshare-photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback: open in new tab
      window.open(photoUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      {/* Top bar controls */}
      <div className="w-full max-w-7xl flex items-center justify-between pb-3 text-slate-300">
        <div className="text-sm font-medium truncate max-w-md">
          {photo.filename}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            Download
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image View */}
      <div className="relative flex-1 flex items-center justify-center w-full max-w-6xl max-h-[75vh] overflow-hidden my-auto">
        <img
          src={getPhotoUrl(photo.storage_location)}
          alt={photo.filename}
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
        />

        {/* Prev / Next controls */}
        {hasPrev && (
          <button
            onClick={onPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center backdrop-blur-sm border border-slate-700 shadow-lg"
          >
            &#8592;
          </button>
        )}
        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white flex items-center justify-center backdrop-blur-sm border border-slate-700 shadow-lg"
          >
            &#8594;
          </button>
        )}
      </div>

      {/* Bottom Metadata bar */}
      <div className="w-full max-w-7xl pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-4">
        <div className="flex items-center gap-6">
          {photo.uploader_name && (
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>Shot by: <strong className="text-slate-200">{photo.uploader_name}</strong></span>
            </div>
          )}
          {photo.file_size > 0 && (
            <div className="flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatBytes(photo.file_size)}</span>
            </div>
          )}
          {photo.created_at && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date(photo.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
            </div>
          )}
        </div>

        <div className="text-[11px] text-slate-500">
          Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">ESC</kbd> to exit • <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">→</kbd> to browse
        </div>
      </div>
    </div>
  );
};
