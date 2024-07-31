import React from 'react';
import { ImageHandler } from '@/components/common/image-handler';
import { FeedbackButton, FeedbackButtonRef } from '@ui/feedback-button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import { Separator } from '@ui/separator';
import { UserProfile } from './types';

interface ProfileTabProps {
  profile: UserProfile;
  updateProfile: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleImageSelect: (file: File | null) => Promise<void>;
  handleProfileSubmit: (e?: React.FormEvent) => Promise<void>;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ profile, updateProfile, handleImageSelect, handleProfileSubmit }) => {
  const profileButtonRef = React.useRef<FeedbackButtonRef>(null);

  return (
    <>
      <h2 className='text-2xl font-semibold mb-2'>Public Profile</h2>
      <p className='text-muted-foreground mb-6'>This information will be displayed publicly.</p>
      <Separator className='mb-6' />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleProfileSubmit(e);
        }}
        className='space-y-6'
      >
        <div className='flex flex-col items-center mb-6'>
          <ImageHandler onImageSelect={handleImageSelect} initialImage={profile.profile_picture} />
        </div>
        <div>
          <Label htmlFor='username'>Username</Label>
          <Input id='username' value={profile.username} onChange={updateProfile} className='mt-1' />
          <p className='text-sm text-muted-foreground mt-1'>This is your public display name. It can be your real name or a pseudonym.</p>
        </div>

        <div className='flex space-x-4'>
          <div className='flex-1'>
            <Label htmlFor='first_name'>First Name</Label>
            <Input id='first_name' value={profile.first_name} onChange={updateProfile} className='mt-1' />
          </div>
          <div className='flex-1'>
            <Label htmlFor='last_name'>Last Name</Label>
            <Input id='last_name' value={profile.last_name} onChange={updateProfile} className='mt-1' />
          </div>
        </div>

        <div>
          <Label htmlFor='bio'>Bio</Label>
          <Textarea id='bio' value={profile.bio} onChange={updateProfile} rows={3} className='mt-1' />
          <p className='text-sm text-muted-foreground mt-1'>You can @mention other users and organizations to link to them.</p>
        </div>

        <div className='flex justify-end'>
          <FeedbackButton
            ref={profileButtonRef}
            onClickAsync={handleProfileSubmit}
            loadingText='Updating profile...'
            successText='Profile updated successfully!'
            errorText='Failed to update profile'
            idleText='Update public profile'
          />
        </div>
      </form>
    </>
  );
};
