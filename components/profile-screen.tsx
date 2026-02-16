// "use client"

// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { 
//   ArrowLeft, 
//   User,
//   Mail,
//   Phone,
//   Edit3,
//   Lock,
//   CheckCircle,
//   AlertCircle,
//   Eye,
//   EyeOff
// } from "lucide-react"
// import { useState, useEffect } from "react"
// import { useTheme } from "@/lib/contexts"
// import { useTranslation } from "@/lib/contexts"
// import { useAuth } from "@/lib/contexts"
// import { profileService, type UserProfile, type UpdateProfilePayload, type ChangePasswordPayload } from "@/lib/profile"

// interface ProfileScreenProps {
//   onNavigateBack: () => void
// }

// export function ProfileScreen({ onNavigateBack }: ProfileScreenProps) {
//   const [activeTab, setActiveTab] = useState("profile")
//   const [profile, setProfile] = useState<UserProfile | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const [isEditing, setIsEditing] = useState(false)
//   const [isChangingPassword, setIsChangingPassword] = useState(false)
//   const [error, setError] = useState("")
//   const [success, setSuccess] = useState("")
  
//   // Profile form states
//   const [email, setEmail] = useState("")
//   const [phone, setPhone] = useState("")
//   const [firstName, setFirstName] = useState("")
//   const [lastName, setLastName] = useState("")
//   const [contactMethod, setContactMethod] = useState("")
  
//   // Password form states
//   const [oldPassword, setOldPassword] = useState("")
//   const [newPassword, setNewPassword] = useState("")
//   const [confirmPassword, setConfirmPassword] = useState("")
//   const [showPasswords, setShowPasswords] = useState({
//     old: false,
//     new: false,
//     confirm: false
//   })
  
//   const { theme } = useTheme()
//   const { t } = useTranslation()
//   const { user, refreshToken } = useAuth()

//   // Load profile data
//   useEffect(() => {
//     const loadProfile = async () => {
//       try {
//         const accessToken = localStorage.getItem('accessToken')
//         if (accessToken) {
//           const profileData = await profileService.getProfile(accessToken)
//           setProfile(profileData)
//           setEmail(profileData.email)
//           setPhone(profileData.phone || "")
//           setFirstName(profileData.first_name)
//           setLastName(profileData.last_name)
//           setContactMethod(profileData.contact_method)
//         }
//       } catch (error) {
//         console.error('Failed to load profile:', error)
//         setError("Failed to load profile")
//       } finally {
//         setIsLoading(false)
//       }
//     }
    
//     loadProfile()
//   }, [])

//   const handleUpdateProfile = async () => {
//     if (!profile) return
    
//     setIsEditing(true)
//     setError("")
//     setSuccess("")
    
//     try {
//       const payload: UpdateProfilePayload = {
//         email: email !== profile.email ? email : undefined,
//         phone: phone !== (profile.phone || "") ? phone : undefined,
//         first_name: firstName !== profile.first_name ? firstName : undefined,
//         last_name: lastName !== profile.last_name ? lastName : undefined,
//         contact_method: contactMethod !== profile.contact_method ? contactMethod : undefined,
//       }
      
//       // Only send fields that have changed
//       const filteredPayload = Object.fromEntries(
//         Object.entries(payload).filter(([_, value]) => value !== undefined)
//       )
      
//       if (Object.keys(filteredPayload).length === 0) {
//         setError("No changes to save")
//         return
//       }
      
//       const accessToken = localStorage.getItem('accessToken')
//       if (accessToken) {
//         const response = await profileService.updateProfile(accessToken, filteredPayload)
//         setSuccess(response.message)
//         setProfile(response.user)
//         // Refresh user data in context
//         await refreshToken()
//       }
//     } catch (error) {
//       console.error('Update profile error:', error)
      
//       // Parse backend validation errors
//       if (error instanceof Error) {
//         try {
//           const errorData = JSON.parse(error.message)
//           if (typeof errorData === 'object' && errorData !== null) {
//             // Handle field-specific errors
//             const errorMessages: string[] = []
//             Object.keys(errorData).forEach(field => {
//               if (Array.isArray(errorData[field])) {
//                 errorMessages.push(...(errorData[field] as string[]))
//               } else {
//                 errorMessages.push(String(errorData[field]))
//               }
//             })
//             setError(errorMessages.join(', '))
//           } else {
//             setError(error.message)
//           }
//         } catch (parseError) {
//           setError(error.message)
//         }
//       } else {
//         setError("Failed to update profile")
//       }
//     } finally {
//       setIsEditing(false)
//     }
//   }

