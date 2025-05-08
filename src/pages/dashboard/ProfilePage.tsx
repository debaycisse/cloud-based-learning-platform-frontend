import React, { useState, useEffect } from "react";
import {
  getUserById,
  updateUserProfile,
  updateUserPreferences,
} from "../../services/userService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { AlertCircle, Check, Bell, User as UserLR } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/ui/badge";
import { User, UserPreferences } from "../../types/index";

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
  });
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user?._id) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        const data = await getUserById(user._id);
        setProfile(data.user);
        setFormData({
          name: data.user.name,
          email: data.user.email,
          username: data.user.username,
        });
        setPreferences(data.user.preferences || null);
        setLoading(false);
      } catch (err) {
        setError("Failed to load user profile");
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePreferenceChange = (
    name: keyof UserPreferences,
    value: string | boolean
  ) => {
    if (!preferences) return;
    setPreferences((prev) => ({
      ...prev!,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile(formData);
      setSuccessMessage("Profile updated successfully");
      setIsEditing(false);

      // Update the profile state
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          name: formData.name,
          email: formData.email,
          username: formData.username,
        };
      });

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;
    setIsSaving(true);
    try {
      await updateUserPreferences(preferences);
      setSuccessMessage("Preferences updated successfully");

      // Update the profile state
      setProfile((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          preferences,
        };
      });

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setError("Failed to update preferences");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <LoadingSpinner />
        </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || "Profile not found"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    
    <div className="container mx-auto px-4 py-8">
      {successMessage && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-800 dark:text-green-100">
          <Check className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {profile.email}
                </p>
                <div className="mt-2">
                  <Badge
                    variant="outline"
                    className="text-blue-600 bg-blue-50 border-blue-200"
                  >
                    {profile.role}
                  </Badge>
                </div>
                <p className="text-sm mt-4 text-center">
                  Member since{" "}
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:w-2/3">
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile" className="gap-2">
                <UserLR className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="preferences" className="gap-2">
                <Bell className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {isEditing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Update your preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Preferred Difficulty</Label>
                    <select
                      id="difficulty"
                      value={preferences?.difficulty || "beginner"}
                      onChange={(e) =>
                        handlePreferenceChange("difficulty", e.target.value)
                      }
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="learning_style">Learning Style</Label>
                    <select
                      id="learning_style"
                      value={preferences?.learning_style || "visual"}
                      onChange={(e) =>
                        handlePreferenceChange(
                          "learning_style",
                          e.target.value
                        )
                      }
                    >
                      <option value="visual">Visual</option>
                      <option value="auditory">Auditory</option>
                      <option value="reading">Reading</option>
                      <option value="kinesthetic">Kinesthetic</option>
                    </select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSavePreferences} disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
