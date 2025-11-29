import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

type Settings = {
  language: string;
  theme: "light" | "dark";
  notificationsEnabled: boolean;
};

const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings>({
    language: "en",
    theme: "light",
    notificationsEnabled: true,
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

  if (loading) return <p className="text-gray-500">Loading settings...</p>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">General Settings</h1>

      {/* Language selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Language</label>
        <select
          value={settings.language}
          onChange={e => setSettings({ ...settings, language: e.target.value })}
          className="border p-2 w-full rounded"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>

      {/* Theme toggle */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Theme</label>
        <div className="flex space-x-2">
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
      </div>

      {/* Notifications preferences */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Notifications</label>
        <input
          type="checkbox"
          checked={settings.notificationsEnabled}
          onChange={e => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
          className="mr-2"
        />
        <span>{settings.notificationsEnabled ? "Enabled" : "Disabled"}</span>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Save Settings
      </button>
    </div>
  );
};

export default SettingsPage;
