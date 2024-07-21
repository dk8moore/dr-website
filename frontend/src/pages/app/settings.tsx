import React, { useState, useEffect } from 'react';
import api from '@api';
import { logger } from '@lib/logger';

import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Textarea } from "@ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@ui/select";
import { Separator } from "@ui/separator";
import { Trash2 } from 'lucide-react';

type SettingsTab = 'Profile' | 'Account' | 'Appearance' | 'Notifications' | 'Display';

export function SettingsPage() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('Profile');
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        bio: '',
        urls: ['']
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const verifiedEmails = ['user@example.com', 'another@example.com'];

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
                bio: userData.bio || '',
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
    
    const handleEmailChange = (value: string) => {
        setProfile({ ...profile, email: value });
        setIsError(false);
        setIsSuccess(false);
    };

    const handleUrlChange = (index: number, value: string) => {
        const newUrls = [...profile.urls];
        newUrls[index] = value;
        setProfile({ ...profile, urls: newUrls });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.user.updateUserProfile(profile);
            setIsSuccess(true);
        } catch (error) {
            setIsError(true);
            setErrorMessage('Failed to update profile');
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
                        <h2 className="text-2xl font-semibold mb-2">Profile</h2>
                        <p className="text-muted-foreground mb-6">This is how others will see you on the site.</p>
                        <Separator className="mb-6" />
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={profile.username}
                                    onChange={handleChange}
                                    className="mt-1"
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days.
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Select onValueChange={handleEmailChange} value={profile.email}>
                                    <SelectTrigger className="w-full mt-1">
                                        <SelectValue placeholder="Select a verified email to display" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {verifiedEmails.map((email) => (
                                            <SelectItem key={email} value={email}>
                                                {email}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground mt-1">
                                    You can manage verified email addresses in your email settings.
                                </p>
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

                            {isError && (
                                <div className="text-destructive">{errorMessage}</div>
                            )}
                            {isSuccess && (
                                <div className="text-primary">Profile updated successfully!</div>
                            )}

                            <Button type="submit">Update profile</Button>
                        </form>
                    </>
                );
            case 'Account':
                return (
                    <>
                        <h2 className="text-2xl font-semibold mb-2">Account Settings</h2>
                        <p className="text-muted-foreground mb-6">Manage your account details and preferences.</p>
                        <Separator className="mb-6" />
                        {/* Add account settings form here */}
                        <p>Account settings form placeholder</p>
                    </>
                );
            case 'Appearance':
                return (
                    <>
                        <h2 className="text-2xl font-semibold mb-2">Appearance</h2>
                        <p className="text-muted-foreground mb-6">Customize the look and feel of your interface.</p>
                        <Separator className="mb-6" />
                        {/* Add appearance settings form here */}
                        <p>Appearance settings form placeholder</p>
                    </>
                );
            case 'Notifications':
                return (
                    <>
                        <h2 className="text-2xl font-semibold mb-2">Notifications</h2>
                        <p className="text-muted-foreground mb-6">Control how you receive notifications.</p>
                        <Separator className="mb-6" />
                        {/* Add notifications settings form here */}
                        <p>Notifications settings form placeholder</p>
                    </>
                );
            case 'Display':
                return (
                    <>
                        <h2 className="text-2xl font-semibold mb-2">Display Settings</h2>
                        <p className="text-muted-foreground mb-6">Adjust your display preferences.</p>
                        <Separator className="mb-6" />
                        {/* Add display settings form here */}
                        <p>Display settings form placeholder</p>
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
                        {(['Profile', 'Account', 'Appearance', 'Notifications', 'Display'] as const).map((tab) => (
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