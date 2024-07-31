import React, { useState, useEffect } from 'react';
import api from '@api';
import { logger } from '@lib/logger';

import { Separator } from '@ui/separator';

import { ProfileTab } from '@/components/app/settings/profile-tab';
import { AccountTab } from '@/components/app/settings/account-tab';
import { SecurityTab } from '@/components/app/settings/security-tab';
import { UserProfile, SettingsTab } from '@/components/app/settings/types';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Profile');
  const [profile, setProfile] = useState<UserProfile>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    bio: '',
    birth_date: '',
    phone_number: '',
    address: '',
    profile_picture: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    logger.log('Is authenticated:', api.auth.isAuthenticated());
    fetchUserProfileData();
  }, []);

  const fetchUserProfileData = async () => {
    try {
      setIsLoading(true);
      if (!api.auth.isAuthenticated()) {
        throw new Error('Not authenticated');
      }
      const userData = await api.user.getUserProfile();
      setProfile({
        username: userData.username || '',
        email: userData.email || '',
        first_name: userData.first_name || '',
        last_name: userData.last_name || '',
        bio: userData.bio || '',
        birth_date: userData.birth_date || '',
        phone_number: userData.phone_number || '',
        address: userData.address || '',
        profile_picture: userData.profile_picture || null,
      });
      setIsError(false);
    } catch (error) {
      logger.error('Fetch user profile error:', error);
      setIsError(true);
      setErrorMessage('Failed to fetch user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfileAndResetFlagsOnEvents = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.id]: e.target.value });
    setIsError(false);
    setIsSuccess(false);
  };

  const handleImageSelect = async (file: File | null) => {
    try {
      if (file) {
        const imageUrl = URL.createObjectURL(file);
        setProfile((prevProfile) => ({ ...prevProfile, profile_picture: imageUrl }));
        setIsSuccess(true);
        setSuccessMessage('Profile picture updated successfully');
      } else {
        setProfile((prevProfile) => ({ ...prevProfile, profile_picture: null }));
        setIsSuccess(true);
        setSuccessMessage('Profile picture removed successfully');
      }
    } catch (error) {
      setIsError(true);
      setErrorMessage('Failed to update profile picture');
      logger.error('Profile picture update error:', error);
    }
  };

  const handleProfileSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    try {
      const formData = new FormData();
      ['username', 'first_name', 'last_name', 'bio'].forEach((key) => {
        if (profile[key as keyof UserProfile]) {
          formData.append(key, profile[key as keyof UserProfile] as string);
        }
      });

      await api.user.updateUserProfile(formData);
      setIsSuccess(true);
      setSuccessMessage('Profile updated successfully');
    } catch (error) {
      setIsError(true);
      setErrorMessage('Failed to update profile');
      logger.error('Profile update error:', error);
      throw error;
    }
  };

  const handleAccountSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    try {
      const accountData = {
        birth_date: profile.birth_date,
        phone_number: profile.phone_number,
        address: profile.address,
      };
      await api.user.updateUserProfile(accountData);
      setIsSuccess(true);
      setSuccessMessage('Account information updated successfully');
    } catch (error) {
      setIsError(true);
      setErrorMessage('Failed to update account information');
    }
  };

  const handleSecuritySubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    try {
      await api.user.updateUserProfile({ email: profile.email });
      setIsSuccess(true);
      setSuccessMessage('Email updated successfully');
    } catch (error) {
      setIsError(true);
      setErrorMessage('Failed to update email');
    }
  };

  const handlePasswordChange = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (newPassword !== confirmPassword) {
      setIsError(true);
      setErrorMessage('Passwords do not match');
      return;
    }
    try {
      await api.password.changePassword({
        old_password: currentPassword,
        new_password: newPassword,
      });
      setIsSuccess(true);
      setSuccessMessage('Password changed successfully');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (error) {
      setIsError(true);
      setErrorMessage('Failed to change password');
    }
  };

  if (isLoading) return <div>Loading...</div>;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Profile':
        return (
          <ProfileTab
            profile={profile}
            updateProfile={updateProfileAndResetFlagsOnEvents}
            handleImageSelect={handleImageSelect}
            handleProfileSubmit={handleProfileSubmit}
          />
        );
      case 'Account':
        return <AccountTab profile={profile} updateProfile={updateProfileAndResetFlagsOnEvents} handleAccountSubmit={handleAccountSubmit} />;
      case 'Security':
        return (
          <SecurityTab
            profile={profile}
            updateProfile={updateProfileAndResetFlagsOnEvents}
            handleSecuritySubmit={handleSecuritySubmit}
            handlePasswordChange={handlePasswordChange}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
          />
        );
    }
  };

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <div className='max-w-5xl mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold mb-2'>Settings</h1>
        <p className='text-muted-foreground mb-6'>Manage your account settings and set e-mail preferences.</p>

        <Separator className='mb-6' />

        <div className='flex'>
          <nav className='w-64 pr-8'>
            {(['Profile', 'Account', 'Security'] as const).map((tab) => (
              <a
                key={tab}
                href='#'
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab);
                }}
                className={`block py-2 px-4 rounded ${activeTab === tab ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-accent hover:text-accent-foreground'}`}
              >
                {tab}
              </a>
            ))}
          </nav>

          <div className='flex-1'>{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}