//   const handleChangePassword = async () => {
//     if (newPassword !== confirmPassword) {
//       setError("New passwords do not match")
//       return
//     }
    
//     if (newPassword.length < 6) {
//       setError("New password must be at least 6 characters")
//       return
//     }
    
//     setIsChangingPassword(true)
//     setError("")
//     setSuccess("")
    
//     try {
//       const payload: ChangePasswordPayload = {
//         old_password: oldPassword,
//         new_password: newPassword
//       }
      
//       const accessToken = localStorage.getItem('accessToken')
//       if (accessToken) {
//         const response = await profileService.changePassword(accessToken, payload)
//         setSuccess(response.message)
//         // Clear password fields
//         setOldPassword("")
//         setNewPassword("")
//         setConfirmPassword("")
//       }
//     } catch (error) {
//       console.error('Change password error:', error)
      
//       // Parse backend validation errors
//       if (error instanceof Error) {
//         try {
//           const errorData = JSON.parse(error.message)
//           if (typeof errorData === 'object' && errorData !== null) {
//             // Handle field-specific errors
//             const errorMessages: string[] = []
//             Object.keys(errorData).forEach(field => {
//               if (Array.isArray(errorData[field])) {
//                 errorMessages.push(...(errorData[field] as string[]))
//               } else {
//                 errorMessages.push(String(errorData[field]))
//               }
//             })
//             setError(errorMessages.join(', '))
//           } else {
//             setError(error.message)
//           }
//         } catch (parseError) {
//           setError(error.message)
//         }
//       } else {
//         setError("Failed to change password")
//       }
//     } finally {
//       setIsChangingPassword(false)
//     }
//   }

//   const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
//     setShowPasswords(prev => ({
//       ...prev,
//       [field]: !prev[field]
//     }))
//   }

//   if (isLoading) {
//     return (
//       <div className={`min-h-screen flex items-center justify-center ${
//         theme === "dark" ? "bg-gray-900" : "bg-gray-50"
//       }`}>
//         <div className="text-center">
//           <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//             {t("profile.loading")}
//           </p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div
//       className={`min-h-screen transition-colors duration-300 ${
//         theme === "dark"
//           ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
//           : "bg-gradient-to-br from-blue-50 via-white to-blue-100"
//       }`}
//     >
//       {/* Header */}
//       <div className="px-4 pt-12 pb-8 safe-area-inset-top">
//         <div className="flex items-center gap-4 mb-8">
//           <Button
//             variant="ghost"
//             size="sm"
//             className={`h-11 w-11 p-0 rounded-full ${
//               theme === "dark" 
//                 ? "text-gray-300 hover:bg-gray-700/50" 
//                 : "text-gray-600 hover:bg-gray-100/50"
//             }`}
//             onClick={onNavigateBack}
//           >
//             <ArrowLeft className="w-5 h-5" />
//           </Button>
//           <div>
//             <h1 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
//               {t("profile.title")}
//             </h1>
//             <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
//               {t("profile.subtitle")}
//             </p>
//           </div>
//         </div>

//         {/* Profile Tabs */}
//         <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
//           <TabsList className={`grid w-full grid-cols-2 ${
//             theme === "dark" ? "bg-gray-800" : "bg-white"
//           }`}>
//             <TabsTrigger value="profile" className="flex items-center gap-2">
//               <User className="w-4 h-4" />
//               <span>{t("profile.tabs.profile")}</span>
//             </TabsTrigger>
//             <TabsTrigger value="password" className="flex items-center gap-2">
//               <Lock className="w-4 h-4" />
//               <span>{t("profile.tabs.password")}</span>
//             </TabsTrigger>
//           </TabsList>

//           {/* Profile Tab */}
//           <TabsContent value="profile" className="space-y-6 mt-6">
//             {/* Error Message */}
//             {error && (
//               <div className={`flex items-center gap-2 p-3 rounded-lg ${
//                 theme === "dark" ? "bg-red-900/20 border border-red-800" : "bg-red-50 border border-red-200"
//               }`}>
//                 <AlertCircle className="w-4 h-4 text-red-500" />
//                 <span className="text-sm text-red-600">{error}</span>
//               </div>
//             )}

