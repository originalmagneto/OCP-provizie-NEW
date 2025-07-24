import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userServices } from '../services/userServices';
import { FirmUser, UserRole } from '../types';
import { Users, UserPlus, Shield, ShieldCheck, Eye, EyeOff, Trash2, Edit, Clock, CheckCircle } from 'lucide-react';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, collection, getDocs, query, where } from 'firebase/firestore';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

function AddUserModal({ isOpen, onClose, onUserAdded }: AddUserModalProps) {
  const { createFirmUser, user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as UserRole
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      await createFirmUser(
        formData.email,
        formData.password,
        formData.name,
        user.firm,
        formData.role
      );
      
      setFormData({ name: '', email: '', password: '', role: 'user' });
      onUserAdded();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Add New User</h2>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<FirmUser[]>([]);
  const [pendingUsers, setPendingUsers] = useState<FirmUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [showAllFirms, setShowAllFirms] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const loadUsers = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError('');
      
      // Check if Firebase is properly configured
      const isFirebaseConfigured = import.meta.env.VITE_FIREBASE_PROJECT_ID && 
        import.meta.env.VITE_FIREBASE_PROJECT_ID !== 'demo-project';
      
      if (!isFirebaseConfigured) {
        // Provide mock data when Firebase is not configured
        const mockUsers: FirmUser[] = [
          {
            id: 'mock-admin-1',
            name: user.name,
            email: user.email,
            firm: user.firm,
            role: 'admin',
            isActive: true,
            createdAt: new Date().toISOString(),
            createdBy: 'system'
          },
          {
            id: 'mock-user-1',
            name: 'Demo User',
            email: 'demo@' + user.firm.toLowerCase() + '.com',
            firm: user.firm,
            role: 'user',
            isActive: true,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'mock-admin-1'
          },
          {
            id: 'mock-user-2',
            name: 'Sample User',
            email: 'sample@' + user.firm.toLowerCase() + '.com',
            firm: user.firm,
            role: 'user',
            isActive: false,
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'mock-admin-1'
          },
          {
            id: 'mock-pending-1',
            name: 'John Pending',
            email: 'john.pending@' + user.firm.toLowerCase() + '.com',
            firm: user.firm,
            role: 'user',
            isActive: false,
            pendingApproval: true,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            createdBy: 'system'
          }
        ];
        setUsers(mockUsers);
        setError('Demo mode: Firebase not configured. Showing sample data.');
        return;
      }
      
      // Load users based on current view mode
      if (showAllFirms) {
        const allUsers = await userServices.getAllUsers();
        setUsers(allUsers);
      } else {
        const firmUsers = await userServices.getFirmUsers(user.firm);
        setUsers(firmUsers);
      }
      
      // Always load pending users from all firms for approval
      const allPendingUsers = await userServices.getAllPendingUsers();
      setPendingUsers(allPendingUsers);
    } catch (error) {
      setError('Failed to load users. Please check your Firebase configuration.');
      console.error('Error loading users:', error);
      
      // Provide fallback mock data even on error
      const fallbackUsers: FirmUser[] = [
        {
          id: 'fallback-admin',
          name: user.name,
          email: user.email,
          firm: user.firm,
          role: 'admin',
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: 'system'
        }
      ];
      setUsers(fallbackUsers);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [user, showAllFirms]);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await userServices.toggleUserStatus(userId, !currentStatus);
      await loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      await userServices.updateUserRole(userId, newRole);
      await loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await userServices.approveUser(userId);
      await loadUsers();
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const debugAdminPermissions = async () => {
    try {
      setDebugInfo('Starting admin debug...');
      
      if (!user) {
        setDebugInfo('No user logged in');
        return;
      }
      
      // Check current user's role
      const userDoc = await getDoc(doc(db, 'users', user.id));
      if (!userDoc.exists()) {
        setDebugInfo('User document does not exist');
        return;
      }
      
      const userData = userDoc.data();
      let debugText = `Current user: ${user.email}\n`;
      debugText += `User ID: ${user.id}\n`;
      debugText += `Role: ${userData.role}\n`;
      debugText += `Active: ${userData.isActive}\n`;
      debugText += `Pending: ${userData.pendingApproval}\n`;
      debugText += `Firm: ${userData.firm}\n`;
      
      if (userData.role !== 'admin') {
        debugText += '\n❌ User is not admin. Updating role...';
        
        await updateDoc(doc(db, 'users', user.id), {
          role: 'admin',
          isActive: true,
          pendingApproval: false,
          updatedAt: new Date().toISOString()
        });
        
        debugText += '\n✅ Role updated to admin';
      }
      
      // Test permissions
      debugText += '\n\nTesting permissions...';
      
      try {
        const usersRef = collection(db, 'users');
        const allUsersSnapshot = await getDocs(usersRef);
        debugText += `\n✅ All users query: ${allUsersSnapshot.size} users`;
        
        const pendingQuery = query(usersRef, where('pendingApproval', '==', true));
        const pendingSnapshot = await getDocs(pendingQuery);
        debugText += `\n✅ Pending users query: ${pendingSnapshot.size} pending`;
        
        debugText += '\n\n🎉 All tests passed!';
      } catch (permError: any) {
        debugText += `\n❌ Permission test failed: ${permError.message}`;
      }
      
      setDebugInfo(debugText);
      
    } catch (error: any) {
      setDebugInfo(`Debug failed: ${error.message}`);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500">
          <Shield className="mx-auto h-12 w-12 mb-4" />
          <p>Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="text-gray-500">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">
            {showAllFirms ? 'Manage users across all firms' : `Manage users for ${user.firm}`}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showAllFirms}
                onChange={(e) => setShowAllFirms(e.target.checked)}
                className="sr-only"
              />
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                showAllFirms ? 'bg-indigo-600' : 'bg-gray-200'
              }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  showAllFirms ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </div>
              <span className="ml-2 text-sm text-gray-700">
                Show all firms
              </span>
            </label>
          </div>
          <button
            onClick={debugAdminPermissions}
            className="flex items-center px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 mr-2"
          >
            <Shield className="h-4 w-4 mr-2" />
            Debug Admin
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {debugInfo && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
          <h3 className="font-semibold mb-2">Debug Information:</h3>
          <pre className="text-sm whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}

      {/* Pending Approvals Section - Shows all pending users across all firms */}
      {pendingUsers.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
            <h2 className="text-lg font-semibold text-yellow-800">
              Pending Approvals ({pendingUsers.length})
            </h2>
            <span className="ml-2 text-sm text-yellow-600">
              - All firms
            </span>
          </div>
          <div className="space-y-3">
            {pendingUsers.map((pendingUser) => (
              <div key={pendingUser.id} className="flex items-center justify-between bg-white p-3 rounded border">
                <div>
                  <div className="font-medium text-gray-900">{pendingUser.name}</div>
                  <div className="text-sm text-gray-500">{pendingUser.email}</div>
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <span>Firm: <span className="font-medium text-gray-600">{pendingUser.firm}</span></span>
                    <span>•</span>
                    <span>Requested: {new Date(pendingUser.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleApproveUser(pendingUser.id)}
                  className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              {showAllFirms && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Firm
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((firmUser) => (
              <tr key={firmUser.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {firmUser.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {firmUser.email}
                    </div>
                  </div>
                </td>
                {showAllFirms && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {firmUser.firm}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={firmUser.role}
                    onChange={(e) => handleUpdateRole(firmUser.id, e.target.value as UserRole)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                    disabled={firmUser.id === user.id} // Can't change own role
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    firmUser.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {firmUser.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(firmUser.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleToggleUserStatus(firmUser.id, firmUser.isActive)}
                      className={`p-1 rounded ${
                        firmUser.isActive 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                      disabled={firmUser.id === user.id} // Can't deactivate self
                      title={firmUser.isActive ? 'Deactivate user' : 'Activate user'}
                    >
                      {firmUser.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new user to your firm.
            </p>
          </div>
        )}
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={loadUsers}
      />
    </div>
  );
}