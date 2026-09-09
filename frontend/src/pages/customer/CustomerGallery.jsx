import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api, { getPhotoUrl } from '../../api/client';
import {
  Camera,
  AlertCircle,
  Eye,
  Download,
  Share2,
  Check,
  Maximize2,
  Grid
} from 'lucide-react';
import { PhotoModal } from '../../components/PhotoModal';

export const CustomerGallery = () => {
  const { publicToken } = useParams();

  const [galleryInfo, setGalleryInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // 6-digit PIN state matching Screen 10
  const [pinDigits, setPinDigits] = useState(['', '', '', '', '', '']);
  const pinInputRefs = useRef([]);

  const [sessionToken, setSessionToken] = useState(
    sessionStorage.getItem(`gallery_session_${publicToken}`) || null
  );
  const [pinError, setPinError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Photos state matching Screen 11
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [activeModalPhoto, setActiveModalPhoto] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(-1);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch gallery info
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        setLoadingInfo(true);
        const res = await api.get(`/api/gallery/${publicToken}/info`);
        setGalleryInfo(res.data);
      } catch (err) {
        console.error(err);
        setNotFound(true);
      } finally {
        setLoadingInfo(false);
      }
    };
    fetchInfo();
  }, [publicToken]);

  // Fetch photos if session token exists
  useEffect(() => {
    if (!sessionToken) return;

    const fetchPhotos = async () => {
      try {
        setLoadingPhotos(true);
        const res = await api.get(`/api/gallery/${publicToken}/photos`, {
          headers: { 'X-Gallery-Token': sessionToken },
        });
        setPhotos(res.data);
      } catch (err) {
        sessionStorage.removeItem(`gallery_session_${publicToken}`);
        setSessionToken(null);
        setPinError('Session expired. Please re-enter PIN.');
      } finally {
        setLoadingPhotos(false);
      }
    };

    fetchPhotos();
  }, [sessionToken, publicToken]);

  // Handle 6-digit PIN input with auto-advance
  const handleDigitChange = (index, value) => {
    if (value.length > 1) value = value[value.length - 1]; // take last entered char

    const newDigits = [...pinDigits];
    newDigits[index] = value;
    setPinDigits(newDigits);

    // Auto advance focus
    if (value && index < 5) {
      pinInputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pinDigits[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const pin = pinDigits.join('');
    if (pin.length < 4) {
      setPinError('Please enter the full PIN.');
      return;
    }

    setPinError('');
    setVerifying(true);

    try {
      const res = await api.post(`/api/gallery/${publicToken}/verify`, { pin });
      const token = res.data.session_token;
      sessionStorage.setItem(`gallery_session_${publicToken}`, token);
      setSessionToken(token);
    } catch (err) {
      setPinError(err.response?.data?.detail || 'Incorrect PIN. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const openModal = (photo, idx) => {
    setActiveModalPhoto(photo);
    setActivePhotoIndex(idx);
  };

  if (loadingInfo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-400 text-xs">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
        Locating gallery...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-white text-center">
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-8 max-w-sm space-y-3">
          <h2 className="text-lg font-bold">Private Gallery</h2>
          <p className="text-xs text-slate-400">
            This customer gallery is currently unpublished, private, or does not exist.
          </p>
        </div>
      </div>
    );
  }

  // SCREEN 10: Customer Gallery PIN Page
  if (!sessionToken) {
    return (
      <div className="relative min-h-screen flex flex-col justify-between items-center p-4 sm:p-8 bg-slate-950 overflow-hidden">
        {/* Background Image with dark overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1519741497674-611481863552?w=1600&q=80")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/80" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-2 pt-4">
          <div className="w-7 h-7 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
            <Camera className="w-4 h-4" />
          </div>
          <span className="font-bold tracking-tight text-white text-base">
            PhotoShare
          </span>
        </div>

        {/* Center Floating White Card matching Screen 10 */}
        <div className="relative z-10 w-full max-w-md bg-white rounded-2xl p-8 sm:p-10 shadow-2xl space-y-6 text-center">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {galleryInfo.event_name.includes('&')
                ? galleryInfo.event_name.split('Wedding')[0].trim()
                : galleryInfo.event_name}
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Wedding Gallery
            </p>
            <p className="text-xs text-slate-400 pt-1">
              Enter the PIN to view your photos
            </p>
          </div>

          {pinError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pinError}</span>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-6">
            {/* 6 Discrete PIN Boxes matching Screen 10 */}
            <div className="flex justify-center items-center gap-2 sm:gap-2.5">
              {pinDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (pinInputRefs.current[idx] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  autoFocus={idx === 0}
                  className="w-10 h-12 sm:w-11 sm:h-13 bg-white border border-slate-300 rounded-lg text-center text-lg font-bold text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 shadow-xs transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all disabled:opacity-50"
            >
              {verifying ? 'Verifying...' : 'View Gallery'}
            </button>
          </form>

          {/* Helper hint for demo */}
          {publicToken === 'abc123' && (
            <p className="text-[11px] text-slate-400">
              Demo PIN: <strong className="text-blue-600">482917</strong>
            </p>
          )}
        </div>

        <div className="relative z-10 text-[11px] text-slate-500 pb-2">
          Private Client Gallery • Secured Access
        </div>
      </div>
    );
  }

  // SCREEN 11: Customer Gallery (Photos)
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Header matching Screen 11 */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {galleryInfo.event_name}
              </h1>
              <span className="text-[11px] text-slate-400">
                Wedding Photography Showcase
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              {photos.length > 0 ? `1 / ${photos.length}` : '0 photos'}
            </span>

            <button
              onClick={() => {
                sessionStorage.removeItem(`gallery_session_${publicToken}`);
                setSessionToken(null);
                setPinDigits(['', '', '', '', '', '']);
              }}
              className="py-1.5 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              Lock Gallery
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid matching Screen 11 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loadingPhotos ? (
          <div className="p-20 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading gallery photos...
          </div>
        ) : photos.length === 0 ? (
          <div className="p-16 text-center text-slate-400 bg-slate-50 rounded-xl border border-slate-200">
            No published photos yet.
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => openModal(photo, index)}
                className="group relative break-inside-avoid rounded-xl overflow-hidden cursor-pointer bg-slate-100 shadow-xs"
              >
                <img
                  src={getPhotoUrl(photo.storage_location)}
                  alt={photo.filename}
                  loading="lazy"
                  className="w-full object-cover"
                />

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-md">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {activeModalPhoto && (
        <PhotoModal
          photo={activeModalPhoto}
          onClose={() => setActiveModalPhoto(null)}
          onPrev={() => {
            if (activePhotoIndex > 0) {
              const prev = activePhotoIndex - 1;
              setActivePhotoIndex(prev);
              setActiveModalPhoto(photos[prev]);
            }
          }}
          onNext={() => {
            if (activePhotoIndex < photos.length - 1) {
              const next = activePhotoIndex + 1;
              setActivePhotoIndex(next);
              setActiveModalPhoto(photos[next]);
            }
          }}
          hasPrev={activePhotoIndex > 0}
          hasNext={activePhotoIndex < photos.length - 1}
        />
      )}
    </div>
  );
};
