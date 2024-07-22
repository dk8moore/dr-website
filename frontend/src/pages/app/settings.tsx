import React, { useState, useEffect, useCallback } from 'react';
import api from '@api';
import { logger } from '@lib/logger';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import Cropper from 'react-easy-crop';
import { Area, Point } from 'react-easy-crop/types';

import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Textarea } from "@ui/textarea";
import { Separator } from "@ui/separator";
import { Trash2, Camera } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/dialog";

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
    urls: string[];
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
        urls: ['']
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    useEffect(() => {
        logger.log('Is authenticated:', api.auth.isAuthenticated());
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
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
                urls: Array.isArray(userData.urls) ? userData.urls : ['']
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
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfile({ ...profile, [e.target.id]: e.target.value });
        setIsError(false);
        setIsSuccess(false);
    };

    const handleUrlChange = (index: number, value: string) => {
        const newUrls = [...profile.urls];
        newUrls[index] = value;
        setProfile({ ...profile, urls: newUrls });
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = () => {
            setProfilePicture(reader.result as string);
            setCropModalOpen(true);
        };
        reader.readAsDataURL(file);
    }, []);

    const dropzoneOptions: DropzoneOptions = {
        onDrop,
        accept: {'image/*': []},
        multiple: false,
    };

    const { getRootProps, getInputProps } = useDropzone(dropzoneOptions);

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const getCroppedImage = useCallback(async (imageSrc: string, pixelCrop: Area) => {
        const image = new Image();
        image.src = imageSrc;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Unable to get 2D context');
        }
        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;
        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        );
        return new Promise<string>((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(URL.createObjectURL(blob));
                }
            }, 'image/jpeg');
        });
    }, []);

    const handleCropSave = useCallback(async () => {
        if (croppedAreaPixels && profilePicture) {
            const croppedImage = await getCroppedImage(profilePicture, croppedAreaPixels);
            setProfilePicture(croppedImage);
            setCropModalOpen(false);
        }
    }, [croppedAreaPixels, profilePicture, getCroppedImage]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let profilePictureFile: File | null = null;
            if (profilePicture) {
                const response = await fetch(profilePicture);
                const blob = await response.blob();
                profilePictureFile = new File([blob], 'profile_picture.jpg', { type: 'image/jpeg' });
            }
    
            const formData = new FormData();
            ['username', 'first_name', 'last_name', 'bio'].forEach(key => {
                formData.append(key, profile[key as keyof UserProfile] as string);
            });
            profile.urls.forEach((url, index) => {
                formData.append(`urls[${index}]`, url);
            });
            if (profilePictureFile) {
                formData.append('profile_picture', profilePictureFile);
            }
    
            await api.user.updateUserProfile(formData);
            setIsSuccess(true);
            setSuccessMessage('Profile updated successfully');
        } catch (error) {
            setIsError(true);
            setErrorMessage('Failed to update profile');
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
                new_password: newPassword
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
    const addUrl = () => {
        setProfile({ ...profile, urls: [...profile.urls, ''] });
    };

    const removeUrl = (index: number) => {
        const newUrls = profile.urls.filter((_, i) => i !== index);
        setProfile({ ...profile, urls: newUrls });
    };

    if (isLoading) return <div>Loading...</div>;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'Profile':
                return (
                    <>
                        <h2 className="text-2xl font-semibold mb-2">Public Profile</h2>
                        <p className="text-muted-foreground mb-6">This information will be displayed publicly.</p>
                        <Separator className="mb-6" />
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="flex flex-col items-center mb-6">
                                <div 
                                    {...getRootProps()} 
                                    className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer overflow-hidden"
                                >
                                    <input {...getInputProps()} />
                                    {profilePicture ? (
                                        <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="text-gray-400" size={32} />
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">Click to upload profile picture</p>
                            </div>
                            <div>
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={profile.username}
                                    onChange={handleChange}
                                    className="mt-1"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    This is your public display name. It can be your real name or a pseudonym.
                                </p>
                            </div>

                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <Label htmlFor="first_name">First Name</Label>
                                    <Input
                                        id="first_name"
                                        value={profile.first_name}
                                        onChange={handleChange}
                                        className="mt-1"
                                    />
                                </div>
                                <div className="flex-1">
                                    <Label htmlFor="last_name">Last Name</Label>
                                    <Input
                                        id="last_name"
                                        value={profile.last_name}
                                        onChange={handleChange}
                                        className="mt-1"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="bio">Bio</Label>
                                <Textarea
                                    id="bio"
                                    value={profile.bio}
                                    onChange={handleChange}
                                    rows={3}
                                    className="mt-1"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    You can @mention other users and organizations to link to them.
                                </p>
                            </div>

                            <div>
                                <Label>URLs</Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                    Add links to your website, blog, or social media profiles.
                                </p>
                                {profile.urls.map((url, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <Input
                                            value={url}
                                            onChange={(e) => handleUrlChange(index, e.target.value)}
                                            className="flex-grow"
                                        />
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon"
                                            onClick={() => removeUrl(index)}
                                            className="ml-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button type="button" onClick={addUrl} variant="outline" className="mt-2">
                                    Add URL
                                </Button>
                            </div>

                            <Button type="submit">Update public profile</Button>
                        </form>

                        <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Crop Profile Picture</DialogTitle>
                                </DialogHeader>
                                <div className="relative h-64">
                                    {profilePicture && (
                                        <Cropper
                                            image={profilePicture}
                                            crop={crop}
                                            zoom={zoom}
                                            aspect={1}
                                            onCropChange={setCrop}
                                            onZoomChange={setZoom}
                                            onCropComplete={onCropComplete}
                                        />
                                    )}
                                </div>
                                <div className="flex justify-end space-x-2 mt-4">
                                    <Button onClick={() => setCropModalOpen(false)} variant="outline">Cancel</Button>
                                    <Button onClick={handleCropSave}>Save</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </>
                );
            case 'Account':
                return (
                    <>
                        <h2 className="text-2xl font-semibold mb-2">Account Information</h2>
                        <p className="text-muted-foreground mb-6">Manage your personal account details.</p>
                        <Separator className="mb-6" />
                        <form onSubmit={handleAccountSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="birth_date">Date of Birth</Label>
                                <Input
                                    id="birth_date"
                                    type="date"
                                    value={profile.birth_date}
                                    onChange={handleChange}
                                    className="mt-1"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    Your date of birth. This information helps us personalize your experience and ensure age-appropriate content.
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="phone_number">Phone Number</Label>
                                <Input
                                    id="phone_number"
                                    type="tel"
                                    value={profile.phone_number}
                                    onChange={handleChange}
                                    className="mt-1"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    A contact number where we can reach you if needed. This is optional and will be kept private.
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="address">Address</Label>
                                <Textarea
                                    id="address"
                                    value={profile.address}
                                    onChange={handleChange}
                                    rows={2}
                                    className="mt-1"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    Your current mailing address. This information is used for shipping or location-based services if applicable.
                                </p>
                            </div>

                            <Button type="submit">Update account information</Button>
                        </form>
                    </>
                );
            case 'Security':
                return (
                    <>
                        <h2 className="text-2xl font-semibold mb-2">Security Settings</h2>
                        <p className="text-muted-foreground mb-6">Manage your email and password.</p>
                        <Separator className="mb-6" />
                        <form onSubmit={handleSecuritySubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profile.email}
                                    onChange={handleChange}
                                    className="mt-1"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    Your email address. This is used for login and notifications.
                                </p>
                            </div>

                            <Button type="submit">Update email</Button>
                        </form>

                        <Separator className="my-6" />

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div>
                                <Label htmlFor="new_password">New Password</Label>
                                <Input
                                    id="new_password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="confirm_password">Confirm New Password</Label>
                                <Input
                                    id="confirm_password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <Button type="submit">Change Password</Button>
                        </form>
                    </>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-2">Settings</h1>
                <p className="text-muted-foreground mb-6">Manage your account settings and set e-mail preferences.</p>
                
                <Separator className="mb-6" />

                <div className="flex">
                    {/* Left sidebar */}
                    <nav className="w-64 pr-8">
                        {(['Profile', 'Account', 'Security'] as const).map((tab) => (
                            <a
                                key={tab}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab(tab);
                                }}
                                className={`block py-2 px-4 rounded ${
                                    activeTab === tab
                                        ? 'bg-accent text-accent-foreground'
                                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                            >
                                {tab}
                            </a>
                        ))}
                    </nav>

                    {/* Main content */}
                    <div className="flex-1">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}

