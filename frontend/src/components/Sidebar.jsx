import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Camera,
  LayoutDashboard,
  Calendar,
  Users,
  Image as ImageIcon,
  FolderLock,
  Settings,
  LogOut,
  User as UserIcon
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminNav = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/events/new', label: 'Events', icon: Calendar },
    { to: '/admin/events/1', label: 'Team Members', icon: Users },
    { to: '/admin/events/1', label: 'All Photos', icon: ImageIcon },
    { to: '/gallery/abc123', label: 'Galleries', icon: FolderLock, external: true },
    { to: '/admin/dashboard', label: 'Settings', icon: Settings },
  ];

  const teamNav = [
    { to: '/team/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/team/my-photos', label: 'My Photos', icon: ImageIcon },
  ];

  const links = isAdmin ? adminNav : teamNav;

  return (
    <aside className="w-60 bg-[#0f172a] text-slate-300 min-h-screen flex flex-col justify-between p-4 shrink-0 select-none">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-3 py-2 text-white">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Camera className="w-4 h-4 stroke-[2]" />
          </div>
          <span className="font-bold tracking-tight text-lg text-white">
            PhotoShare
          </span>
        </div>

        {/* Nav list */}
        <nav className="space-y-1">
          {links.map((link, idx) => {
            const Icon = link.icon;
            if (link.external) {
              return (
                <a
                  key={idx}
                  href={link.to}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{link.label}</span>
                </a>
              );
            }
            return (
              <NavLink
                key={idx}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User profile footer */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white shrink-0 text-xs font-bold">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="overflow-hidden text-left">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name?.split(' ')[0] || (isAdmin ? 'Admin' : 'Shooter')}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
