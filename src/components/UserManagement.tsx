import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userServices } from '../services/userServices';
import type { FirmUser, UserRole } from '../types';
import { Users, UserPlus, Shield, ShieldCheck, Eye, EyeOff, Trash2, Edit } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const firmUsers = await userServices.getFirmUsers(user.firm);
      setUsers(firmUsers);
    } catch (error) {
      setError('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [user]);

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
          <p className="text-gray-600">Manage users for {user.firm}</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
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