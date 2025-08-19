// src/components/ChatHeader.jsx
import { useAppStore } from "@/store";
import { RiCloseFill } from "react-icons/ri";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { getImageUrl } from "@/utills/imageUtils";

const ChatHeader = () => {
  const { closeChat, selectedChatData } = useAppStore();

  if (!selectedChatData) return null; 

  return (
    <div className="h-[10vh] border-b border-[#2f303b] flex items-center justify-between px-5">
      <div className="flex gap-3 items-center">
        <div className="flex gap-3 items-center">
          <Avatar className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-600">
            {selectedChatData.image ? (
              <AvatarImage
                src={getImageUrl(selectedChatData.image)}
                alt="profile"
                className="object-cover w-full h-full bg-black"
              />
            ) : (
              <div
                className={`uppercase h-full w-full text-xl flex items-center justify-center rounded-full ${getColor(
                  selectedChatData.color ?? 0
                )}`}
              >
                {selectedChatData.firstName?.charAt(0) || selectedChatData.email?.charAt(0)}
              </div>
            )}
          </Avatar>
          <div className="text-white">
            <p className="font-medium text-sm">
              {selectedChatData.firstName
                ? `${selectedChatData.firstName} ${selectedChatData.lastName || ''}`
                : selectedChatData.email}
            </p>
            <p className="text-xs text-gray-400">
              {selectedChatData.status || "Online"}
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <button 
          className="text-neutral-500 hover:text-white duration-300 transition-all focus:outline-none"
          onClick={closeChat}
        >
          <RiCloseFill className="text-2xl" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;




//working code 
// import { useAppStore } from "@/store";
// import { RiCloseFill } from "react-icons/ri";
// import { Avatar, AvatarImage } from "@/components/ui/avatar";
// import { getColor } from "@/lib/utils";

// const ChatHeader = () => {
//   const { closeChat, selectedChatData } = useAppStore();

//   const getImageUrl = (image) => {
//     if (!image) return null;
//     if (image.startsWith('http')) return image;
//     return `${import.meta.env.VITE_SERVER_URL}/${image}`;
//   };

//   if (!selectedChatData) return null; 

//   return (
//     <div className="h-[10vh] border-b border-[#2f303b] flex items-center justify-between px-5">
//       <div className="flex gap-3 items-center">
//         <div className="flex gap-3 items-center">
//           <Avatar className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-600">
//             {selectedChatData.image ? (
//               <AvatarImage
//                 src={getImageUrl(selectedChatData.image)}
//                 alt="profile"
//                 className="object-cover w-full h-full bg-black"
//               />
//             ) : (
//               <div
//                 className={`uppercase h-full w-full text-xl flex items-center justify-center rounded-full ${getColor(
//                   selectedChatData.color || 0
//                 )}`}
//               >
//                 {selectedChatData.firstName
//                   ? selectedChatData.firstName.charAt(0)
//                   : selectedChatData.email.charAt(0)}
//               </div>
//             )}
//           </Avatar>
//           <div className="text-white">
//             <p className="font-medium text-sm">
//               {selectedChatData.firstName
//                 ? `${selectedChatData.firstName} ${selectedChatData.lastName}`
//                 : selectedChatData.email}
//             </p>
//             <p className="text-xs text-gray-400">
//               {selectedChatData.status || "Online"}
//             </p>
//           </div>
//         </div>
//       </div>
//       <div className="flex items-center justify-center">
//         <button 
//           className="text-neutral-500 hover:text-white duration-300 transition-all focus:outline-none"
//           onClick={closeChat}
//         >
//           <RiCloseFill className="text-2xl" />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatHeader;


