import { useState, useEffect } from 'react';
import { Search, Mail, Phone, MapPin, User } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { customersAPI } from '../../services/woocommerce';
import { format } from 'date-fns';

const Customers = () => {
  const { t, isRTL } = useLanguage();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customersAPI.getAll({ per_page: 50 });
      setCustomers(data);
    } catch (err) {
      setError(err.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600 mt-1">Manage your customer database</p>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search customers by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {error && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Customers Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="card text-center py-12">
          <User className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 text-lg">No customers found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCustomer(customer)}
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="text-primary-500" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {customer.first_name} {customer.last_name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">{customer.username}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {customer.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail size={16} className="mr-2 text-gray-400" />
                    <span className="truncate">{customer.email}</span>
                  </div>
                )}
                {customer.billing?.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone size={16} className="mr-2 text-gray-400" />
                    <span>{customer.billing.phone}</span>
                  </div>
                )}
                {customer.billing?.city && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin size={16} className="mr-2 text-gray-400" />
                    <span className="truncate">
                      {customer.billing.city}, {customer.billing.country}
                    </span>
                  </div>
                )}
              </div>

              {customer.date_created && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Member since {format(new Date(customer.date_created), 'MMM yyyy')}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <CustomerDetailsModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
    </div>
  );
};

const CustomerDetailsModal = ({ customer, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {customer.first_name} {customer.last_name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Account Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Username:</span>
                <span className="text-gray-900 font-medium">{customer.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="text-gray-900 font-medium">{customer.email}</span>
              </div>
              {customer.date_created && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since:</span>
                  <span className="text-gray-900 font-medium">
                    {format(new Date(customer.date_created), 'MMMM dd, yyyy')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Billing Address */}
          {customer.billing && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Billing Address</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{customer.billing.first_name} {customer.billing.last_name}</p>
                {customer.billing.company && <p>{customer.billing.company}</p>}
                <p>{customer.billing.address_1}</p>
                {customer.billing.address_2 && <p>{customer.billing.address_2}</p>}
                <p>
                  {customer.billing.city}, {customer.billing.state} {customer.billing.postcode}
                </p>
                <p>{customer.billing.country}</p>
                {customer.billing.phone && <p className="mt-2">Phone: {customer.billing.phone}</p>}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {customer.shipping && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Shipping Address</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{customer.shipping.first_name} {customer.shipping.last_name}</p>
                {customer.shipping.company && <p>{customer.shipping.company}</p>}
                <p>{customer.shipping.address_1}</p>
                {customer.shipping.address_2 && <p>{customer.shipping.address_2}</p>}
                <p>
                  {customer.shipping.city}, {customer.shipping.state} {customer.shipping.postcode}
                </p>
                <p>{customer.shipping.country}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Customers;



