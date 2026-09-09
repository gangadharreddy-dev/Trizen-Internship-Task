import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Calendar,
  Image as ImageIcon,
  FolderLock,
  Plus,
  Bell,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/events');
      setEvents(res.data);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const totalPhotos = events.reduce((sum, e) => sum + e.photo_count, 0);
  const publishedCount = events.filter((e) => e.is_published).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Bar matching Screen 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('No new notifications')}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-xs text-slate-700">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
              {user?.name ? user.name[0].toUpperCase() : 'A'}
            </div>
            <span className="font-semibold">{user?.name || 'Admin'}</span>
          </div>

          <Link
            to="/admin/events/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </Link>
        </div>
      </div>

      {/* 3 Metric Cards matching Screen 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Events</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{events.length}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Total Photos</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {totalPhotos > 0 ? totalPhotos.toLocaleString() : '0'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ImageIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Published Galleries</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{publishedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FolderLock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* My Events Section matching Screen 2 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            My Events
          </h2>
          <Link
            to="/admin/events/new"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-800">No events found</p>
            <p className="text-xs text-slate-500">
              Get started by creating your first photography event.
            </p>
            <Link
              to="/admin/events/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Create Event
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Event card thumbnail */}
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={
                        event.id === 1
                          ? 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80'
                          : 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80'
                      }
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                    {event.is_published && (
                      <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-sm">
                        Live Gallery
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm truncate">
                      {event.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {event.event_date
                        ? new Date(event.event_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '20 Sep 2026'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {event.photo_count} photos
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link
                    to={`/admin/events/${event.id}`}
                    className="block w-full text-center py-2 px-3 rounded-lg border border-slate-300 hover:border-blue-600 hover:bg-blue-50 text-slate-700 hover:text-blue-600 text-xs font-semibold transition-all"
                  >
                    Manage Event
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
