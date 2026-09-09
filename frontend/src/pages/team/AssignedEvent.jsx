import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import {
  UploadCloud,
  CheckCircle2,
  X,
  Bell,
  HardDrive,
  Check,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AssignedEvent = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Staged files state
  const [stagedFiles, setStagedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/events/${id}`);
        setEvent(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleFiles = (incoming) => {
    setStatusMessage(null);
    const valid = [];
    const maxBytes = 25 * 1024 * 1024;

    Array.from(incoming).forEach((f) => {
      if (!f.type.startsWith('image/')) {
        setStatusMessage({ type: 'error', text: `${f.name} is not an image file.` });
        return;
      }
      if (f.size > maxBytes) {
        setStatusMessage({ type: 'error', text: `${f.name} exceeds 25MB.` });
        return;
      }
      valid.push({
        file: f,
        name: f.name,
        size: f.size,
        id: Math.random().toString(36).substring(7),
      });
    });

    setStagedFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (fileId) => {
    setStagedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleUpload = async () => {
    if (stagedFiles.length === 0) return;
    setUploading(true);
    setStatusMessage(null);

    const formData = new FormData();
    stagedFiles.forEach((item) => {
      formData.append('files', item.file);
    });

    try {
      const res = await api.post(`/api/events/${id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || 1;
          setUploadProgress(Math.round((progressEvent.loaded * 100) / total));
        },
      });

      const count = res.data.uploaded?.length || 0;
      setStatusMessage({
        type: 'success',
        text: `Successfully uploaded ${count} photo${count === 1 ? '' : 's'}!`,
      });
      setStagedFiles([]);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Upload failed',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading || !event) {
    return (
      <div className="p-16 text-center text-slate-400 text-xs">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar matching Screen 6 */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Upload Photos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{event.name}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('No notifications')}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs text-xs text-slate-700">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              {user?.name ? user.name[0].toUpperCase() : 'R'}
            </div>
            <span className="font-semibold">{user?.name?.split(' ')[0] || 'Rahul'}</span>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Upload Dropzone matching Screen 6 */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6 shadow-xs">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'border-blue-600 bg-blue-50/50'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
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

          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <UploadCloud className="w-6 h-6" />
            </div>

            <p className="text-xs font-semibold text-slate-700">
              Drag & drop photos here
            </p>
            <span className="text-[11px] text-slate-400">or</span>

            <button
              type="button"
              className="py-2 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              Choose Photos
            </button>

            <p className="text-[11px] text-slate-400 pt-1">
              Supports JPG, PNG (Max 10MB each)
            </p>
          </div>
        </div>

        {/* Selected Files List matching Screen 6 */}
        {stagedFiles.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900">
              Selected Files ({stagedFiles.length})
            </h3>

            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {stagedFiles.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-800">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-4 text-slate-400">
                    <span>{formatBytes(item.size)}</span>
                    <button
                      onClick={() => removeFile(item.id)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {uploading && (
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="py-2.5 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload Photos'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
