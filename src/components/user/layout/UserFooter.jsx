'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from 'react-icons/fa';

export default function UserFooter() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 text-gray-700 pt-12 pb-6 px-4 md:px-8 mt-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
        {/* Brand Logo */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Image
            src="/logo.png"
            alt="Ecom Logo"
            width={100}
            height={100}
            className="rounded-md object-contain"
          />
          <p className="text-sm text-gray-600 mt-4 max-w-xs">
            Discover quality products and experience seamless shopping.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-md font-semibold mb-3 text-indigo-600">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/user/dashboard" className="hover:text-indigo-500">Dashboard</Link></li>
            <li><Link href="/user/orders" className="hover:text-indigo-500">My Orders</Link></li>
            <li><Link href="/user/wishlist" className="hover:text-indigo-500">Wishlist</Link></li>
            <li><Link href="/user/support" className="hover:text-indigo-500">Support</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-md font-semibold mb-3 text-indigo-600">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/user/terms" className="hover:text-indigo-500">Terms & Conditions</Link></li>
            <li><Link href="/user/privacy" className="hover:text-indigo-500">Privacy Policy</Link></li>
            <li><Link href="/user/returns" className="hover:text-indigo-500">Return Policy</Link></li>
          </ul>
        </div>

        {/* Social */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-md font-semibold mb-3 text-indigo-600">Follow Us</h3>
          <div className="flex gap-4 text-gray-600 text-xl">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-500">
              <FaLinkedinIn />
            </a>
          </div>

          {/* Optional: Contact Info below social icons */}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <EnvelopeIcon className="w-5 h-5 text-indigo-500" />
              <span>support@ecom.com</span>
            </div>
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <PhoneIcon className="w-5 h-5 text-indigo-500" />
              <span>+91 9876543210</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-gray-200 mt-10 pt-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} ecom All rights reserved.
      </div>
    </footer>
  );
}
