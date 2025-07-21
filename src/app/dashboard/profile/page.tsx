import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Save, User, Camera } from "lucide-react"

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="p-4 bg-neutral-950 min-h-screen overflow-y-auto scrollbar-hide">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Profile</h1>
        </div>

        <div className="space-y-6">
          {/* Profile Picture Section */}
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                  <AvatarFallback className="bg-neutral-800">
                    <User className="h-12 w-12 text-neutral-400" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" className="border-neutral-600 text-white hover:bg-neutral-800">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-neutral-400">
                    JPG, GIF or PNG. Max size of 2MB.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white">First Name</Label>
                  <Input id="firstName" defaultValue="Vamsi" className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-neutral-600" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white">Last Name</Label>
                  <Input id="lastName" defaultValue="Batchu" className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-neutral-600" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input id="email" type="email" defaultValue="vamsi@example.com" className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-neutral-600" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone</Label>
                  <Input id="phone" defaultValue="+1 (555) 123-4567" className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-neutral-600" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-white">Username</Label>
                  <Input id="username" defaultValue="vamsibatchu" className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-neutral-600" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white">Location</Label>
                  <Input id="location" defaultValue="San Francisco, CA" className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-neutral-600" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio" className="text-white">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us a little bit about yourself..."
                    defaultValue="Movie enthusiast and software engineer. Love discovering new films and sharing recommendations with friends."
                    rows={4}
                    className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-neutral-600"
                  />
                </div>
              </div>
              <Button className="bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-600">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="bg-neutral-900 border-neutral-700">
            <CardHeader>
              <CardTitle className="text-white">Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                <Input id="currentPassword" type="password" className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-neutral-600" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white">New Password</Label>
                <Input id="newPassword" type="password" className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-neutral-600" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" className="bg-neutral-800 border-neutral-700 text-white placeholder:text-neutral-400 focus:border-neutral-600" />
              </div>
              <Button variant="outline" className="border-neutral-600 text-white hover:bg-neutral-800">
                Update Password
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
} 