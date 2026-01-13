import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { groupsAPI, Group } from '../lib/api';
import { Plus, Users, Search, MoreHorizontal, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Groups: React.FC = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [createLoading, setCreateLoading] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [selectedGroupForInvite, setSelectedGroupForInvite] = useState<number | null>(null);

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const fetchGroups = async () => {
    try {
      const response = await groupsAPI.getGroups();
      setGroups(response.data);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      await groupsAPI.createGroup(newGroup);
      setNewGroup({ name: '', description: '' });
      setShowCreateModal(false);
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupForInvite || !inviteEmail) return;
    
    setInviteLoading(true);
    try {
      await groupsAPI.sendInvitation(selectedGroupForInvite, inviteEmail);
      setInviteEmail('');
      setShowInviteModal(false);
      setSelectedGroupForInvite(null);
      alert('Invitation sent successfully!');
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Failed to send invitation. Please try again.');
    } finally {
      setInviteLoading(false);
    }
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          <p className="text-gray-600">Manage your expense sharing groups</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Groups Grid */}
      {filteredGroups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No groups found' : 'No groups yet'}
            </h3>
            <p className="text-gray-500 text-center mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Create your first group to start splitting expenses with friends'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Group
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Card key={group.id.toString()} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedGroupForInvite(group.id);
                        setShowInviteModal(true);
                      }}
                    >
                      <Mail className="h-4 w-4 mr-1" />
                      Invite
                    </Button>
                    <select>
                      {groups.map((group) => (
                        <option key={group.id.toString()} value={group.id.toString()}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {group.description && (
                  <CardDescription>{group.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {group.members?.length || 0} member{(group.members?.length || 0) !== 1 ? 's' : ''}
                  </div>

                  <div className="flex -space-x-2">
                    {group.members?.slice(0, 4).map((member) => (
                      <div
                        key={member.id}
                        className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                        title={member.name}
                      >
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                    )) || <div className="text-xs text-gray-500">No members</div>}
                    {(group.members?.length || 0) > 4 && (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                        +{(group.members?.length || 0) - 4}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link to={`/groups/${group.id}`}>View</Link>
                    </Button>
                    <Button size="sm" asChild className="flex-1">
                      <Link to={`/expenses/new?group=${group.id}`}>Add Expense</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Group</CardTitle>
              <CardDescription>
                Create a group to start splitting expenses with friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter group name"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    placeholder="What's this group for?"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLoading} className="flex-1">
                    {createLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Create Group'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Invite to Group</CardTitle>
              <CardDescription>
                Send an email invitation to join this group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowInviteModal(false);
                      setInviteEmail('');
                      setSelectedGroupForInvite(null);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviteLoading} className="flex-1">
                    {inviteLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Send Invitation'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
