import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { expensesAPI, groupsAPI, Expense, Group } from '../lib/api';
import { Plus, Receipt, Search, Filter, Calendar, DollarSign, Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const Expenses: React.FC = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    group_id: '',
    split_between: [] as string[],
  });
  const [addLoading, setAddLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const groupIdFromUrl = searchParams.get('group');

  useEffect(() => {
    fetchData();
    if (groupIdFromUrl) {
      setSelectedGroup(groupIdFromUrl);
      setNewExpense({ ...newExpense, group_id: groupIdFromUrl });
    }
  }, [user]);

  const fetchData = async () => {
    console.log('Expenses fetchData called at:', new Date().toISOString());
    try {
      console.log('Making API calls...');
      const [expensesRes, groupsRes] = await Promise.all([
        expensesAPI.getExpenses(),
        groupsAPI.getGroups(),
      ]);
      console.log('API responses received:', { expenses: expensesRes.data, groups: groupsRes.data });
      setExpenses(expensesRes.data);
      setGroups(groupsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);

    try {
      await expensesAPI.createExpense({
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        group_id: newExpense.group_id,
        split_between: newExpense.split_between.length > 0 ? newExpense.split_between :
          [], // TODO: Handle member selection when backend supports it
      });
      setNewExpense({ description: '', amount: '', group_id: '', split_between: [] });
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Error adding expense:', error);
    } finally {
      setAddLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = !selectedGroup || 
      (typeof expense.group === 'object' ? expense.group.id : expense.group) === selectedGroup;
    return matchesSearch && matchesGroup;
  });
  
  const selectedGroupData = groups.find(g => 
  (typeof g === 'object' ? g.id : g) === selectedGroup
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
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600">Track and manage your shared expenses</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Groups</option>
            {groups.map((group) => (
              <option key={typeof group === 'object' ? group.id : group} value={typeof group === 'object' ? group.id : group}>
                {typeof group === 'object' ? group.name : `Group ${group}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredExpenses.length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedGroupData ? `In ${typeof selectedGroupData === 'object' ? selectedGroupData.name : `Group ${selectedGroupData}`}` : 'Across all groups'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredExpenses.length > 0
                ? (filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0) / filteredExpenses.length).toFixed(2)
                : '0.00'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Per expense
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Receipt className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || selectedGroup ? 'No expenses found' : 'No expenses yet'}
            </h3>
            <p className="text-gray-500 text-center mb-6">
              {searchTerm || selectedGroup
                ? 'Try adjusting your filters'
                : 'Add your first expense to start tracking'
              }
            </p>
            {!searchTerm && !selectedGroup && (
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-medium">
                        {typeof expense.paid_by === 'object' ? expense.paid_by.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{expense.description}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {typeof expense.group === 'object' ? expense.group.name : `Group ${expense.group}`}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(expense.created_at).toLocaleDateString()}
                          </span>
                          <span>Paid by {typeof expense.paid_by === 'object' ? expense.paid_by.name : `User ${expense.paid_by}`}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${expense.amount.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500">
                      Split between {Array.isArray(expense.split_between) ? expense.split_between.length : 0} people
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
              <CardDescription>
                Record a new expense to split with your group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="What was this expense for?"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group">Group</Label>
                  <select
                    id="group"
                    value={newExpense.group_id}
                    onChange={(e) => setNewExpense({ ...newExpense, group_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Select a group</option>
                    {groups.map((group) => (
                      <option key={typeof group === 'object' ? group.id : group} value={typeof group === 'object' ? group.id : group}>
                        {typeof group === 'object' ? group.name : `Group ${group}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addLoading} className="flex-1">
                    {addLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      'Add Expense'
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
