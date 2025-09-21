'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import apiService from '@/lib/api'
import { useToast } from '@/contexts/ToastContext'

interface TeamMember {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'pilot'
  isActive: boolean
  phone?: string
  pilotLicense?: string
  experience: number
  specializations: string[]
  lastLogin?: string
  assignedMissions?: string[]
}

export default function TeamPage() {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [viewingMember, setViewingMember] = useState<TeamMember | null>(null)
  const [newMember, setNewMember] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'pilot' as 'admin' | 'pilot',
    phone: '',
    pilotLicense: '',
    experience: 0,
    specializations: [] as string[]
  })

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeamData()
    }
  }, [isAuthenticated])

  const fetchTeamData = async () => {
    try {
      setLoading(true)
      const response = await apiService.getUsers()
      setTeam(response.data.data || [])
    } catch (error: any) {
      addToast('Failed to load team data', 'error')
      console.error('Error fetching team:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    try {
      if (!newMember.firstName || !newMember.lastName || !newMember.email || !newMember.password) {
        addToast('Please fill in all required fields', 'error')
        return
      }

      await apiService.createUser(newMember)
      addToast('Team member added successfully', 'success')
      setShowAddModal(false)
      setNewMember({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'pilot',
        phone: '',
        pilotLicense: '',
        experience: 0,
        specializations: []
      })
      fetchTeamData()
    } catch (error: any) {
      addToast(error.message || 'Failed to add team member', 'error')
    }
  }

  const handleEditMember = async () => {
    try {
      if (!editingMember) return

      const updateData = {
        firstName: editingMember.firstName,
        lastName: editingMember.lastName,
        email: editingMember.email,
        role: editingMember.role,
        phone: editingMember.phone,
        pilotLicense: editingMember.pilotLicense,
        experience: editingMember.experience,
        specializations: editingMember.specializations,
        isActive: editingMember.isActive
      }

      await apiService.updateUser(editingMember._id, updateData)
      addToast('Team member updated successfully', 'success')
      setEditingMember(null)
      fetchTeamData()
    } catch (error: any) {
      addToast(error.message || 'Failed to update team member', 'error')
    }
  }

  const handleDeleteMember = async (id: string) => {
    try {
      if (window.confirm('Are you sure you want to delete this team member?')) {
        await apiService.deleteUser(id)
        addToast('Team member deleted successfully', 'success')
        fetchTeamData()
      }
    } catch (error: any) {
      addToast(error.message || 'Failed to delete team member', 'error')
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'pilot': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600 mt-2">Manage pilots and team members</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Dashboard
            </button>
            {user?.role === 'admin' && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Add Team Member
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Members</h3>
            <p className="text-2xl font-bold text-gray-900">{team.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Active</h3>
            <p className="text-2xl font-bold text-green-600">
              {team.filter(m => m.isActive).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Admins</h3>
            <p className="text-2xl font-bold text-purple-600">
              {team.filter(m => m.role === 'admin').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Pilots</h3>
            <p className="text-2xl font-bold text-blue-600">
              {team.filter(m => m.role === 'pilot').length}
            </p>
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading team members...</p>
            </div>
          ) : (
            team.map((member) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {member.firstName} {member.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Role:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                        {member.role}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.isActive)}`}>
                        {member.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Experience:</span>
                      <span className="text-sm font-medium text-gray-900">{member.experience} years</span>
                    </div>

                    {member.pilotLicense && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">License:</span>
                        <span className="text-sm font-medium text-gray-900">{member.pilotLicense}</span>
                      </div>
                    )}

                    {member.specializations && member.specializations.length > 0 && (
                      <div>
                        <span className="text-sm text-gray-500">Specializations:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {member.specializations.map((spec, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                            >
                              {spec}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {member.assignedMissions && member.assignedMissions.length > 0 && (
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Missions:</span>
                          <span className="text-xs text-gray-500">{member.assignedMissions.length} assigned</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button 
                      onClick={() => setViewingMember(member)}
                      className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      View Profile
                    </button>
                    {user?.role === 'admin' && (
                      <>
                        <button 
                          onClick={() => setEditingMember(member)}
                          className="flex-1 px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteMember(member._id)}
                          className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Member Modal */}
      {(showAddModal || editingMember) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <input
                  type="text"
                  value={editingMember ? editingMember.firstName : newMember.firstName}
                  onChange={(e) => editingMember 
                    ? setEditingMember({...editingMember, firstName: e.target.value})
                    : setNewMember({...newMember, firstName: e.target.value})
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <input
                  type="text"
                  value={editingMember ? editingMember.lastName : newMember.lastName}
                  onChange={(e) => editingMember 
                    ? setEditingMember({...editingMember, lastName: e.target.value})
                    : setNewMember({...newMember, lastName: e.target.value})
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editingMember ? editingMember.email : newMember.email}
                  onChange={(e) => editingMember 
                    ? setEditingMember({...editingMember, email: e.target.value})
                    : setNewMember({...newMember, email: e.target.value})
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {!editingMember && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={newMember.password}
                    onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={editingMember ? editingMember.role : newMember.role}
                  onChange={(e) => editingMember 
                    ? setEditingMember({...editingMember, role: e.target.value as 'admin' | 'pilot'})
                    : setNewMember({...newMember, role: e.target.value as 'admin' | 'pilot'})
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pilot">Pilot</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={editingMember ? editingMember.phone || '' : newMember.phone}
                  onChange={(e) => editingMember 
                    ? setEditingMember({...editingMember, phone: e.target.value})
                    : setNewMember({...newMember, phone: e.target.value})
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Pilot License</label>
                <input
                  type="text"
                  value={editingMember ? editingMember.pilotLicense || '' : newMember.pilotLicense}
                  onChange={(e) => editingMember 
                    ? setEditingMember({...editingMember, pilotLicense: e.target.value})
                    : setNewMember({...newMember, pilotLicense: e.target.value})
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
                <input
                  type="number"
                  min="0"
                  value={editingMember ? editingMember.experience : newMember.experience}
                  onChange={(e) => editingMember 
                    ? setEditingMember({...editingMember, experience: parseInt(e.target.value) || 0})
                    : setNewMember({...newMember, experience: parseInt(e.target.value) || 0})
                  }
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {editingMember && (
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingMember.isActive}
                      onChange={(e) => setEditingMember({...editingMember, isActive: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={editingMember ? handleEditMember : handleAddMember}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingMember ? 'Update' : 'Add'} Member
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingMember(null)
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Member Modal */}
      {viewingMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Team Member Details</h2>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {viewingMember.firstName.charAt(0)}{viewingMember.lastName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {viewingMember.firstName} {viewingMember.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{viewingMember.email}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(viewingMember.role)}`}>
                  {viewingMember.role}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(viewingMember.isActive)}`}>
                  {viewingMember.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Experience</label>
                <p className="text-sm text-gray-900">{viewingMember.experience} years</p>
              </div>
              
              {viewingMember.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-sm text-gray-900">{viewingMember.phone}</p>
                </div>
              )}
              
              {viewingMember.pilotLicense && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Pilot License</label>
                  <p className="text-sm text-gray-900">{viewingMember.pilotLicense}</p>
                </div>
              )}
              
              {viewingMember.specializations && viewingMember.specializations.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Specializations</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {viewingMember.specializations.map((spec, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {viewingMember.assignedMissions && viewingMember.assignedMissions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Missions</label>
                  <p className="text-sm text-gray-900">{viewingMember.assignedMissions.length} missions assigned</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setViewingMember(null)}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}