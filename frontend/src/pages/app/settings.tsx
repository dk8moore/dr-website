import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '@api';
import { logger } from '@lib/logger';
import { ImageHandler } from '@/components/app/image-handler';

import { FeedbackButton, FeedbackButtonRef } from '@ui/feedback-button';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import { Separator } from '@ui/separator';

type SettingsTab = 'Profile' | 'Account' | 'Security';

interface UserProfile {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  bio: string;
  birth_date: string;
  phone_number: string;
  address: string;
  profile_picture: string | null;
}

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
  const profileButtonRef = useRef<FeedbackButtonRef>(null);

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
        // Create object URL only for valid File objects
        const imageUrl = URL.createObjectURL(file);
        setProfile((prevProfile) => ({ ...prevProfile, profile_picture: imageUrl }));

        setIsSuccess(true);
        setSuccessMessage('Profile picture updated successfully');
      } else {
        // Handle image removal
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
      // let profilePictureFile: File | null = null;
      // if (profilePicture) {
      //     const response = await fetch(profilePicture);
      //     const blob = await response.blob();
      //     profilePictureFile = new File([blob], 'profile_picture.jpg', { type: 'image/jpeg' });
      // }

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
      throw error; // Rethrow the error to trigger the error state in the FeedbackButton
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.user.updateUserProfile({ email: profile.email });
      setIsSuccess(true);
      setSuccessMessage('Email updated successfully');
    } catch (error) {
      setIsError(true);
      setErrorMessage('Failed to update email');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
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
          <>
            <h2 className='text-2xl font-semibold mb-2'>Public Profile</h2>
            <p className='text-muted-foreground mb-6'>This information will be displayed publicly.</p>
            <Separator className='mb-6' />
            <form onSubmit={handleProfileSubmit} className='space-y-6'>
              <div className='flex flex-col items-center mb-6'>
                <ImageHandler onImageSelect={handleImageSelect} initialImage={profile.profile_picture} />
              </div>
              <div>
                <Label htmlFor='username'>Username</Label>
                <Input id='username' value={profile.username} onChange={updateProfileAndResetFlagsOnEvents} className='mt-1' />
                <p className='text-sm text-muted-foreground mt-1'>This is your public display name. It can be your real name or a pseudonym.</p>
              </div>

              <div className='flex space-x-4'>
                <div className='flex-1'>
                  <Label htmlFor='first_name'>First Name</Label>
                  <Input id='first_name' value={profile.first_name} onChange={updateProfileAndResetFlagsOnEvents} className='mt-1' />
                </div>
                <div className='flex-1'>
                  <Label htmlFor='last_name'>Last Name</Label>
                  <Input id='last_name' value={profile.last_name} onChange={updateProfileAndResetFlagsOnEvents} className='mt-1' />
                </div>
              </div>

              <div>
                <Label htmlFor='bio'>Bio</Label>
                <Textarea id='bio' value={profile.bio} onChange={updateProfileAndResetFlagsOnEvents} rows={3} className='mt-1' />
                <p className='text-sm text-muted-foreground mt-1'>You can @mention other users and organizations to link to them.</p>
              </div>

              {/* <Button type="submit">Update public profile</Button> */}
              <FeedbackButton
                ref={profileButtonRef}
                onClickAsync={handleProfileSubmit}
                loadingText='Updating profile...'
                successText='Profile updated successfully!'
                errorText='Failed to update profile'
                idleText='Update public profile'
              />
            </form>
          </>
        );
      case 'Account':
        return (
          <>
            <h2 className='text-2xl font-semibold mb-2'>Account Information</h2>
            <p className='text-muted-foreground mb-6'>Manage your personal account details.</p>
            <Separator className='mb-6' />
            <form onSubmit={handleAccountSubmit} className='space-y-6'>
              <div>
                <Label htmlFor='birth_date'>Date of Birth</Label>
                <Input id='birth_date' type='date' value={profile.birth_date} onChange={updateProfileAndResetFlagsOnEvents} className='mt-1' />
                <p className='text-sm text-muted-foreground mt-1'>
                  Your date of birth. This information helps us personalize your experience and ensure age-appropriate content.
                </p>
              </div>

              <div>
                <Label htmlFor='phone_number'>Phone Number</Label>
                <Input id='phone_number' type='tel' value={profile.phone_number} onChange={updateProfileAndResetFlagsOnEvents} className='mt-1' />
                <p className='text-sm text-muted-foreground mt-1'>
                  A contact number where we can reach you if needed. This is optional and will be kept private.
                </p>
              </div>

              <div>
                <Label htmlFor='address'>Address</Label>
                <Textarea id='address' value={profile.address} onChange={updateProfileAndResetFlagsOnEvents} rows={2} className='mt-1' />
                <p className='text-sm text-muted-foreground mt-1'>
                  Your current mailing address. This information is used for shipping or location-based services if applicable.
                </p>
              </div>

              <Button type='submit'>Update account information</Button>
            </form>
          </>
        );
      case 'Security':
        return (
          <>
            <h2 className='text-2xl font-semibold mb-2'>Security Settings</h2>
            <p className='text-muted-foreground mb-6'>Manage your email and password.</p>
            <Separator className='mb-6' />
            <form onSubmit={handleSecuritySubmit} className='space-y-6'>
              <div>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' type='email' value={profile.email} onChange={updateProfileAndResetFlagsOnEvents} className='mt-1' />
                <p className='text-sm text-muted-foreground mt-1'>Your email address. This is used for login and notifications.</p>
              </div>

              <Button type='submit'>Update email</Button>
            </form>

            <Separator className='my-6' />

            <form onSubmit={handlePasswordChange} className='space-y-6'>
              <div>
                <Label htmlFor='new_password'>New Password</Label>
                <Input id='new_password' type='password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className='mt-1' />
              </div>

              <div>
                <Label htmlFor='confirm_password'>Confirm New Password</Label>
                <Input
                  id='confirm_password'
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className='mt-1'
                />
              </div>

              <Button type='submit'>Change Password</Button>
            </form>
          </>
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
          {/* Left sidebar */}
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

          {/* Main content */}
          <div className='flex-1'>{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}
