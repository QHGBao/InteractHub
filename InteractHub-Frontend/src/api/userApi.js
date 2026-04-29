import axiosInstance from './axiosInstance';

export const getMyProfile   = ()         => axiosInstance.get('/user/me');
export const getUserProfile = (userId)   => axiosInstance.get(`/user/${userId}`);
export const updateProfile  = (data)     => axiosInstance.put('/user/me', data);