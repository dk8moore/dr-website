import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '@api/api';
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { Card } from "@ui/card";
import { Textarea } from "@ui/textarea";
import { Select } from "@ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";

export function Settings() {
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        bio: '',
        urls: ['', '']
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setIsLoading(true);
            const userData = await getUserProfile();
            setProfile({
                username: userData.username || '',
                email: userData.email || '',
                bio: userData.bio || '',
                urls: userData.urls || ['', '']
            });
        } catch (error) {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateUserProfile(profile);
            setIsSuccess(true);
        } catch (error) {
            setIsError(true);
            setErrorMessage('Failed to update profile');
        }
    };

    const addUrl = () => {
        setProfile({ ...profile, urls: [...profile.urls, ''] });
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Settings</h1>
            <p className="text-gray-600 mb-6">Manage your account settings and set e-mail preferences.</p>

            <Tabs defaultValue="profile">
                <TabsList className="mb-4">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="appearance">Appearance</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="display">Display</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card className="p-6">
                        <h2 className="text-2xl font-semibold mb-4">Profile</h2>
                        <p className="text-gray-600 mb-6">This is how others will see you on the site.</p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    value={profile.username}
                                    onChange={handleChange}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days.
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Select>
                                    <option value={profile.email}>Select a verified email to display</option>
                                </Select>
                                <p className="text-sm text-gray-500 mt-1">
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
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    You can @mention other users and organizations to link to them.
                                </p>
                            </div>

                            <div>
                                <Label>URLs</Label>
                                <p className="text-sm text-gray-500 mb-2">
                                    Add links to your website, blog, or social media profiles.
                                </p>
                                {profile.urls.map((url, index) => (
                                    <Input
                                        key={index}
                                        value={url}
                                        onChange={(e) => handleUrlChange(index, e.target.value)}
                                        className="mb-2"
                                    />
                                ))}
                                <Button type="button" onClick={addUrl} variant="outline" className="mt-2">
                                    Add URL
                                </Button>
                            </div>

                            {isError && (
                                <div className="text-red-500">{errorMessage}</div>
                            )}
                            {isSuccess && (
                                <div className="text-green-500">Profile updated successfully!</div>
                            )}

                            <Button type="submit">Update profile</Button>
                        </form>
                    </Card>
                </TabsContent>

                <TabsContent value="account">
                    <Card className="p-6">
                        <h2 className="text-2xl font-semibold">Account Settings</h2>
                        <p>Manage your account settings here.</p>
                    </Card>
                </TabsContent>

                <TabsContent value="appearance">
                    <Card className="p-6">
                        <h2 className="text-2xl font-semibold">Appearance Settings</h2>
                        <p>Customize the appearance of your account.</p>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card className="p-6">
                        <h2 className="text-2xl font-semibold">Notification Preferences</h2>
                        <p>Manage your notification settings.</p>
                    </Card>
                </TabsContent>

                <TabsContent value="display">
                    <Card className="p-6">
                        <h2 className="text-2xl font-semibold">Display Settings</h2>
                        <p>Adjust your display preferences.</p>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}