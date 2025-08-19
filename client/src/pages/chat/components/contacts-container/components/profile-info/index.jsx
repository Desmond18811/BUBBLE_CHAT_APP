// src/components/ProfileInfo.jsx
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { useAppStore } from "@/store";
import { getColor } from "@/lib/utils";
import { LOGOUT_ROUTE } from "@/utills/constants";
import { FiEdit2 } from "react-icons/fi";
import { useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { IoPowerSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";
import { getImageUrl } from "@/utills/imageUtils";

const ProfileInfo = () => {
  const { userInfo, setUserInfo } = useAppStore();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const logOut = async () => {
    try {
      const response = await apiClient.post(LOGOUT_ROUTE, {}, { withCredentials: true });
      if (response.status === 200) {
        setUserInfo(null);
        navigate("/auth");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  if (!userInfo) return null;

  return (
    <div className="h-[10vh] border-t border-gray-700 w-18">
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-600">
            {userInfo.image ? (
              <AvatarImage
                src={getImageUrl(userInfo.image)}
                alt="profile"
                className="object-cover w-full h-full bg-black"
              />
            ) : (
              <div
                className={`uppercase h-full w-full text-xl flex items-center justify-center rounded-full ${getColor(
                  userInfo.color ?? 0
                )}`}
              >
                {userInfo.firstName?.charAt(0) || userInfo.email?.charAt(0)}
              </div>
            )}
          </Avatar>

          <div className="text-white">
            <p className="font-medium text-sm">
              {userInfo.firstName 
                ? `${userInfo.firstName} ${userInfo.lastName || ''}` 
                : userInfo.email}
            </p>
            <p className="text-xs text-gray-400">
              {userInfo.status || "Online"}
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => navigate("/profile")}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <FiEdit2 className="text-xl" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                <p>Edit Profile</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={logOut}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <IoPowerSharp className="text-xl" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-[#1c1b1e] border-none text-white">
                <p>Log Out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfo;


//working code 

// import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
// import { useAppStore } from "@/store";
// import { getColor } from "@/lib/utils";
// import { HOST, LOGOUT_ROUTE } from "@/utills/constants";
// import { FiEdit2 } from "react-icons/fi";
// import { useState } from "react";
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// import { IoPowerSharp } from "react-icons/io5";
// import { useNavigate } from "react-router-dom";
// import apiClient from "@/lib/api-client";
// import { toast } from "sonner";

// const ProfileInfo = () => {
//   const { userInfo, setUserInfo } = useAppStore();
//   const [showMenu, setShowMenu] = useState(false);
//   const navigate = useNavigate();

//   const getImageUrl = (image) => {
//     if (!image) return null;
//     if (image.startsWith('http')) return image;
//     return `${HOST}/${image}?v=${Date.now()}`; // Cache busting
//   };

//   const logOut = async () => {
//     try {
//       const response = await apiClient.post(LOGOUT_ROUTE, {}, { withCredentials: true });
//       if (response.status === 200) {
//         setUserInfo(null);
//         navigate("/auth");
//       }
//     } catch (error) {
//       console.error("Logout error:", error);
//       toast.error("Failed to logout");
//     }
//   };

//   return (
//     <div className="h-[10vh] border-t border-gray-700 w-18">
//       <div className="flex items-center justify-between p-3">
//         <div className="flex items-center gap-3">
//           <Avatar className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-600">
//             {userInfo.image ? (
//               <AvatarImage
//                 src={getImageUrl(userInfo.image)}
//                 alt="profile"
//                 className="object-cover w-full h-full bg-black"
//               />
//             ) : (
//               <div
//                 className={`uppercase h-full w-full text-xl flex items-center justify-center rounded-full ${getColor(
//                   userInfo.color || 0 // Default to color 0 if not set
//                 )}`}
//               >
//                 {userInfo.firstName
//                   ? userInfo.firstName.charAt(0)
//                   : userInfo.email.charAt(0)}
//               </div>
//             )}
//           </Avatar>

//           <div className="text-white">
//             <p className="font-medium text-sm">
//               {userInfo.firstName
//                 ? `${userInfo.firstName} ${userInfo.lastName}`
//                 : userInfo.email}
//             </p>
//             <p className="text-xs text-gray-400">
//               {userInfo.status || "Online"}
//             </p>
//           </div>
//         </div>

//         <div className="flex gap-4">
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <button 
//                   onClick={() => navigate("/profile")}
//                   className="text-blue-400 hover:text-blue-300 transition-colors"
//                 >
//                   <FiEdit2 className="text-xl" />
//                 </button>
//               </TooltipTrigger>
//               <TooltipContent className="bg-[#1c1b1e] border-none text-white">
//                 <p>Edit Profile</p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>

//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <button 
//                   onClick={logOut}
//                   className="text-red-400 hover:text-red-300 transition-colors"
//                 >
//                   <IoPowerSharp className="text-xl" />
//                 </button>
//               </TooltipTrigger>
//               <TooltipContent className="bg-[#1c1b1e] border-none text-white">
//                 <p>Log Out</p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>

//         {showMenu && <ProfileMenu onClose={() => setShowMenu(false)} />}
//       </div>
//     </div>
//   );
// };

// export default ProfileInfo;
