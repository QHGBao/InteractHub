import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, watch } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      navigate('/');
    } catch (error) {
      setError('root', { message: error.response?.data?.message || 'Đăng ký thất bại' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">Đăng ký</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
            <input {...register('displayName', { required: 'Bắt buộc' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nguyễn Văn A" />
            {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
            <input {...register('userName', { required: 'Bắt buộc', minLength: { value: 3, message: 'Tối thiểu 3 ký tự' } })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="username123" />
            {errors.userName && <p className="text-red-500 text-sm mt-1">{errors.userName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input {...register('email', { required: 'Bắt buộc', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email không hợp lệ' } })}
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <input {...register('password', { required: 'Bắt buộc', minLength: { value: 6, message: 'Tối thiểu 6 ký tự' } })}
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu</label>
            <input {...register('confirmPassword', { required: 'Bắt buộc', validate: v => v === password || 'Mật khẩu không khớp' })}
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••" />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>
          {errors.root && <p className="text-red-500 text-sm text-center">{errors.root.message}</p>}
          <button type="submit" disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
            {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          Đã có tài khoản? <Link to="/login" className="text-blue-600 hover:underline">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};
export default RegisterPage;