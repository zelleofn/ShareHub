import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

type Settings = {
  language: string;
  theme: "light" | "dark";
  notificationsEnabled: boolean;
  defaultFilePrivacy: "public" | "private";
  fileVersioningEnabled: boolean;
};

const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings>({
    language: "en",
    theme: "light",
    notificationsEnabled: true,
    defaultFilePrivacy: "private",
    fileVersioningEnabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/user/settings")
      .then(res => {
        setSettings(res.data);
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await axios.put("/user/settings", settings);
      toast.success("Settings updated successfully");
    } catch {
      toast.error("Failed to update settings");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    try {
        await axios.delete("/user/settings/account");
        toast.success("Account deleted successfully");
        window.location.href="/login";
    } catch {
      toast.error("Failed to delete account");
    }
};

const handleExportData = async () => {
    try {
        const res = await axios.get("/user/settings/export", { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'user-data.json');
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Data exported successfully");
    } catch {
      toast.error("Failed to export data");
    }
};

  if (loading) return <p className="text-gray-500">Loading settings...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      {/* General Settings */}
      <div className="bg-white border rounded p-4 shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">General Settings</h2>
        {/* Language */}
        <label className="block text-sm font-medium mb-1">Language</label>
        <select
          value={settings.language}
          onChange={e => setSettings({ ...settings, language: e.target.value })}
          className="border p-2 w-full mb-3"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>

        {/* Theme */}
        <label className="block text-sm font-medium mb-1">Theme</label>
        <div className="flex space-x-2 mb-3">
          <button
            onClick={() => setSettings({ ...settings, theme: "light" })}
            className={`px-3 py-1 rounded ${settings.theme === "light" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Light
          </button>
          <button
            onClick={() => setSettings({ ...settings, theme: "dark" })}
            className={`px-3 py-1 rounded ${settings.theme === "dark" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Dark
          </button>
        </div>

        {/* Notifications */}
        <label className="block text-sm font-medium mb-1">Notifications</label>
        <input
          type="checkbox"
          checked={settings.notificationsEnabled}
          onChange={e => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
          className="mr-2"
        />
        <span>{settings.notificationsEnabled ? "Enabled" : "Disabled"}</span>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white border rounded p-4 shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">Privacy Settings</h2>
        {/* Default File Privacy */}
        <label className="block text-sm font-medium mb-1">Default File Privacy</label>
        <select
          value={settings.defaultFilePrivacy}
          onChange={e => setSettings({ ...settings, defaultFilePrivacy: e.target.value as "public" | "private" })}
          className="border p-2 w-full mb-3"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        {/* File Versioning */}
        <label className="block text-sm font-medium mb-1">File Versioning</label>
        <input
          type="checkbox"
          checked={settings.fileVersioningEnabled}
          onChange={e => setSettings({ ...settings, fileVersioningEnabled: e.target.checked })}
          className="mr-2"
        />
        <span>{settings.fileVersioningEnabled ? "Enabled" : "Disabled"}</span>
      </div>

      {/* Account Settings */}
      <div className="bg-white border rounded p-4 shadow">
        <h2 className="text-lg font-semibold mb-2">Account Settings</h2>
        <button
          onClick={handleDeleteAccount}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 mb-3"
        >
          Delete Account
        </button>
        <button
          onClick={handleExportData}
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          Export Data
        </button>
      </div>

      {/* Save button */}
      <div className="mt-6">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
