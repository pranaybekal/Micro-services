import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/store';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // ✅ FRONTEND VALIDATION
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;

      console.log('REGISTER PAYLOAD:', registerData); // 🔍 DEBUG

      const response = await authAPI.register(registerData);

      login(response.data.user, response.data.token);
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <UserPlus className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold">Create Account</h2>
          <p className="text-gray-600 mt-2">Join us today</p>
        </div>

        <div className="card space-y-4">
          {/* First + Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="First name"
              className="input-field"
              value={formData.first_name}
              onChange={(e) =>
                setFormData({ ...formData, first_name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Last name"
              className="input-field"
              value={formData.last_name}
              onChange={(e) =>
                setFormData({ ...formData, last_name: e.target.value })
              }
            />
          </div>

          {/* Email */}
          <input
            type="email"
            placeholder="Email address"
            className="input-field"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          {/* Phone */}
          <input
            type="tel"
            placeholder="Phone number"
            className="input-field"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            className="input-field"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          {/* Confirm Password */}
          <input
            type="password"
            placeholder="Confirm password"
            className="input-field"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
          />

          {/* Submit */}
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Login link */}
          <p className="text-sm text-gray-600 text-center">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
