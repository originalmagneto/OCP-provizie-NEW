import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Edit,
  Eye,
  Globe,
  Mail,
  Phone,
  Building,
  Upload,
  X,
  Download,
  Image
} from 'lucide-react';
import { getFirmBranding } from '../config/firmBranding';
import { useInvoices } from '../context/InvoiceContext';
import { referralServices, type ReferralFirm as ServiceReferralFirm } from '../services/referralServices';
import { resolveLogo } from '../utils/logoUtils';
import type { FirmType } from '../types';

interface ReferralOverviewProps {
  user: any;
}

// Use the service interface
type ReferralFirm = ServiceReferralFirm;

export default function ReferralOverview({ user }: ReferralOverviewProps) {
  const { invoices } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFirm, setSelectedFirm] = useState<ReferralFirm | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newFirm, setNewFirm] = useState<Partial<ReferralFirm>>({});
  const [referralFirms, setReferralFirms] = useState<ReferralFirm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isFetchingLogo, setIsFetchingLogo] = useState(false);

  const firmBranding = getFirmBranding(user.firm as FirmType);

  // Load referral firms from service
  useEffect(() => {
    const loadReferralFirms = async () => {
      try {
        setIsLoading(true);
        const firms = await referralServices.getReferralFirms(user.firm);
        setReferralFirms(firms);
      } catch (error) {
        console.error('Failed to load referral firms:', error);
        // Fallback to generating from invoices if service fails
        const firmMap = new Map<string, any>();
        invoices.forEach(invoice => {
          // Only include invoices where the current user's firm was invoiced by another firm
          if (invoice.invoicedByFirm === user.firm && invoice.referredByFirm !== user.firm) {
            const firmName = invoice.referredByFirm;
            
            if (!firmMap.has(firmName)) {
              firmMap.set(firmName, {
                id: firmName.toLowerCase(),
                name: firmName,
                logo: firmName === 'SKALLARS' ? '🏢' : firmName === 'MKMs' ? '🏛️' : '🏢',
                website: `https://${firmName.toLowerCase()}.com`,
                contactPerson: 'Contact Person',
                contactEmail: `contact@${firmName.toLowerCase()}.com`,
                contactPhone: '+1 234 567 8900',
                referralDate: invoice.date.split('T')[0],
                firstWorkDate: invoice.date.split('T')[0],
                totalInvoiced: 0,
                totalCommissionsPaid: 0,
                referredBy: 'Partnership',
                status: 'active' as const,
                notes: `Referral partner: ${firmName}`,
                createdBy: user.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              });
            }
            
            const firm = firmMap.get(firmName)!;
            firm.totalInvoiced += invoice.amount;
            const commissionAmount = (invoice.amount * invoice.commissionPercentage) / 100;
            firm.totalCommissionsPaid += commissionAmount;
            
            // Update first work date to earliest date
            if (new Date(invoice.date) < new Date(firm.firstWorkDate!)) {
              firm.firstWorkDate = invoice.date.split('T')[0];
            }
          }
        });
        setReferralFirms(Array.from(firmMap.values()));
      } finally {
        setIsLoading(false);
      }
    };

    loadReferralFirms();
  }, [invoices, user.firm, user.id]);

  const filteredFirms = referralFirms.filter(firm =>
    firm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    firm.referredBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStats = {
    totalFirms: referralFirms.length,
    activeFirms: referralFirms.filter(f => f.status === 'active').length,
    totalInvoiced: referralFirms.reduce((sum, f) => sum + f.totalInvoiced, 0),
    totalCommissions: referralFirms.reduce((sum, f) => sum + f.totalCommissionsPaid, 0)
  };

  const handleAddFirm = async () => {
    try {
      if (!newFirm.name) return;
      
      let logoUrl = newFirm.logo;
      
      // Upload logo file if provided
      if (logoFile) {
        setIsUploadingLogo(true);
        logoUrl = await referralServices.uploadLogo(logoFile, newFirm.name);
      }
      
      const firmData = {
        ...newFirm,
        logo: logoUrl,
        createdBy: user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as ReferralFirm;
      
      const createdFirmId = await referralServices.createReferralFirm(firmData);
      const createdFirm = { ...firmData, id: createdFirmId };
      setReferralFirms(prev => [...prev, createdFirm]);
      
      setIsAddModalOpen(false);
      setNewFirm({});
      setLogoFile(null);
    } catch (error) {
      console.error('Failed to add firm:', error);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleEditFirm = async () => {
    try {
      if (!newFirm.id) return;
      
      let logoUrl = newFirm.logo;
      
      // Upload new logo file if provided
      if (logoFile) {
        setIsUploadingLogo(true);
        logoUrl = await referralServices.uploadLogo(logoFile, newFirm.name || 'firm');
      }
      
      const updatedData = {
        ...newFirm,
        logo: logoUrl,
        updatedAt: new Date().toISOString()
      } as ReferralFirm;
      
      await referralServices.updateReferralFirm(newFirm.id, updatedData);
      setReferralFirms(prev => prev.map(f => f.id === newFirm.id ? { ...f, ...updatedData } : f));
      
      setSelectedFirm(null);
      setNewFirm({});
      setIsEditModalOpen(false);
      setLogoFile(null);
    } catch (error) {
      console.error('Failed to update firm:', error);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleFetchLogoFromWebsite = async () => {
    if (!newFirm.website) return;
    
    try {
      setIsFetchingLogo(true);
      const logoUrl = await referralServices.fetchLogoFromWebsite(newFirm.website);
      setNewFirm(prev => ({ ...prev, logo: logoUrl || undefined }));
    } catch (error) {
      console.error('Failed to fetch logo:', error);
    } finally {
      setIsFetchingLogo(false);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setNewFirm(prev => ({ ...prev, logo: previewUrl }));
    }
  };

  const openEditModal = (firm: ReferralFirm) => {
    setSelectedFirm(firm);
    setNewFirm(firm);
    setIsEditModalOpen(true);
  };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR'
  });

  return (
    <div id="referral-overview" className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Overview</h1>
          <p className="text-gray-600">Track and manage your referred firms</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className={`flex items-center space-x-2 px-4 py-2 ${firmBranding.theme.button.primary.bg} ${firmBranding.theme.button.primary.text} rounded-lg hover:opacity-90 transition-opacity`}
        >
          <Plus className="h-4 w-4" />
          <span>Add Referral</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Firms</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalFirms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Firms</p>
              <p className="text-2xl font-bold text-gray-900">{totalStats.activeFirms}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Invoiced</p>
              <p className="text-2xl font-bold text-gray-900">{formatter.format(totalStats.totalInvoiced)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Commissions Paid</p>
              <p className="text-2xl font-bold text-gray-900">{formatter.format(totalStats.totalCommissions)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search firms or referrers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Firms Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Firm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referred By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referral Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  First Work
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Invoiced
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFirms.map((firm) => (
                <tr key={firm.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {firm.logo ? (
                          <img 
                            src={resolveLogo(firm.logo) || firm.logo} 
                            alt={firm.name} 
                            className="w-8 h-8 rounded object-contain" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <Building className={`h-5 w-5 text-gray-400 ${firm.logo ? 'hidden' : ''}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{firm.name}</p>
                        {firm.contactPerson && (
                          <p className="text-xs text-gray-500">{firm.contactPerson}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {firm.referredBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(firm.referralDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {firm.firstWorkDate ? new Date(firm.firstWorkDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatter.format(firm.totalInvoiced)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatter.format(firm.totalCommissionsPaid)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      firm.status === 'active' ? 'bg-green-100 text-green-800' :
                      firm.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {firm.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedFirm(firm)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(firm)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Firm Detail Modal */}
      {selectedFirm && !isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{selectedFirm.name}</h2>
              <button
                onClick={() => setSelectedFirm(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    {selectedFirm.contactPerson && (
                      <p className="text-sm text-gray-900">
                        <strong>Contact:</strong> {selectedFirm.contactPerson}
                      </p>
                    )}
                    {selectedFirm.contactEmail && (
                      <p className="text-sm text-gray-900 flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>{selectedFirm.contactEmail}</span>
                      </p>
                    )}
                    {selectedFirm.contactPhone && (
                      <p className="text-sm text-gray-900 flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>{selectedFirm.contactPhone}</span>
                      </p>
                    )}
                    {selectedFirm.website && (
                      <p className="text-sm text-gray-900 flex items-center space-x-2">
                        <Globe className="h-4 w-4" />
                        <a href={selectedFirm.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {selectedFirm.website}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Referral Details</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-900">
                      <strong>Referred by:</strong> {selectedFirm.referredBy}
                    </p>
                    <p className="text-sm text-gray-900">
                      <strong>Referral Date:</strong> {new Date(selectedFirm.referralDate).toLocaleDateString()}
                    </p>
                    {selectedFirm.firstWorkDate && (
                      <p className="text-sm text-gray-900">
                        <strong>First Work:</strong> {new Date(selectedFirm.firstWorkDate).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-sm text-gray-900">
                      <strong>Status:</strong> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedFirm.status === 'active' ? 'bg-green-100 text-green-800' :
                        selectedFirm.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedFirm.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Financial Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Total Invoiced</p>
                    <p className="text-lg font-semibold text-gray-900">{formatter.format(selectedFirm.totalInvoiced)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Commissions Paid</p>
                    <p className="text-lg font-semibold text-gray-900">{formatter.format(selectedFirm.totalCommissionsPaid)}</p>
                  </div>
                </div>
              </div>
              
              {selectedFirm.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                  <p className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">{selectedFirm.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Firm Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {isAddModalOpen ? 'Add New Referral' : 'Edit Referral'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setNewFirm({});
                  setSelectedFirm(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-4">
                {/* Logo Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      {newFirm.logo ? (
                        <img 
                          src={resolveLogo(newFirm.logo) || newFirm.logo} 
                          alt="Logo" 
                          className="w-12 h-12 rounded object-contain" 
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <Image className={`h-6 w-6 text-gray-400 ${newFirm.logo ? 'hidden' : ''}`} />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <Upload className="h-4 w-4 inline mr-2" />
                          Upload Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoFileChange}
                            className="hidden"
                          />
                        </label>
                        {newFirm.website && (
                          <button
                            type="button"
                            onClick={handleFetchLogoFromWebsite}
                            disabled={isFetchingLogo}
                            className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-50"
                          >
                            <Download className="h-4 w-4 inline mr-2" />
                            {isFetchingLogo ? 'Fetching...' : 'Fetch from Website'}
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Upload an image or fetch from website</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Firm Name *</label>
                    <input
                      type="text"
                      value={newFirm.name || ''}
                      onChange={(e) => setNewFirm({ ...newFirm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter firm name"
                    />
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                    <input
                      type="text"
                      value={newFirm.contactPerson || ''}
                      onChange={(e) => setNewFirm({ ...newFirm, contactPerson: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter contact person"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newFirm.contactEmail || ''}
                      onChange={(e) => setNewFirm({ ...newFirm, contactEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={newFirm.contactPhone || ''}
                      onChange={(e) => setNewFirm({ ...newFirm, contactPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <input
                      type="url"
                      value={newFirm.website || ''}
                      onChange={(e) => setNewFirm({ ...newFirm, website: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Referred By *</label>
                    <input
                      type="text"
                      value={newFirm.referredBy || ''}
                      onChange={(e) => setNewFirm({ ...newFirm, referredBy: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter referrer name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Referral Date *</label>
                    <input
                      type="date"
                      value={newFirm.referralDate || ''}
                      onChange={(e) => setNewFirm({ ...newFirm, referralDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Work Date</label>
                    <input
                      type="date"
                      value={newFirm.firstWorkDate || ''}
                      onChange={(e) => setNewFirm({ ...newFirm, firstWorkDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={newFirm.notes || ''}
                  onChange={(e) => setNewFirm({ ...newFirm, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setNewFirm({});
                  setSelectedFirm(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={isAddModalOpen ? handleAddFirm : handleEditFirm}
                disabled={isUploadingLogo}
                className={`px-6 py-2 ${firmBranding.theme.button.primary.bg} ${firmBranding.theme.button.primary.text} rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50`}
              >
                {isUploadingLogo ? 'Uploading...' : (isAddModalOpen ? 'Add Referral' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}