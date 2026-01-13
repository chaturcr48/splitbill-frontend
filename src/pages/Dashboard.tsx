import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { groupsAPI, expensesAPI } from '../lib/api';
import { Plus, Users, Receipt, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface DashboardStats {
  totalGroups: number;
  totalExpenses: number;
  thisMonthExpenses: number;
  youOwe: number;
  youAreOwed: number;
}

interface RecentGroup {
  id: string;
  name: string;
  description?: string;
  member_count: number;
}

interface RecentExpense {
  id: string;
  description: string;
  amount: number;
  group_name: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    totalExpenses: 0,
    thisMonthExpenses: 0,
    youOwe: 0,
    youAreOwed: 0,
  });
  const [recentGroups, setRecentGroups] = useState<RecentGroup[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<RecentExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard useEffect triggered, user:', user);
    const fetchData = async () => {
      console.log('Starting dashboard data fetch...');
      try {
        // Fetch groups and expenses data
        console.log('Making API calls...');
        const [groupsResponse, expensesResponse] = await Promise.all([
          groupsAPI.getGroups(),
          expensesAPI.getExpenses(),
        ]);

        const groups = groupsResponse.data;
        const expenses = expensesResponse.data;
        console.log('API responses:', { groups, expenses });

        // Calculate stats
        const totalThisMonth = expenses
          .filter((expense: any) => {
            const expenseDate = new Date(expense.created_at);
            const now = new Date();
            return expenseDate.getMonth() === now.getMonth() &&
              expenseDate.getFullYear() === now.getFullYear();
          })
          .reduce((sum: number, expense: any) => sum + expense.amount, 0);

        setStats({
          totalGroups: groups.length,
          totalExpenses: expenses.length,
          thisMonthExpenses: totalThisMonth,
          youOwe: 0, // Calculate based on your share
          youAreOwed: 0, // Calculate based on what others owe you
        });

        // Set recent data (last 5 items)
        setRecentGroups(groups.slice(0, 5).map((group: any) => ({
          id: group.id,
          name: group.name,
          description: group.description,
          member_count: group.members?.length || 0,
        })));

        setRecentExpenses(expenses.slice(0, 5).map((expense: any) => ({
          id: expense.id,
          description: expense.description,
          amount: expense.amount,
          group_name: expense.group?.name || 'Unknown',
          created_at: expense.created_at,
        })));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set loading to false even on error so UI shows
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      console.log('No user, setting loading to false');
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your SplitBill dashboard</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/groups">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Group
            </Button>
          </Link>
          <Link to="/expenses">
            <Button variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
            <p className="text-xs text-muted-foreground">
              Active groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExpenses}</div>
            <p className="text-xs text-muted-foreground">
              All time expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.thisMonthExpenses.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total spent this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(stats.youAreOwed - stats.youOwe).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              You are owed ${stats.youAreOwed.toFixed(2)} • You owe ${stats.youOwe.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Groups */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Groups</CardTitle>
            <CardDescription>
              Your most recently created groups
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentGroups.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No groups yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating your first group.
                </p>
                <div className="mt-6">
                  <Link to="/groups">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Group
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentGroups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{group.name}</h4>
                      <p className="text-sm text-gray-500">
                        {group.member_count} members
                      </p>
                    </div>
                    <Link to={`/groups/${group.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>
              Your most recent expense activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentExpenses.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start tracking expenses in your groups.
                </p>
                <div className="mt-6">
                  <Link to="/expenses">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Expense
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{expense.description}</h4>
                      <p className="text-sm text-gray-500">
                        {expense.group_name} • ${expense.amount.toFixed(2)}
                      </p>
                    </div>
                    <Link to={`/expenses/${expense.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { Dashboard };
