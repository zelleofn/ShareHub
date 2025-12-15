import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../services/api";


type UserInfo = {
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    profilePicture?: string;
};

const ProfilePage = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: "", email: "" });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });

  useEffect(() => {
  api.get("/user/info")
    .then(res => {
      
      setUser(res.data);
      setFormData({ username: res.data.name, email: res.data.email });
    })
    .catch(err => {
      console.log("ERROR:", err.response?.status, err.response?.data);
      toast.error("Failed to load profile");
    })
    .finally(() => setLoading(false));
}, []);

  const handleUpdateProfile = async () => {
  try {
    await api.put("/user/edit", formData);

    
    const updated = await api.get("/user/info");
    setUser(updated.data);

    toast.success("Profile updated");
    setEditMode(false);
  } catch {
    toast.error("Failed to update profile");
  }
};


  const handleChangePassword = async () => {
    try {
      await api.put("/user/change-password", passwords);
      toast.success("Password changed");
      setPasswords({ currentPassword: "", newPassword: "" });
    } catch {
      toast.error("Failed to change password");
    }
  };

  const handleUploadPicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append("profilePicture", e.target.files[0]);
    try {
      await api.put("/user/upload-picture", formData);
      toast.success("Profile picture updated");
    } catch {
      toast.error("Failed to upload picture");
    }
  };

  if (loading) return <p className="text-gray-500">Loading profile...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>

      {/* Display user info */}
      {user && (
        <div className="bg-white border rounded p-4 shadow mb-6">
          <img
            src={user.profilePicture || "/default-avatar.png"}
            alt="Profile"
            className="w-20 h-20 rounded-full mb-3"
          />
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Account Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
          <p><strong>Last Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
        </div>
      )}

      {/* Edit profile form */}
      {editMode ? (
        <div className="bg-white border rounded p-4 shadow mb-6">
          <h2 className="text-lg font-semibold mb-2">Edit Profile</h2>
          <input
            type="text"
            value={formData.username}
            onChange={e => setFormData({ ...formData, username: e.target.value })}
            className="border p-2 w-full mb-2"
            placeholder="Name"
          />
          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="border p-2 w-full mb-2"
            placeholder="Email"
          />
          <button onClick={handleUpdateProfile} className="bg-blue-600 text-white px-3 py-1 rounded">
            Save
          </button>
          <button onClick={() => setEditMode(false)} className="ml-2 text-gray-500">
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setEditMode(true)} className="bg-gray-200 px-3 py-1 rounded mb-6">
          Edit Profile
        </button>
      )}

      {/* Change password form */}
      <div className="bg-white border rounded p-4 shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Change Password</h2>
      <input
         type="password"
         value={passwords.currentPassword}
         onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
         placeholder="Current Password"
      />
        <input
          type="password"
          value={passwords.newPassword}
          onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
          placeholder="New Password"
      />
        <button onClick={handleChangePassword} className="bg-blue-600 text-white px-3 py-1 rounded">
          Update Password
        </button>
      </div>

      {/* Profile picture upload */}
      <div className="bg-white border rounded p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">Profile Picture</h2>
        <input type="file" accept="image/*" onChange={handleUploadPicture} />
      </div>
    </div>
  );
};

export default ProfilePage;