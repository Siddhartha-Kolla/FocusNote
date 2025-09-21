"use client";

import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  FileText,
  Calendar,
  Home,
  Bell,
  Search,
  PlusCircle,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { logout } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";

interface UserHeaderProps {
  user: {
    email: string;
  };
}

export default function UserHeader({ user }: UserHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = () => setIsMenuOpen((s) => !s);
  const toggleProfileMenu = () => setIsProfileMenuOpen((s) => !s);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo + breadcrumbs */}
          <div className="flex items-center gap-4">
            <a href="/user" className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-500 rounded-lg p-2">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M3 12h18" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 6h18" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">FocusNote</div>
                <div className="text-xs text-gray-500">Dashboard</div>
              </div>
            </a>

            <nav className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <a href="/user" className="px-2 py-1 rounded hover:bg-gray-50">Overview</a>
              <a href="/user/documents" className="px-2 py-1 rounded hover:bg-gray-50">Documents</a>
              <a href="/user/review" className="px-2 py-1 rounded hover:bg-gray-50">Review</a>
              <a href="/user/exam-generator" className="px-2 py-1 rounded hover:bg-gray-50">Exam Generator</a>
              <a href="/user/schedule" className="px-2 py-1 rounded hover:bg-gray-50">Schedule</a>
            </nav>
          </div>

          {/* Center: Search */}
          <div className="flex-1 px-4">
            <div className="max-w-xl mx-auto">
              <label htmlFor="user-search" className="sr-only">Search</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Search className="w-5 h-5" />
                </span>
                <input
                  id="user-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search documents, sessions, tags..."
                  className="block w-full rounded-md border border-gray-200 py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-400">Clear</button>
                )}
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <button className="p-2 rounded-md hover:bg-gray-50" title="Upload">
                <PlusCircle className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 rounded-md hover:bg-gray-50" title="Notifications">
                <Bell className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Profile / Avatar */}
            <div className="relative" ref={profileRef}>
              <button onClick={toggleProfileMenu} className="flex items-center gap-2 py-1 px-3 rounded-full hover:bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-medium text-gray-900">{user.email.split('@')[0]}</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-lg py-2 z-50">
                  <a href="/user/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</a>
                  <a href="/user/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</a>
                  <div className="border-t my-1"></div>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Sign out</button>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <div className="md:hidden">
              <button onClick={toggleMenu} className="p-2 rounded-md hover:bg-gray-50">
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-2 pb-4">
            <nav className="space-y-1">
              <a href="/user" className="block px-4 py-2 rounded hover:bg-gray-50">Overview</a>
              <a href="/user/documents" className="block px-4 py-2 rounded hover:bg-gray-50">Documents</a>
              <a href="/user/review" className="block px-4 py-2 rounded hover:bg-gray-50">Review</a>
              <a href="/user/exam-generator" className="block px-4 py-2 rounded hover:bg-gray-50">Exam Generator</a>
              <a href="/user/schedule" className="block px-4 py-2 rounded hover:bg-gray-50">Schedule</a>
              <a href="/user/profile" className="block px-4 py-2 rounded hover:bg-gray-50">Profile</a>
              <a href="/user/settings" className="block px-4 py-2 rounded hover:bg-gray-50">Settings</a>
              <button onClick={handleLogout} className="block w-full text-left px-4 py-2 rounded hover:bg-gray-50">Sign out</button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}