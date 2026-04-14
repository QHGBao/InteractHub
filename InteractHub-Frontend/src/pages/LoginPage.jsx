import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data);
      navigate('/');
    } catch (error) {
      setError('root', { message: error.response?.data?.message || 'Đăng nhập thất bại' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Đăng nhập</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('email', { required: 'Email là bắt buộc' })}
              type="email" placeholder="email@example.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input {...register('password', { required: 'Mật khẩu là bắt buộc' })}
              type="password" placeholder="••••••"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          {errors.root && <p className="text-red-500 text-sm text-center">{errors.root.message}</p>}
          <button type="submit" disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Chưa có tài khoản? <Link to="/register" className="text-blue-600 hover:underline">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
};
export default LoginPage;