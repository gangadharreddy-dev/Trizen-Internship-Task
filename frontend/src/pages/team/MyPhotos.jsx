import React, { useState, useEffect } from 'react';
import api, { getPhotoUrl } from '../../api/client';
import { Image as ImageIcon, Trash2, Calendar, HardDrive } from 'lucide-react';
import { PhotoModal } from '../../components/PhotoModal';

export const MyPhotos = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalPhoto, setActiveModalPhoto] = useState(null);

  const fetchMyPhotos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/photos/my');
      setPhotos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPhotos();
  }, []);

  const handleDelete = async (photoId, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this photo permanently?')) return;
    try {
      await api.delete(`/api/photos/${photoId}`);
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete photo');
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">My Uploaded Photos</h1>
          <p className="text-xs text-slate-400 mt-1">
            All photos you have uploaded across assigned events ({photos.length} total)
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-500">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading your photos...
        </div>
      ) : photos.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-16 text-center space-y-3">
          <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No uploads found</p>
          <p className="text-xs text-slate-500">
            Open an assigned event from your dashboard to upload photos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActiveModalPhoto(photo)}
              className="group relative rounded-2xl overflow-hidden border border-slate-800/80 hover:border-emerald-500/40 transition-all cursor-pointer aspect-square bg-slate-900"
            >
              <img
                src={getPhotoUrl(photo.storage_location)}
                alt={photo.filename}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 opacity-75 group-hover:opacity-100 transition-opacity" />

              {/* Delete button */}
              <button
                onClick={(e) => handleDelete(photo.id, e)}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                title="Delete photo"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <div className="absolute bottom-2.5 inset-x-2.5 text-[11px] text-slate-300">
                <p className="truncate font-medium">{photo.filename}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>{formatBytes(photo.file_size)}</span>
                  <span>{new Date(photo.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeModalPhoto && (
        <PhotoModal
          photo={activeModalPhoto}
          onClose={() => setActiveModalPhoto(null)}
        />
      )}
    </div>
  );
};
