'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Linkedin, 
  Twitter, 
  Youtube,
  ArrowRight,
  Heart
} from 'lucide-react';

interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const footerSections = {
    solutions: {
      title: 'Solutions',
      links: [
        { name: 'Offshore Calculator', href: '/quote-calculator' },
        { name: 'Team Building', href: '/team-building' },
        { name: 'AI Training', href: '/ai-training' },
        { name: 'Process Optimization', href: '/process-optimization' },
      ]
    },
    company: {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Case Studies', href: '/case-studies' },
        { name: 'Our Team', href: '/team' },
        { name: 'Careers', href: '/careers' },
      ]
    },
    resources: {
      title: 'Resources',
      links: [
        { name: 'Blog', href: '/blog' },
        { name: 'Documentation', href: '/docs' },
        { name: 'Help Center', href: '/help' },
        { name: 'API Reference', href: '/api' },
      ]
    },
    legal: {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'Data Processing', href: '/data-processing' },
      ]
    }
  };

  const socialLinks = [
    { name: 'LinkedIn', href: 'https://linkedin.com/company/scalemate', icon: Linkedin },
    { name: 'Twitter', href: 'https://twitter.com/scalemate', icon: Twitter },
    { name: 'YouTube', href: 'https://youtube.com/@scalemate', icon: Youtube },
  ];

  return (
    <footer className={`bg-neural-blue-900 text-white ${className}`}>
      {/* Newsletter Section */}
      <div className="border-b border-neural-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-display font-bold mb-4">
                Ready to Scale Your Business?
              </h3>
              <p className="text-base sm:text-lg text-neural-blue-200">
                Get expert insights on offshore scaling, AI automation, and business growth delivered to your inbox.
              </p>
            </div>
            <div className="w-full max-w-md lg:max-w-none lg:ml-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-xl bg-white text-neural-blue-900 placeholder:text-neural-blue-500 border-2 border-transparent focus:border-cyber-green-500 focus:outline-none transition-colors duration-300"
                />
                
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-6 hover:-translate-y-0.5 transition-transform duration-300">
              <Logo className="h-10 w-auto" />
            </Link>
            <p className="text-neural-blue-200 mb-6 max-w-md">
              ScaleMate empowers property management companies to scale efficiently through AI-powered offshore teams and intelligent automation.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-neural-blue-200">
                <Mail className="w-5 h-5 text-cyber-green-400" />
                <a href="mailto:hello@scalemate.ai" className="hover:text-white transition-colors duration-300">
                  hello@scalemate.ai
                </a>
              </div>
              <div className="flex items-center gap-3 text-neural-blue-200">
                <Phone className="w-5 h-5 text-cyber-green-400" />
                <a href="tel:+61234567890" className="hover:text-white transition-colors duration-300">
                  +61 234 567 890
                </a>
              </div>
              <div className="flex items-start gap-3 text-neural-blue-200">
                <MapPin className="w-5 h-5 text-cyber-green-400 mt-0.5" />
                <span>Sydney, Australia</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-neural-blue-800 text-neural-blue-200 hover:bg-cyber-green-500 hover:text-white transition-all duration-300 hover:-translate-y-0.5"
                    aria-label={social.name}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {Object.values(footerSections).map((section) => (
                <div key={section.title}>
                  <h4 className="font-bold text-white mb-4">{section.title}</h4>
                  <ul className="space-y-3">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-neural-blue-200 hover:text-white transition-colors duration-300 text-sm"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-neural-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-neural-blue-200 text-sm">
              <span>© {new Date().getFullYear()} ScaleMate. All rights reserved.</span>
            </div>
            
            <div className="flex items-center gap-2 text-neural-blue-200 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-cyber-green-400 fill-current" />
              <span>in Australia</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 