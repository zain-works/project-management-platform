import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { api } from '../../api/client.js';
import { Button } from '../../components/ui/Button.js';
import { Input } from '../../components/ui/Input.js';
import { Modal } from '../../components/ui/Modal.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { RoleBadge } from '../../components/ui/Badge.js';
import { Users, UserPlus, Mail, Shield, Crown, Search, Check, AlertCircle } from 'lucide-react';
import { WorkspaceRole } from '@pmp/shared';

interface Member {
  id: string;
  userId: string;
  role: WorkspaceRole;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export const TeamPage: React.FC = () => {
  const { currentWorkspace } = useWorkspace();
  const { user } = useAuth();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>(WorkspaceRole.MEMBER);
  const [isInviting, setIsInviting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (currentWorkspace) {
      loadMembers();
    }
  }, [currentWorkspace]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      if (currentWorkspace) {
        const response = await api.workspaces.listMembers(currentWorkspace.id);
        const list = Array.isArray(response)
          ? response
          : (response.members || response.data || []);
        setMembers(list);
      }
    } catch (error) {
      console.error('Failed to load members', error);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace || !inviteEmail) return;

    setIsInviting(true);
    try {
      await api.workspaces.inviteMember(currentWorkspace.id, { email: inviteEmail, role: inviteRole });
      showToast('success', 'Invitation sent successfully!');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole(WorkspaceRole.MEMBER);
      // Refresh members after inviting, assuming backend auto-adds or lists pending invites
      loadMembers();
    } catch (error: any) {
      showToast('error', error?.response?.data?.message || 'Failed to send invitation.');
    } finally {
      setIsInviting(false);
    }
  };

  const filteredMembers = members.filter(member => 
    member.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {toastMessage && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg flex items-center space-x-2 z-50 ${
          toastMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {toastMessage.type === 'success' ? <Check className="w-5 h-5 text-green-500" /> : <AlertCircle className="w-5 h-5 text-red-500" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            Team Members
          </h1>
          <p className="text-gray-500 mt-1">Manage who has access to this workspace.</p>
        </div>
        <Button onClick={() => setIsInviteModalOpen(true)} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invite Member
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search members by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-4">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredMembers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={searchQuery ? "No members found" : "No other members yet"}
          description={searchQuery ? "Try a different search term" : "Invite people to collaborate in this workspace."}
          actionText={!searchQuery ? "Invite Someone" : undefined}
          onAction={!searchQuery ? () => setIsInviteModalOpen(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg shrink-0">
                {member.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900 truncate pr-2">
                    {member.user.name} {member.userId === user?.id && <span className="text-gray-400 text-xs font-normal">(You)</span>}
                  </h3>
                  {member.role === WorkspaceRole.OWNER && <Crown className="w-4 h-4 text-yellow-500 shrink-0" />}
                </div>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Mail className="w-3 h-3 mr-1" />
                  <span className="truncate">{member.user.email}</span>
                </div>
                <div className="mt-2 flex items-center space-x-2">
                  <RoleBadge role={member.role} />
                  {member.role === WorkspaceRole.ADMIN && <Shield className="w-3 h-3 text-red-500" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite Member"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <Input
              type="email"
              required
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value={WorkspaceRole.MEMBER}>Member</option>
              <option value={WorkspaceRole.PROJECT_MANAGER}>Project Manager</option>
              <option value={WorkspaceRole.ADMIN}>Admin</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isInviting || !inviteEmail}>
              {isInviting ? 'Sending...' : 'Send Invite'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamPage;
