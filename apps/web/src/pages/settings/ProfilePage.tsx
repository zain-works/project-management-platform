import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { Button } from '../../components/ui/Button.js';
import { User, Mail, Calendar, Shield, ArrowLeft } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-500">
        Loading user profile...
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate('/app')}
          className="flex items-center text-sm text-brand-600 hover:text-brand-800"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </button>
        <Link to="/app/settings" className="text-sm text-brand-600 hover:text-brand-800 font-medium">
          Settings
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="flex-shrink-0">
            <div className="h-32 w-32 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-5xl font-bold border-4 border-white shadow-sm">
              {getInitials(user.name)}
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left pt-2">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
            <div className="flex flex-col gap-3 mt-6 text-gray-600">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">{user.email}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 ml-2">
                  Verified
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Shield className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">User Account</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span className="text-gray-700">Joined Recently</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
