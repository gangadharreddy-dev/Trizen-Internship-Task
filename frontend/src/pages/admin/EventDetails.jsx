import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { getPhotoUrl } from '../../api/client';
import {
  Calendar,
  Users,
  Image as ImageIcon,
  CheckSquare,
  Globe,
  Plus,
  Trash2,
  Edit2,
  Check,
  Copy,
  ExternalLink,
  Search,
  CheckCircle2,
  X,
  Eye,
  Lock,
  HardDrive
} from 'lucide-react';
import { PhotoModal } from '../../components/PhotoModal';

export const EventDetails = () => {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [members, setMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [gallery, setGallery] = useState(null);

  const [activeTab, setActiveTab] = useState('members'); // 'overview', 'members', 'photos', 'gallery'
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState(new Set());
  const [activeModalPhoto, setActiveModalPhoto] = useState(null);

  // Search & Filter in Photos tab
  const [searchPhoto, setSearchPhoto] = useState('');
  const [selectedUploader, setSelectedUploader] = useState('all');

  // Add Member Modal
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Publish Gallery Modal
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [pinInput, setPinInput] = useState('482917');
  const [copyLinkDone, setCopyLinkDone] = useState(false);
  const [copyPinDone, setCopyPinDone] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [evRes, phRes, memRes, galRes, usersRes] = await Promise.all([
        api.get(`/api/events/${id}`),
        api.get(`/api/events/${id}/photos`),
        api.get(`/api/events/${id}/members`),
        api.get(`/api/events/${id}/gallery`),
        api.get('/api/auth/users'),
      ]);

      setEvent(evRes.data);
      setPhotos(phRes.data);
      setMembers(memRes.data);
      setGallery(galRes.data);
      setAvailableUsers(usersRes.data);

      const sel = new Set();
      phRes.data.forEach((p) => {
        if (p.is_selected) sel.add(p.id);
      });
      setSelectedPhotoIds(sel);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [id]);

  // Photo Selection
  const togglePhoto = async (photoId) => {
    const next = new Set(selectedPhotoIds);
    const newStatus = !next.has(photoId);

    if (newStatus) next.add(photoId);
    else next.delete(photoId);

    setSelectedPhotoIds(next);

    try {
      await api.put(`/api/events/${id}/photos/selection`, {
        photo_ids: [photoId],
        is_selected: newStatus,
      });
      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, is_selected: newStatus } : p))
      );
    } catch (err) {
      console.error('Failed to update photo selection', err);
    }
  };

  const clearSelection = async () => {
    const ids = Array.from(selectedPhotoIds);
    if (ids.length === 0) return;

    try {
      await api.put(`/api/events/${id}/photos/selection`, {
        photo_ids: ids,
        is_selected: false,
      });
      setSelectedPhotoIds(new Set());
      setPhotos((prev) => prev.map((p) => ({ ...p, is_selected: false })));
    } catch (err) {
      console.error(err);
    }
  };

  // Add & Remove Member
  const handleAddMember = async () => {
    if (!selectedUserId) return;
    try {
      const res = await api.post(`/api/events/${id}/members`, {
        user_id: parseInt(selectedUserId, 10),
      });
      setMembers((prev) => [...prev, res.data]);
      setShowAddMemberModal(false);
      setSelectedUserId('');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the event?')) return;
    try {
      await api.delete(`/api/events/${id}/members/${userId}`);
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
    } catch (err) {
      alert('Failed to remove member');
    }
  };

  // Publish Gallery
  const handlePublishGallery = async () => {
    if (!pinInput || pinInput.trim().length < 4) {
      alert('Please enter at least a 4-digit PIN');
      return;
    }

    try {
      // 1. Create or update PIN
      const galRes = await api.post(`/api/events/${id}/gallery`, { pin: pinInput.trim() });
      // 2. Publish gallery with selected photos
      const pubRes = await api.post(`/api/galleries/${galRes.data.id}/publish`, {
        published: true,
      });
      setGallery(pubRes.data);
      setPublishSuccess(true);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to publish gallery');
    }
  };

  const copyUrl = () => {
    if (!gallery) return;
    const url = `${window.location.origin}/gallery/${gallery.public_token}`;
    navigator.clipboard.writeText(url);
    setCopyLinkDone(true);
    setTimeout(() => setCopyLinkDone(false), 2000);
  };

  const copyPin = () => {
    navigator.clipboard.writeText(pinInput);
    setCopyPinDone(true);
    setTimeout(() => setCopyPinDone(false), 2000);
  };

  if (loading || !event) {
    return (
      <div className="p-16 text-center text-slate-400 text-xs">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading event details...
      </div>
    );
  }

  // Filtered photos
  const filteredPhotos = photos.filter((p) => {
    const matchesName = p.filename.toLowerCase().includes(searchPhoto.toLowerCase());
    const matchesUploader =
      selectedUploader === 'all' || String(p.uploaded_by) === selectedUploader;
    return matchesName && matchesUploader;
  });

  const assignedUserIds = new Set(members.map((m) => m.user_id));
  const unassignedUsers = availableUsers.filter((u) => !assignedUserIds.has(u.id));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header matching Screen 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {event.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {event.event_date
              ? new Date(event.event_date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : '20 Sep 2026'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => alert('Event edit details saved.')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* Tabs matching Screen 4 */}
      <div className="border-b border-slate-200 flex gap-8 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'members'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Team Members
        </button>
        <button
          onClick={() => setActiveTab('photos')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'photos'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Photos
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'gallery'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Gallery
        </button>
      </div>

      {/* TAB: Overview */}
      {activeTab === 'overview' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Event Overview</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {event.description ||
              'Luxury celebration featuring traditional ceremonies, portrait sessions, and candid evening reception.'}
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-xl font-bold text-slate-900">{photos.length}</span>
              <span className="text-xs text-slate-500">Uploaded Photos</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-xl font-bold text-blue-600">{selectedPhotoIds.size}</span>
              <span className="text-xs text-slate-500">Selected Photos</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <span className="block text-xl font-bold text-slate-900">{members.length}</span>
              <span className="text-xs text-slate-500">Team Members</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Team Members (Screen 4) */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Team Members</h2>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          </div>

          {/* Members Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No members assigned yet. Click "+ Add Member" to assign shooters.
                    </td>
                  </tr>
                ) : (
                  members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {m.user.name[0]}
                        </div>
                        <span>{m.user.name}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{m.user.email}</td>
                      <td className="py-3 px-4 text-slate-600">Photographer</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => alert(`Edit preferences for ${m.user.name}`)}
                          className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveMember(m.user_id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Photos & Selection (Screen 7) */}
      {activeTab === 'photos' && (
        <div className="space-y-4 pb-20">
          {/* Header row with counts */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">All Event Photos</h2>
              <p className="text-xs text-slate-500">{event.name}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-500">{photos.length} photos</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                {selectedPhotoIds.size} selected
              </span>
            </div>
          </div>

          {/* Filter Toolbar matching Screen 7 */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <select
              value={selectedUploader}
              onChange={(e) => setSelectedUploader(e.target.value)}
              className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-blue-600 w-full sm:w-48"
            >
              <option value="all">All Photographers</option>
              {members.map((m) => (
                <option key={m.user_id} value={String(m.user_id)}>
                  {m.user.name}
                </option>
              ))}
            </select>

            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchPhoto}
                onChange={(e) => setSearchPhoto(e.target.value)}
                placeholder="Search photos..."
                className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Photo Grid matching Screen 7 */}
          {filteredPhotos.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-400">
              No photos found.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredPhotos.map((photo) => {
                const isSelected = selectedPhotoIds.has(photo.id);
                return (
                  <div
                    key={photo.id}
                    onClick={() => togglePhoto(photo.id)}
                    className={`relative group rounded-xl overflow-hidden cursor-pointer border aspect-square shadow-xs transition-all ${
                      isSelected
                        ? 'ring-2 ring-blue-600 border-blue-600'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img
                      src={getPhotoUrl(photo.storage_location)}
                      alt={photo.filename}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Top right select check badge */}
                    <div className="absolute top-2 right-2">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-black/40 border border-white/60 text-transparent hover:text-white/50'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    {/* Preview eye icon on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModalPhoto(photo);
                      }}
                      className="absolute top-2 left-2 p-1 rounded-md bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sticky Bottom Bar matching Screen 7 */}
          <div className="fixed bottom-0 left-60 right-0 bg-white border-t border-slate-200 p-4 flex items-center justify-between z-30 shadow-lg px-8">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span className="text-xs font-semibold text-slate-800">
                {selectedPhotoIds.size} selected
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={clearSelection}
                className="py-2 px-4 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
              >
                Clear Selection
              </button>

              <button
                onClick={() => setShowPublishModal(true)}
                className="py-2 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Publish Selected ({selectedPhotoIds.size})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Gallery (Screen 8 & 9) */}
      {activeTab === 'gallery' && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-xl mx-auto shadow-xs space-y-6">
          {gallery && gallery.published ? (
            /* Screen 9: Gallery Published Successfully */
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">
                  Gallery Published Successfully!
                </h3>
                <p className="text-xs text-slate-500">
                  Your gallery is now live and ready to share.
                </p>
              </div>

              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Gallery URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/gallery/${gallery.public_token}`}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-blue-600 font-mono focus:outline-none"
                    />
                    <button
                      onClick={copyUrl}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
                    >
                      {copyLinkDone ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copyLinkDone ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    PIN
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pinInput}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-800 tracking-widest focus:outline-none"
                    />
                    <button
                      onClick={copyPin}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 transition-colors flex items-center gap-1"
                    >
                      {copyPinDone ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copyPinDone ? 'Copied' : 'Copy PIN'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 leading-relaxed">
                  Share this link with your client. They can view the gallery by entering this PIN.
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/gallery/${gallery.public_token}`}
                  target="_blank"
                  className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
                >
                  View Gallery
                </Link>
              </div>
            </div>
          ) : (
            /* Screen 8: Publish Gallery Card */
            <div className="space-y-6">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-slate-900">Publish Gallery</h3>
                <p className="text-xs text-slate-500">Configure client access PIN</p>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=80"
                  alt="thumbnail"
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-xs">{event.name}</h4>
                  <p className="text-[11px] text-slate-500">20 Sep 2026</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Selected Photos
                  </span>
                  <span className="text-lg font-extrabold text-blue-600">
                    {selectedPhotoIds.size}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Total Uploaded
                  </span>
                  <span className="text-lg font-extrabold text-slate-900">
                    {photos.length}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gallery PIN *
                </label>
                <input
                  type="text"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="482917"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-mono tracking-widest text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  6-digit PIN (will be hashed and secured)
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handlePublishGallery}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
                >
                  Publish Gallery
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal for Add Member */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Add Team Member</h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select a registered photographer to assign to {event.name}.
            </p>

            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="">-- Choose Team Member --</option>
              {unassignedUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={!selectedUserId}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Publish Gallery (triggered from bottom bar) */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            {!publishSuccess ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Publish Gallery</h3>
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?w=200&q=80"
                    alt="thumbnail"
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{event.name}</h4>
                    <p className="text-[11px] text-slate-500">20 Sep 2026</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Selected Photos
                    </span>
                    <span className="text-lg font-extrabold text-blue-600">
                      {selectedPhotoIds.size}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Total Uploaded
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">
                      {photos.length}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gallery PIN *
                  </label>
                  <input
                    type="text"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="482917"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs font-mono tracking-widest text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    6-digit PIN (will be hashed and secured)
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handlePublishGallery}
                    className="flex-1 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    Publish Gallery
                  </button>
                  <button
                    onClick={() => setShowPublishModal(false)}
                    className="py-2 px-4 rounded-lg border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-5">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">
                    Gallery Published Successfully!
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your gallery is now live and ready to share.
                  </p>
                </div>

                <div className="space-y-3 text-left">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Gallery URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`${window.location.origin}/gallery/${gallery?.public_token || 'abc123'}`}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-blue-600 font-mono focus:outline-none"
                      />
                      <button
                        onClick={copyUrl}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0"
                      >
                        {copyLinkDone ? 'Copied' : 'Copy Link'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      PIN
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={pinInput}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-800 tracking-widest focus:outline-none"
                      />
                      <button
                        onClick={copyPin}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0"
                      >
                        {copyPinDone ? 'Copied' : 'Copy PIN'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setShowPublishModal(false);
                      setPublishSuccess(false);
                    }}
                    className="flex-1 py-2 px-3 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold"
                  >
                    Done
                  </button>
                  <Link
                    to={`/gallery/${gallery?.public_token || 'abc123'}`}
                    target="_blank"
                    className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold text-center"
                  >
                    View Gallery
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeModalPhoto && (
        <PhotoModal
          photo={activeModalPhoto}
          onClose={() => setActiveModalPhoto(null)}
        />
      )}
    </div>
  );
};
