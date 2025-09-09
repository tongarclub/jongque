'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { User, Settings, LogOut, Calendar, Shield } from 'lucide-react';
import { useState } from 'react';

export function AuthNavigation() {
  const { data: session, status } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg p-2">
          <div className="animate-pulse bg-gray-200 rounded w-20 h-8"></div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="flex space-x-2">
          <Link href="/auth/signin">
            <Button variant="outline" size="sm">
              เข้าสู่ระบบ
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm">
              สมัครสมาชิก
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        {/* Profile Button */}
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center space-x-2 bg-white rounded-lg shadow-lg p-3 hover:shadow-xl transition-shadow border border-gray-100"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
            {session.user?.image ? (
              <img 
                src={session.user.image} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="h-4 w-4 text-blue-600" />
            )}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-sm font-medium text-gray-900">
              {session.user?.name || 'User'}
            </div>
            <div className="text-xs text-gray-500">
              {session.user?.email}
            </div>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsDropdownOpen(false)}
            ></div>
            
            {/* Dropdown Content */}
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
              <div className="py-2">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="text-sm font-medium text-gray-900">
                    {session.user?.name || 'User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {session.user?.email}
                  </div>
                </div>

                {/* Menu Items */}
                <Link 
                  href="/profile" 
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>โปรไฟล์ของฉัน</span>
                </Link>

                <Link 
                  href="/profile/bookings" 
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Calendar className="h-4 w-4" />
                  <span>ประวัติการจอง</span>
                </Link>

                <Link 
                  href="/profile/settings" 
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span>การตั้งค่า</span>
                </Link>

                <Link 
                  href="/profile/security" 
                  className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  <span>ความปลอดภัย</span>
                </Link>

                {/* Divider */}
                <div className="border-t border-gray-100 my-2"></div>

                {/* Sign Out */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
