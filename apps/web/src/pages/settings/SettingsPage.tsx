import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Settings, Building2, User, Lock, Save, Trash2, AlertTriangle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentWorkspace, refreshWorkspaces } = useWorkspace();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'workspace' | 'account' | 'security'>('workspace');
  
  // Workspace State
  const [workspaceName, setWorkspaceName] = useState(currentWorkspace?.name || '');
  const [workspaceSlug, setWorkspaceSlug] = useState(currentWorkspace?.slug || '');
  const [isSavingWorkspace, setIsSavingWorkspace] = useState(false);
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Account State
  const [userName, setUserName] = useState(user?.name || '');
  const [userEmail, setUserEmail] = useState(user?.email || '');
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingSecurity, setIsSavingSecurity] = useState(false);
  
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;
    setIsSavingWorkspace(true);
    try {
      await api.workspaces.update(currentWorkspace.id, { name: workspaceName });
      await refreshWorkspaces();
      showMessage('success', 'Workspace settings updated successfully.');
    } catch (error) {
      showMessage('error', 'Failed to update workspace settings.');
    } finally {
      setIsSavingWorkspace(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!currentWorkspace) return;
    setIsDeletingWorkspace(true);
    try {
      await api.workspaces.delete(currentWorkspace.id);
      await refreshWorkspaces();
      showMessage('success', 'Workspace deleted successfully.');
      setShowDeleteConfirm(false);
      // Redirect to onboarding or home
      setTimeout(() => {
        navigate('/app', { replace: true });
      }, 1000);
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to delete workspace.');
    } finally {
      setIsDeletingWorkspace(false);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingAccount(true);
    try {
      await api.users.updateProfile({ name: userName });
      await refreshUser();
      showMessage('success', 'Account settings updated successfully.');
    } catch (error) {
      showMessage('error', 'Failed to update account settings.');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showMessage('error', 'New passwords do not match.');
      return;
    }
    setIsSavingSecurity(true);
    try {
      await api.users.changePassword({ currentPassword, newPassword });
      showMessage('success', 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      showMessage('error', 'Failed to change password.');
    } finally {
      setIsSavingSecurity(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="h-6 w-6 mr-2 text-gray-600" />
          Settings
        </h1>
        <p className="text-gray-500 mt-1">Manage your workspace and personal account preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-1">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'workspace' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Building2 className="h-4 w-4 mr-3" />
            Workspace
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'account' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User className="h-4 w-4 mr-3" />
            Account
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'security' ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Lock className="h-4 w-4 mr-3" />
            Security
          </button>
        </div>

        <div className="flex-1">
          {message && (
            <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
            {activeTab === 'workspace' && (
              <form onSubmit={handleSaveWorkspace} className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Workspace Settings</h2>
                  <div className="grid gap-6 max-w-xl">
                    <div className="space-y-2">
                      <label htmlFor="workspaceName" className="text-sm font-medium text-gray-700">Workspace Name</label>
                      <Input
                        id="workspaceName"
                        value={workspaceName}
                        onChange={(e) => setWorkspaceName(e.target.value)}
                        placeholder="Enter workspace name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="workspaceSlug" className="text-sm font-medium text-gray-700">Workspace Slug</label>
                      <Input
                        id="workspaceSlug"
                        value={workspaceSlug}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">The slug is used in your workspace URL and cannot be changed.</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <Button type="submit" disabled={isSavingWorkspace}>
                    {isSavingWorkspace ? 'Saving...' : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {activeTab === 'account' && (
              <form onSubmit={handleSaveAccount} className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
                  <div className="grid gap-6 max-w-xl">
                    <div className="space-y-2">
                      <label htmlFor="userName" className="text-sm font-medium text-gray-700">Full Name</label>
                      <Input
                        id="userName"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="userEmail" className="text-sm font-medium text-gray-700">Email Address</label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={userEmail}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">Your email address cannot be changed.</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <Button type="submit" disabled={isSavingAccount}>
                    {isSavingAccount ? 'Saving...' : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {activeTab === 'security' && (
              <form onSubmit={handleSaveSecurity} className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Security</h2>
                  <div className="grid gap-6 max-w-xl">
                    <div className="space-y-2">
                      <label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm New Password</label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <Button type="submit" disabled={isSavingSecurity || !currentPassword || !newPassword || !confirmPassword}>
                    {isSavingSecurity ? 'Updating...' : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Update Password
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
