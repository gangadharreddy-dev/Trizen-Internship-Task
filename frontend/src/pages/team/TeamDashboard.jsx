import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { Bell, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TeamDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/events');
        setEvents(res.data);
      } catch (err) {
        console.error('Failed to load assigned events', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header Bar matching Screen 5 */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            My Assigned Events
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Shoots you are scheduled to photograph
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('No new notifications')}
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

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading assigned events...
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs">
          No events assigned yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80"
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
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
                </div>
              </div>

              {/* Two buttons matching Screen 5 */}
              <div className="p-4 pt-0 flex gap-2">
                <Link
                  to={`/team/events/${event.id}`}
                  className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs text-center transition-colors shadow-xs flex items-center justify-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Photos</span>
                </Link>
                <Link
                  to="/team/my-photos"
                  className="py-2 px-3 rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs text-center transition-colors"
                >
                  My Photos
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