//             {/* Success Message */}
//             {success && (
//               <div className={`flex items-center gap-2 p-3 rounded-lg ${
//                 theme === "dark" ? "bg-green-900/20 border border-green-800" : "bg-green-50 border border-green-200"
//               }`}>
//                 <CheckCircle className="w-4 h-4 text-green-500" />
//                 <span className="text-sm text-green-600">{success}</span>
//               </div>
//             )}

//             {/* Profile Form */}
//             <div className="space-y-6">
//               {/* Email */}
//               <div className="space-y-2">
//                 <Label htmlFor="email" className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//                   {t("profile.fields.email")}
//                 </Label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <Input
//                     id="email"
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className={`pl-10 h-12 ${
//                       theme === "dark" 
//                         ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400" 
//                         : "bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-500"
//                     }`}
//                   />
//                 </div>
//               </div>

//               {/* Phone */}
//               <div className="space-y-2">
//                 <Label htmlFor="phone" className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//                   {t("profile.fields.phone")}
//                 </Label>
//                 <div className="relative">
//                   <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                   <Input
//                     id="phone"
//                     type="tel"
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                     className={`pl-10 h-12 ${
//                       theme === "dark" 
//                         ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400" 
//                         : "bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-500"
//                     }`}
//                   />
//                 </div>
//               </div>

//               {/* First Name */}
//               <div className="space-y-2">
//                 <Label htmlFor="firstName" className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//                   {t("profile.fields.firstName")}
//                 </Label>
//                 <Input
//                   id="firstName"
//                   type="text"
//                   value={firstName}
//                   onChange={(e) => setFirstName(e.target.value)}
//                   className={`h-12 ${
//                     theme === "dark" 
//                       ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400" 
//                       : "bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-500"
//                   }`}
//                 />
//               </div>

//               {/* Last Name */}
//               <div className="space-y-2">
//                 <Label htmlFor="lastName" className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//                   {t("profile.fields.lastName")}
//                 </Label>
//                 <Input
//                   id="lastName"
//                   type="text"
//                   value={lastName}
//                   onChange={(e) => setLastName(e.target.value)}
//                   className={`h-12 ${
//                     theme === "dark" 
//                       ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400" 
//                       : "bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-500"
//                   }`}
//                 />
//               </div>

//               {/* Contact Method */}
//               <div className="space-y-2">
//                 <Label className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//                   {t("profile.fields.contactMethod")}
//                 </Label>
//                 <div className="grid grid-cols-2 gap-2">
//                   <Button
//                     variant={contactMethod === "email" ? "default" : "outline"}
//                     onClick={() => setContactMethod("email")}
//                     className={`h-10 ${
//                       contactMethod === "email"
//                         ? "bg-blue-500 text-white"
//                         : theme === "dark"
//                           ? "border-gray-600 text-gray-300"
//                           : "border-gray-200 text-gray-600"
//                     }`}
//                   >
//                     {t("profile.contactMethods.email")}
//                   </Button>
//                   <Button
//                     variant={contactMethod === "phone" ? "default" : "outline"}
//                     onClick={() => setContactMethod("phone")}
//                     className={`h-10 ${
//                       contactMethod === "phone"
//                         ? "bg-blue-500 text-white"
//                         : theme === "dark"
//                           ? "border-gray-600 text-gray-300"
//                           : "border-gray-200 text-gray-600"
//                     }`}
//                   >
//                     {t("profile.contactMethods.phone")}
//                   </Button>
//                 </div>
//               </div>

//               {/* Update Button */}
//               <Button
//                 onClick={handleUpdateProfile}
//                 disabled={isEditing}
//                 className={`w-full h-12 text-lg font-semibold transition-all duration-300 ${
//                   isEditing
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02] active:scale-[0.98]"
//                 }`}
//               >
//                 {isEditing ? (
//                   <div className="flex items-center gap-2">
//                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                     {t("profile.buttons.updating")}
//                   </div>
//                 ) : (
//                   <div className="flex items-center gap-2">
//                     <Edit3 className="w-4 h-4" />
//                     {t("profile.buttons.updateProfile")}
//                   </div>
//                 )}
//               </Button>
//             </div>
//           </TabsContent>

