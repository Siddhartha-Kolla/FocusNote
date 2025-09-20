"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="w-full bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-semibold text-gray-900">
              FocusNote
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a
              href="/"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Home
            </a>
            <a
              href="/features"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              Features
            </a>
            <a
              href="/how-it-works"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              How It Works
            </a>
            <a
              href="/about"
              className="text-gray-700 hover:text-gray-900 transition-colors"
            >
              About
            </a>
            <Button>
              <Link href="/login">Login</Link>
            </Button>
          </nav>


          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <nav className="py-4 space-y-2">
              <a
                href="/"
                className="block px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </a>
              <a
                href="/features"
                className="block px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="/how-it-works"
                className="block px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Mock Exam
              </a>
              <a
                href="/about"
                className="block px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </a>
              <Button className="w-full">
                <Link href="/login">Login</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}