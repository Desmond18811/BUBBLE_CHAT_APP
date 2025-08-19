// ProfileMenu.jsx
import { useAppStore } from "@/store";
import { useNavigate } from "react-router-dom";
import { FiSettings, FiLogOut, FiUser } from "react-icons/fi";

const ProfileMenu = () => {
  const { logout } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div
      className="absolute bottom-12 right-0 bg-[#363841] rounded-md shadow-lg py-2 w-48 z-50 border border-gray-700"
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-gray-700 text-sm"
        onClick={() => navigate("/profile")}
      >
        <FiUser className="text-base" />
        Profile
      </button>
      <button
        className="w-full flex items-center gap-3 px-4 py-2 text-white hover:bg-gray-700 text-sm"
        onClick={() => navigate("/settings")}
      >
        <FiSettings className="text-base" />
        Settings
      </button>
      <div className="border-t border-gray-700 my-1"></div>
      <button
        className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-gray-700 text-sm"
        onClick={handleLogout}
      >
        <FiLogOut className="text-base" />
        Log Out
      </button>
    </div>
  );
};

export default ProfileMenu;