//           {/* Password Tab */}
//           <TabsContent value="password" className="space-y-6 mt-6">
//             {/* Error Message */}
//             {error && (
//               <div className={`flex items-center gap-2 p-3 rounded-lg ${
//                 theme === "dark" ? "bg-red-900/20 border border-red-800" : "bg-red-50 border border-red-200"
//               }`}>
//                 <AlertCircle className="w-4 h-4 text-red-500" />
//                 <span className="text-sm text-red-600">{error}</span>
//               </div>
//             )}

//             {/* Success Message */}
//             {success && (
//               <div className={`flex items-center gap-2 p-3 rounded-lg ${
//                 theme === "dark" ? "bg-green-900/20 border border-green-800" : "bg-green-50 border border-green-200"
//               }`}>
//                 <CheckCircle className="w-4 h-4 text-green-500" />
//                 <span className="text-sm text-green-600">{success}</span>
//               </div>
//             )}

//             {/* Password Form */}
//             <div className="space-y-6">
//               {/* Old Password */}
//               <div className="space-y-2">
//                 <Label htmlFor="oldPassword" className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//                   {t("profile.fields.currentPassword")}
//                 </Label>
//                 <div className="relative">
//                   <Input
//                     id="oldPassword"
//                     type={showPasswords.old ? "text" : "password"}
//                     value={oldPassword}
//                     onChange={(e) => setOldPassword(e.target.value)}
//                     className={`pr-10 h-12 ${
//                       theme === "dark" 
//                         ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400" 
//                         : "bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-500"
//                     }`}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => togglePasswordVisibility('old')}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </button>
//                 </div>
//               </div>

//               {/* New Password */}
//               <div className="space-y-2">
//                 <Label htmlFor="newPassword" className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//                   {t("profile.fields.newPassword")}
//                 </Label>
//                 <div className="relative">
//                   <Input
//                     id="newPassword"
//                     type={showPasswords.new ? "text" : "password"}
//                     value={newPassword}
//                     onChange={(e) => setNewPassword(e.target.value)}
//                     className={`pr-10 h-12 ${
//                       theme === "dark" 
//                         ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400" 
//                         : "bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-500"
//                     }`}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => togglePasswordVisibility('new')}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </button>
//                 </div>
//               </div>

//               {/* Confirm Password */}
//               <div className="space-y-2">
//                 <Label htmlFor="confirmPassword" className={`text-sm font-medium ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
//                   {t("profile.fields.confirmPassword")}
//                 </Label>
//                 <div className="relative">
//                   <Input
//                     id="confirmPassword"
//                     type={showPasswords.confirm ? "text" : "password"}
//                     value={confirmPassword}
//                     onChange={(e) => setConfirmPassword(e.target.value)}
//                     className={`pr-10 h-12 ${
//                       theme === "dark" 
//                         ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400" 
//                         : "bg-gray-50/50 border-gray-200 text-gray-900 placeholder:text-gray-500"
//                     }`}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => togglePasswordVisibility('confirm')}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
//                   </button>
//                 </div>
//               </div>

//               {/* Change Password Button */}
//               <Button
//                 onClick={handleChangePassword}
//                 disabled={isChangingPassword || !oldPassword || !newPassword || !confirmPassword}
//                 className={`w-full h-12 text-lg font-semibold transition-all duration-300 ${
//                   isChangingPassword || !oldPassword || !newPassword || !confirmPassword
//                     ? "bg-gray-400 cursor-not-allowed"
//                     : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:scale-[1.02] active:scale-[0.98]"
//                 }`}
//               >
//                 {isChangingPassword ? (
//                   <div className="flex items-center gap-2">
//                     <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                     {t("profile.buttons.changingPassword")}
//                   </div>
//                 ) : (
//                   <div className="flex items-center gap-2">
//                     <Lock className="w-4 h-4" />
//                     {t("profile.buttons.changePassword")}
//                   </div>
//                 )}
//               </Button>
//             </div>
//           </TabsContent>
//         </Tabs>
//       </div>
//     </div>
//   )
// }





