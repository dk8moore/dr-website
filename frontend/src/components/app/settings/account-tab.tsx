import React from 'react';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import { Separator } from '@ui/separator';
import { FeedbackButton, FeedbackButtonRef } from '@ui/feedback-button';
import { UserProfile } from './types';

interface AccountTabProps {
  profile: UserProfile;
  updateProfile: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAccountSubmit: (e?: React.FormEvent) => Promise<void>;
}

export const AccountTab: React.FC<AccountTabProps> = ({ profile, updateProfile, handleAccountSubmit }) => {
  const accountButtonRef = React.useRef<FeedbackButtonRef>(null);

  return (
    <>
      <h2 className='text-2xl font-semibold mb-2'>Account Information</h2>
      <p className='text-muted-foreground mb-6'>Manage your personal account details.</p>
      <Separator className='mb-6' />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAccountSubmit(e);
        }}
        className='space-y-6'
      >
        <div>
          <Label htmlFor='birth_date'>Date of Birth</Label>
          <Input id='birth_date' type='date' value={profile.birth_date} onChange={updateProfile} className='mt-1' />
          <p className='text-sm text-muted-foreground mt-1'>
            Your date of birth. This information helps us personalize your experience and ensure age-appropriate content.
          </p>
        </div>

        <div>
          <Label htmlFor='phone_number'>Phone Number</Label>
          <Input id='phone_number' type='tel' value={profile.phone_number} onChange={updateProfile} className='mt-1' />
          <p className='text-sm text-muted-foreground mt-1'>
            A contact number where we can reach you if needed. This is optional and will be kept private.
          </p>
        </div>

        <div>
          <Label htmlFor='address'>Address</Label>
          <Textarea id='address' value={profile.address} onChange={updateProfile} rows={2} className='mt-1' />
          <p className='text-sm text-muted-foreground mt-1'>
            Your current mailing address. This information is used for shipping or location-based services if applicable.
          </p>
        </div>

        <div className='flex justify-end'>
          <FeedbackButton
            ref={accountButtonRef}
            onClickAsync={handleAccountSubmit}
            loadingText='Updating account...'
            successText='Account updated successfully!'
            errorText='Failed to update account'
            idleText='Update account information'
          />
        </div>
      </form>
    </>
  );
};
