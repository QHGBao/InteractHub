import axiosInstance from './axiosInstance';

export const getMyProfile   = ()         => axiosInstance.get('/user/me');
export const getUserProfile = (userId)   => axiosInstance.get(`/user/${userId}`);
export const updateProfile  = (data)     => axiosInstance.put('/user/me', data);

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosInstance.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
};