"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ErrorAlert } from "@/components/ui/error-alert"
import { 
  ArrowLeft, 
  User,
  Mail,
  Phone,
  Edit3,
  Lock,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Settings,
  Shield,
  RefreshCw
} from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/lib/contexts"
import { useTranslation } from "@/lib/contexts"
import { useAuth } from "@/lib/contexts"
import { profileService, type UserProfile, type UpdateProfilePayload, type ChangePasswordPayload } from "@/lib/profile"
import { parseBackendError, formatErrorMessage } from "@/lib/error-utils"

interface ProfileScreenProps {
  onNavigateBack: () => void
}

export function ProfileScreen({ onNavigateBack }: ProfileScreenProps) {
  const [activeTab, setActiveTab] = useState("profile")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  // Pull-to-refresh state
  const [pullToRefreshState, setPullToRefreshState] = useState({
    isPulling: false,
    pullDistance: 0,
    isRefreshing: false,
    startY: 0,
    currentY: 0,
    canPull: true
  })
  
  // Profile form states
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [contactMethod, setContactMethod] = useState("")
  
  // Password form states
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  })
  
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { user, refreshToken } = useAuth()

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        if (accessToken) {
          const profileData = await profileService.getProfile(accessToken)
          setProfile(profileData)
          setEmail(profileData.email)
          setPhone(profileData.phone || "")
          setFirstName(profileData.first_name)
          setLastName(profileData.last_name)
          setContactMethod(profileData.contact_method)
        }
      } catch (error) {
        console.error('Failed to load profile:', error)
        setError(t("additional.failedToLoadProfile"))
      } finally {
        setIsLoading(false)
      }
    }
    
    loadProfile()
  }, [])

  const handleUpdateProfile = async () => {
    if (!profile) return
    
    setIsEditing(true)
    setError("")
    setSuccess("")
    
    try {
      const payload: UpdateProfilePayload = {
        email: email !== profile.email ? email : undefined,
        phone: phone !== (profile.phone || "") ? phone : undefined,
        first_name: firstName !== profile.first_name ? firstName : undefined,
        last_name: lastName !== profile.last_name ? lastName : undefined,
        contact_method: contactMethod !== profile.contact_method ? contactMethod : undefined,
      }
      
      // Only send fields that have changed
      const filteredPayload = Object.fromEntries(
        Object.entries(payload).filter(([_, value]) => value !== undefined)
      )
      
      if (Object.keys(filteredPayload).length === 0) {
        setError(t("additional.noChangesToSave"))
        return
      }
      
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        const response = await profileService.updateProfile(accessToken, filteredPayload)
        setSuccess(response.message)
        setProfile(response.user)
        // Refresh user data in context
        await refreshToken()
      }
    } catch (error) {
      console.error('Update profile error:', error)
      
      // Parse backend errors using the new error parsing utility
      const parsedError = parseBackendError(error)
      const formattedMessage = formatErrorMessage(parsedError)
      setError(formattedMessage)
    } finally {
      setIsEditing(false)
    }
  }

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError(t("additional.newPasswordsDoNotMatch"))
      return
    }
    
    if (newPassword.length < 6) {
      setError(t("additional.newPasswordMustBeAtLeast6Characters"))
      return
    }
    
    setIsChangingPassword(true)
    setError("")
    setSuccess("")
    
    try {
      const payload: ChangePasswordPayload = {
        old_password: oldPassword,
        new_password: newPassword
      }
      
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        const response = await profileService.changePassword(accessToken, payload)
        setSuccess(response.message)
        // Clear password fields
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (error) {
      console.error('Change password error:', error)
      
      // Parse backend errors using the new error parsing utility
      const parsedError = parseBackendError(error)
      const formattedMessage = formatErrorMessage(parsedError)
      setError(formattedMessage)
    } finally {
      setIsChangingPassword(false)
    }
  }

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        theme === "dark"
          ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
          : "bg-gradient-to-b from-blue-50 via-white to-blue-50"
      }`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            {t("profile.loading")}
          </p>
        </div>
      </div>
    )
  }

  // Pull-to-refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!pullToRefreshState.canPull || pullToRefreshState.isRefreshing) return
    
    const startY = e.touches[0].clientY
    setPullToRefreshState(prev => ({
      ...prev,
      startY,
      currentY: startY,
      isPulling: false
    }))
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!pullToRefreshState.canPull || pullToRefreshState.isRefreshing) return
    
    const currentY = e.touches[0].clientY
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    
    // Only allow pull-to-refresh when at the top of the page
    if (scrollTop > 0) {
      setPullToRefreshState(prev => ({ ...prev, canPull: false }))
      return
    }
    
    const pullDistance = Math.max(0, currentY - pullToRefreshState.startY)
    const maxPullDistance = 120
    
    if (pullDistance > 0) {
      e.preventDefault() // Prevent default scroll behavior
      setPullToRefreshState(prev => ({
        ...prev,
        currentY,
        pullDistance: Math.min(pullDistance, maxPullDistance),
        isPulling: pullDistance > 10
      }))
    }
  }

  const handleTouchEnd = () => {
    if (!pullToRefreshState.canPull || pullToRefreshState.isRefreshing) return
    
    const { pullDistance } = pullToRefreshState
    const refreshThreshold = 80
    
    if (pullDistance >= refreshThreshold && pullToRefreshState.isPulling) {
      handleRefresh()
    } else {
      // Reset pull state
      setPullToRefreshState(prev => ({
        ...prev,
        isPulling: false,
        pullDistance: 0,
        canPull: true
      }))
    }
  }

  const handleRefresh = async () => {
    setPullToRefreshState(prev => ({ ...prev, isRefreshing: true }))
    // Reload profile data
    try {
      const accessToken = localStorage.getItem('accessToken')
      if (accessToken) {
        const profileData = await profileService.getProfile(accessToken)
        setProfile(profileData)
        setEmail(profileData.email)
        setPhone(profileData.phone || "")
        setFirstName(profileData.first_name)
        setLastName(profileData.last_name)
        setContactMethod(profileData.contact_method)
      }
    } catch (error) {
      console.error('Refresh profile error:', error)
    }
    setTimeout(() => {
      setPullToRefreshState(prev => ({ ...prev, isRefreshing: false, pullDistance: 0 }))
    }, 500)
  }

  // Reset canPull when scroll position changes
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      if (scrollTop === 0) {
        setPullToRefreshState(prev => ({ ...prev, canPull: true }))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div 
      className={`min-h-screen relative overflow-hidden ${
        theme === "dark"
        ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
        : "bg-gradient-to-b from-blue-50 via-white to-blue-50"
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${pullToRefreshState.pullDistance}px)`,
        transition: pullToRefreshState.isPulling ? 'none' : 'transform 0.3s ease-out'
      }}
    >
      {/* Pull-to-refresh indicator */}
      {(pullToRefreshState.isPulling || pullToRefreshState.isRefreshing) && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            theme === "dark" 
              ? "bg-gray-800/90 backdrop-blur-sm border border-gray-700/50" 
              : "bg-white/90 backdrop-blur-sm border border-gray-200/50"
          } shadow-lg`}>
            <RefreshCw className={`w-5 h-5 ${
              pullToRefreshState.isRefreshing ? 'animate-spin' : ''
            } ${theme === "dark" ? "text-blue-400" : "text-blue-500"}`} />
          </div>
        </div>
      )}

      {/* Mobile-optimized background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-20 right-4 w-32 h-32 rounded-full opacity-20 ${
          theme === "dark" ? "bg-blue-500" : "bg-blue-300"
        } blur-2xl animate-pulse`}></div>
        <div className={`absolute bottom-40 left-4 w-40 h-40 rounded-full opacity-20 ${
          theme === "dark" ? "bg-blue-500" : "bg-blue-300"
        } blur-2xl animate-pulse`} style={{animationDelay: '1.5s'}}></div>
      </div>

      {/* Mobile-first header with safe area */}
      <div className="relative z-10 px-4 pt-safe-area-inset-top pt-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            className={`h-11 w-11 p-0 rounded-xl active:scale-95 transition-all duration-200 ${
              theme === "dark" 
                ? "text-gray-300 hover:bg-white/10 active:bg-white/20" 
                : "text-gray-600 hover:bg-black/5 active:bg-black/10"
            }`}
            onClick={onNavigateBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="text-center flex-1 mx-4">
            <h1 className={`text-xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
              {t("profile.title")}
            </h1>
            <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
              {t("profile.subtitle")}
            </p>
          </div>
          
          <div className={`p-2.5 rounded-xl ${
            theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
          }`}>
            <Settings className="w-5 h-5" />
          </div>
        </div>

        {/* Profile Tabs - Mobile optimized */}
        <div className={`p-1 rounded-2xl mb-6 ${
          theme === "dark" ? "bg-gray-800/60 backdrop-blur-sm" : "bg-white/80 backdrop-blur-sm shadow-sm"
        }`}>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${
                activeTab === "profile"
                  ? theme === "dark"
                    ? "bg-blue-500/20 text-blue-400 shadow-sm"
                    : "bg-blue-100 text-blue-700 shadow-sm"
                  : theme === "dark"
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <User className="w-4 h-4" />
              <span>{t("profile.tabs.profile")}</span>
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${
                activeTab === "password"
                  ? theme === "dark"
                    ? "bg-red-500/20 text-red-400 shadow-sm"
                    : "bg-red-100 text-red-700 shadow-sm"
                  : theme === "dark"
                    ? "text-gray-400 hover:text-gray-300"
                    : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>{t("profile.tabs.password")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <div className="relative z-10 px-4 pb-32 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            {/* Status Messages */}
            <ErrorAlert
              error={error}
              type="error"
              title={t("additional.profileUpdateFailed")}
              onDismiss={() => setError("")}
            />

            {success && (
              <div className={`flex items-center gap-3 p-4 rounded-xl border animate-in slide-in-from-top-2 ${
                theme === "dark" 
                  ? "bg-green-900/20 border-green-700/50 backdrop-blur-sm" 
                  : "bg-green-50 border-green-200/50 backdrop-blur-sm"
              }`}>
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className={`text-sm font-medium ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                  {success}
                </span>
              </div>
            )}

            {/* Email Card */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              theme === "dark" 
                ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
                : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
            }`}>
              <Label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}>
                <div className={`p-1.5 rounded-lg ${
                  theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                }`}>
                  <Mail className="w-4 h-4" />
                </div>
                {t("profile.fields.email")}
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`h-12 text-base font-medium rounded-xl border-2 transition-all duration-300 ${
                  theme === "dark" 
                    ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:bg-gray-700" 
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white"
                }`}
              />
            </div>

            {/* Phone Card */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              theme === "dark" 
                ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
                : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
            }`}>
              <Label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}>
                <div className={`p-1.5 rounded-lg ${
                  theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
                }`}>
                  <Phone className="w-4 h-4" />
                </div>
                {t("profile.fields.phone")}
              </Label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`h-12 text-base font-medium rounded-xl border-2 transition-all duration-300 ${
                  theme === "dark" 
                    ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:bg-gray-700" 
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-green-500 focus:bg-white"
                }`}
              />
            </div>

            {/* Name Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                theme === "dark" 
                  ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
                  : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
              }`}>
                <Label className={`text-sm font-semibold mb-2 block ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}>
                  {t("profile.fields.firstName")}
                </Label>
                <Input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`h-11 text-base font-medium rounded-xl border-2 transition-all duration-300 ${
                    theme === "dark" 
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:bg-gray-700" 
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:bg-white"
                  }`}
                />
              </div>
              
              <div className={`p-4 rounded-2xl border transition-all duration-300 ${
                theme === "dark" 
                  ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
                  : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
              }`}>
                <Label className={`text-sm font-semibold mb-2 block ${
                  theme === "dark" ? "text-gray-200" : "text-gray-800"
                }`}>
                  {t("profile.fields.lastName")}
                </Label>
                <Input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`h-11 text-base font-medium rounded-xl border-2 transition-all duration-300 ${
                    theme === "dark" 
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500 focus:bg-gray-700" 
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-purple-500 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Contact Method Card */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              theme === "dark" 
                ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
                : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
            }`}>
              <Label className={`text-sm font-semibold mb-4 block ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}>
                {t("profile.fields.contactMethod")}
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setContactMethod("email")}
                  className={`h-11 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${
                    contactMethod === "email"
                      ? "bg-blue-500 text-white shadow-lg"
                      : theme === "dark"
                        ? "bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t("profile.contactMethods.email")}
                </Button>
                <Button
                  onClick={() => setContactMethod("phone")}
                  className={`h-11 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${
                    contactMethod === "phone"
                      ? "bg-blue-500 text-white shadow-lg"
                      : theme === "dark"
                        ? "bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600"
                        : "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {t("profile.contactMethods.phone")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="space-y-6">
            {/* Status Messages */}
            <ErrorAlert
              error={error}
              type="error"
              title={t("additional.passwordChangeFailed")}
              onDismiss={() => setError("")}
            />

            {success && (
              <div className={`flex items-center gap-3 p-4 rounded-xl border animate-in slide-in-from-top-2 ${
                theme === "dark" 
                  ? "bg-green-900/20 border-green-700/50 backdrop-blur-sm" 
                  : "bg-green-50 border-green-200/50 backdrop-blur-sm"
              }`}>
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className={`text-sm font-medium ${theme === "dark" ? "text-green-400" : "text-green-600"}`}>
                  {success}
                </span>
              </div>
            )}

            {/* Password Cards */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              theme === "dark" 
                ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
                : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
            }`}>
              <Label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}>
                <div className={`p-1.5 rounded-lg ${
                  theme === "dark" ? "bg-yellow-500/20 text-yellow-400" : "bg-yellow-100 text-yellow-600"
                }`}>
                  <Lock className="w-4 h-4" />
                </div>
                {t("profile.fields.currentPassword")}
              </Label>
              <div className="relative">
                <Input
                  type={showPasswords.old ? "text" : "password"}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className={`pr-12 h-12 text-base font-medium rounded-xl border-2 transition-all duration-300 ${
                    theme === "dark" 
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-yellow-500 focus:bg-gray-700" 
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-yellow-500 focus:bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('old')}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-gray-300 hover:bg-gray-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {showPasswords.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              theme === "dark" 
                ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
                : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
            }`}>
              <Label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}>
                <div className={`p-1.5 rounded-lg ${
                  theme === "dark" ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"
                }`}>
                  <Lock className="w-4 h-4" />
                </div>
                {t("profile.fields.newPassword")}
              </Label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`pr-12 h-12 text-base font-medium rounded-xl border-2 transition-all duration-300 ${
                    theme === "dark" 
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500 focus:bg-gray-700" 
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-gray-300 hover:bg-gray-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className={`p-5 rounded-2xl border transition-all duration-300 ${
              theme === "dark" 
                ? "bg-gray-800/60 border-gray-700/50 backdrop-blur-sm" 
                : "bg-white/80 border-gray-200/50 backdrop-blur-sm shadow-sm"
            }`}>
              <Label className={`text-sm font-semibold mb-3 flex items-center gap-2 ${
                theme === "dark" ? "text-gray-200" : "text-gray-800"
              }`}>
                <div className={`p-1.5 rounded-lg ${
                  theme === "dark" ? "bg-green-500/20 text-green-400" : "bg-green-100 text-green-600"
                }`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                {t("profile.fields.confirmPassword")}
              </Label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pr-12 h-12 text-base font-medium rounded-xl border-2 transition-all duration-300 ${
                    theme === "dark" 
                      ? "bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-green-500 focus:bg-gray-700" 
                      : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 focus:border-green-500 focus:bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-lg transition-colors ${
                    theme === "dark" ? "text-gray-400 hover:text-gray-300 hover:bg-gray-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom buttons - Mobile optimized */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 p-4 ${
        theme === "dark" 
          ? "bg-slate-900/95 border-t border-gray-700/50" 
          : "bg-white/95 border-t border-gray-200/50"
      } backdrop-blur-lg`}>
        {activeTab === "profile" ? (
          <Button
            onClick={handleUpdateProfile}
            disabled={isEditing}
            className={`w-full h-12 text-base font-bold rounded-2xl transition-all duration-200 active:scale-98 ${
              isEditing
                ? "bg-gray-400/50 cursor-not-allowed text-gray-600"
                : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25"
            }`}
          >
            {isEditing ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{t("profile.buttons.updating")}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                <span>{t("profile.buttons.updateProfile")}</span>
              </div>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleChangePassword}
            disabled={isChangingPassword || !oldPassword || !newPassword || !confirmPassword}
            className={`w-full h-12 text-base font-bold rounded-2xl transition-all duration-200 active:scale-98 ${
              isChangingPassword || !oldPassword || !newPassword || !confirmPassword
                ? "bg-gray-400/50 cursor-not-allowed text-gray-600"
                : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-500/25"
            }`}
          >
            {isChangingPassword ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{t("profile.buttons.changingPassword")}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                <span>{t("profile.buttons.changePassword")}</span>
              </div>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}