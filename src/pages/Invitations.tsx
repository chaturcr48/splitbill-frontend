import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { groupsAPI, Invitation, Group } from '../lib/api';
import { Mail, Users, Check, X, Calendar } from 'lucide-react';

export const Invitations: React.FC = () => {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      console.log('Fetching invitations...');
      const [invitationsRes, groupsRes] = await Promise.all([
        groupsAPI.getInvitations(),
        groupsAPI.getGroups(),
      ]);
      
      console.log('Invitations response:', invitationsRes.data);
      console.log('Groups response:', groupsRes.data);
      
      setInvitations(invitationsRes.data);
      setGroups(groupsRes.data);
    } catch (error: any) {
      console.error('Error fetching invitations:', error);
      if (error.response?.status === 404) {
        console.warn('Invitations endpoint not implemented yet');
      } else if (error.response?.status === 405) {
        console.warn('Invitations endpoint method not allowed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: number) => {
    try {
      await groupsAPI.acceptInvitation(invitationId);
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      alert('Invitation accepted! You can now access this group.');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Failed to accept invitation. Please try again.');
    }
  };

  const handleRejectInvitation = async (invitationId: number) => {
    try {
      await groupsAPI.rejectInvitation(invitationId);
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      alert('Invitation rejected.');
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      alert('Failed to reject invitation. Please try again.');
    }
  };

  // Helper functions to find related data
  const getGroupById = (groupId: number) => {
    return groups.find(g => g.id === groupId);
  };

  const getUserNameById = (userId: number) => {
    // For now, return a placeholder since we don't have users data
    // In a real app, you'd fetch users or have them in the response
    return `User ${userId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Invitations</h1>
        <p className="text-gray-600">Manage your group invitations</p>
      </div>

      {invitations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations</h3>
            <p className="text-gray-500 text-center">
              You don't have any pending invitations
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {invitations.map((invitation) => {
            const group = getGroupById(invitation.group_id);
            const inviterName = getUserNameById(invitation.invited_by);
            
            return (
              <Card key={invitation.id.toString()} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                          {group ? group.name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {group ? group.name : `Group ${invitation.group_id}`}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              Invited by {inviterName}
                            </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(invitation.created_at).toLocaleDateString()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            invitation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            invitation.status === 'accepted' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {invitation.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {invitation.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectInvitation(invitation.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAcceptInvitation(invitation.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
