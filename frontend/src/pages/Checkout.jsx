import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { cartAPI, orderAPI, userAPI } from '../services/api';
import { useAuthStore } from '../store/store';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'USA',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
    fetchAddresses();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await cartAPI.get(user.id);
      setCart(response.data);
      if (response.data.items.length === 0) {
        toast.error('Cart is empty');
        navigate('/cart');
      }
    } catch (error) {
      toast.error('Failed to load cart');
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await userAPI.getAddresses();
      setAddresses(response.data);
      if (response.data.length > 0) {
        const defaultAddr = response.data.find(addr => addr.is_default) || response.data[0];
        setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error('Failed to load addresses');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress && !newAddress.address_line1) {
      toast.error('Please select or enter a shipping address');
      return;
    }

    setLoading(true);
    try {
      const shippingAddress = selectedAddress || newAddress;
      
      await orderAPI.create({
        userId: user.id,
        shippingAddress,
        notes: '',
      });

      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Saved Addresses */}
          {addresses.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Select Shipping Address
              </h2>
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label key={addr.id} className="flex items-start p-4 border rounded-lg cursor-pointer hover:border-primary-600">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddress?.id === addr.id}
                      onChange={() => setSelectedAddress(addr)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <p className="font-medium">{addr.address_line1}</p>
                      {addr.address_line2 && <p className="text-gray-600">{addr.address_line2}</p>}
                      <p className="text-gray-600">
                        {addr.city}, {addr.state} {addr.postal_code}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* New Address Form */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">
              {addresses.length > 0 ? 'Or Enter New Address' : 'Shipping Address'}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Address Line 1"
                value={newAddress.address_line1}
                onChange={(e) => setNewAddress({ ...newAddress, address_line1: e.target.value })}
                className="input-field"
                onFocus={() => setSelectedAddress(null)}
              />
              <input
                type="text"
                placeholder="Address Line 2 (Optional)"
                value={newAddress.address_line2}
                onChange={(e) => setNewAddress({ ...newAddress, address_line2: e.target.value })}
                className="input-field"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={newAddress.city}
                  onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={newAddress.state}
                  onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                  className="input-field"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Postal Code"
                  value={newAddress.postal_code}
                  onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                  className="input-field"
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={newAddress.country}
                  onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Payment Method</h2>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <p className="font-semibold text-primary-800">Cash on Delivery (COD)</p>
              <p className="text-sm text-primary-600 mt-1">Pay when you receive your order</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.product?.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    ${(item.product?.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary-600">${cart.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
