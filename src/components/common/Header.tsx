'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Menu, X, ChevronDown } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      name: 'Solutions',
      href: '/solutions',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Offshore Calculator', href: '/quote-calculator' },
        { name: 'Team Building', href: '/team-building' },
        { name: 'AI Training', href: '/ai-training' },
      ]
    },
    { name: 'About', href: '/about' },
    { name: 'Case Studies', href: '/case-studies' },
    { name: 'Resources', href: '/resources' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className={`bg-white border-b border-neural-blue-100 sticky top-0 z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center hover:-translate-y-0.5 transition-transform duration-300">
              <Logo className="h-8 w-auto sm:h-10" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <div key={item.name} className="relative group">
                {item.hasDropdown ? (
                  <div className="relative">
                    <button className="flex items-center gap-1 text-neural-blue-700 hover:text-neural-blue-900 font-medium text-sm transition-colors duration-300 py-2">
                      {item.name}
                      <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-neural-blue-200 rounded-2xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="py-2">
                        {item.dropdownItems?.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className="block px-4 py-3 text-sm text-neural-blue-700 hover:text-neural-blue-900 hover:bg-neural-blue-50 transition-colors duration-300"
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="text-neural-blue-700 hover:text-neural-blue-900 font-medium text-sm transition-colors duration-300 py-2"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Buttons - Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button
              variant="outline"
              className="border-2 border-neural-blue-300 text-neural-blue-700 hover:bg-neural-blue-50 hover:border-neural-blue-400 transition-all duration-300"
            >
              Log In
            </Button>
            <Button
              variant="primary"
              className="bg-neural-blue-500 hover:bg-neural-blue-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-neural-blue-700 hover:text-neural-blue-900 hover:bg-neural-blue-50 transition-all duration-300"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-neural-blue-100 bg-white">
            <div className="py-4 space-y-2">
              {navigationItems.map((item) => (
                <div key={item.name}>
                  {item.hasDropdown ? (
                    <div className="space-y-2">
                      <div className="px-4 py-2 text-neural-blue-900 font-medium text-sm">
                        {item.name}
                      </div>
                      {item.dropdownItems?.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.name}
                          href={dropdownItem.href}
                          className="block px-6 py-2 text-sm text-neural-blue-700 hover:text-neural-blue-900 hover:bg-neural-blue-50 transition-colors duration-300"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {dropdownItem.name}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="block px-4 py-2 text-neural-blue-700 hover:text-neural-blue-900 hover:bg-neural-blue-50 transition-colors duration-300 rounded-xl mx-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              
              {/* Mobile CTA Buttons */}
              <div className="px-4 pt-4 space-y-3 border-t border-neural-blue-100">
                <Button
                  variant="outline"
                  className="w-full border-2 border-neural-blue-300 text-neural-blue-700 hover:bg-neural-blue-50 hover:border-neural-blue-400 transition-all duration-300"
                >
                  Log In
                </Button>
                <Button
                  variant="primary"
                  className="w-full bg-neural-blue-500 hover:bg-neural-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
} 