import React from 'react';
import { Input, PasswordInput } from '@ui/input';
import { Label } from '@ui/label';
import { Separator } from '@ui/separator';
import { FeedbackButton, FeedbackButtonRef } from '@ui/feedback-button';
import { UserProfile } from './types';

interface SecurityTabProps {
  profile: UserProfile;
  updateProfile: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSecuritySubmit: (e?: React.FormEvent) => Promise<void>;
  handlePasswordChange: (e?: React.FormEvent) => Promise<void>;
  newPassword: string;
  setNewPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (password: string) => void;
  currentPassword: string;
  setCurrentPassword: (password: string) => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  profile,
  updateProfile,
  handleSecuritySubmit,
  handlePasswordChange,
  newPassword,
  setNewPassword,
  confirmPassword,
  setConfirmPassword,
  currentPassword,
  setCurrentPassword,
}) => {
  const emailButtonRef = React.useRef<FeedbackButtonRef>(null);
  const passwordButtonRef = React.useRef<FeedbackButtonRef>(null);

  return (
    <>
      <h2 className='text-2xl font-semibold mb-2'>Security Settings</h2>
      <p className='text-muted-foreground mb-6'>Manage your email and password.</p>
      <Separator className='mb-6' />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSecuritySubmit(e);
        }}
        className='space-y-6'
      >
        <div>
          <Label htmlFor='email'>Email</Label>
          <Input id='email' type='email' value={profile.email} onChange={updateProfile} className='mt-1' />
          <p className='text-sm text-muted-foreground mt-1'>Your email address. This is used for login and notifications.</p>
        </div>

        <div className='flex justify-end'>
          <FeedbackButton
            ref={emailButtonRef}
            onClickAsync={handleSecuritySubmit}
            loadingText='Updating email...'
            successText='Email updated successfully!'
            errorText='Failed to update email'
            idleText='Update email'
          />
        </div>
      </form>

      <Separator className='my-6' />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handlePasswordChange(e);
        }}
        className='space-y-6'
      >
        <div>
          <Label htmlFor='current_password'>Current Password</Label>
          <PasswordInput id='current_password' value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className='mt-1' />
        </div>

        <div>
          <Label htmlFor='new_password'>New Password</Label>
          <PasswordInput id='new_password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className='mt-1' />
        </div>

        <div>
          <Label htmlFor='confirm_password'>Confirm New Password</Label>
          <PasswordInput id='confirm_password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className='mt-1' />
        </div>

        <div className='flex justify-end'>
          <FeedbackButton
            ref={passwordButtonRef}
            onClickAsync={handlePasswordChange}
            loadingText='Changing password...'
            successText='Password changed successfully!'
            errorText='Failed to change password'
            idleText='Change Password'
          />
        </div>
      </form>
    </>
  );
};
