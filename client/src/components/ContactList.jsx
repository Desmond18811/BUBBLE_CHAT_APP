// src/components/ContactList.jsx
import { useAppStore } from "@/store";
import { Avatar, AvatarImage } from "./ui/avatar";
import { getColor } from "@/lib/utils";
import { getImageUrl } from "@/utills/imageUtils";

const ContactList = ({ contacts, isChannel }) => {
  const {
    selectedChatData,
    setSelectedChatData,
    setSelectedChatType,
    setSelectedChatMessages,
  } = useAppStore();

  const handleClick = (contact) => {
    setSelectedChatType(isChannel ? "channel" : "contact");

    if (selectedChatData && selectedChatData._id !== contact._id) {
      setSelectedChatMessages([]);
    }

    setSelectedChatData(contact);
  };

  return (
    <div className="mt-5">
      {contacts.map((contact) => (
        <div
          key={contact._id}
          onClick={() => handleClick(contact)}
          className={`pl-10 py-2 transition-all duration-300 cursor-pointer 
            ${
              selectedChatData && selectedChatData._id === contact._id
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-700 text-gray-300"
            }`}
        >
          <div className="flex gap-3 items-center justify-start text-neutral-300">
            {!isChannel && (
              <Avatar className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-600">
                {contact.image ? (
                  <AvatarImage
                    src={getImageUrl(contact.image)}
                    alt="profile"
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div
                    className={`uppercase h-full w-full text-xl flex items-center justify-center rounded-full ${getColor(
                      contact.color ?? 0
                    )}`}
                  >
                    {contact.firstName?.charAt(0) || contact.email?.charAt(0)}
                  </div>
                )}
              </Avatar>
            )}
            <span>{contact.firstName || contact.email || contact._id}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList;



// import { useAppStore } from "@/store";
// import { Avatar, AvatarImage } from "./ui/avatar";
// import { getColor } from "@/lib/utils";

// const ContactList = ({ contacts, isChannel }) => {
//   const {
//     selectedChatData,
//     setSelectedChatData,
//     setSelectedChatType,
//     setSelectedChatMessages,
//   } = useAppStore();

//   const getImageUrl = (image) => {
//     if (!image) return null;
//     if (image.startsWith("http")) return image;
//     return `${import.meta.env.VITE_SERVER_URL}/${image}`;
//   };

//   const handleClick = (contact) => {
//     setSelectedChatType(isChannel ? "channel" : "contact");

//     if (selectedChatData && selectedChatData._id !== contact._id) {
//       setSelectedChatMessages([]);
//     }

//     setSelectedChatData(contact);
//   };

//   return (
//     <div className="mt-5">
//       {contacts.map((contact) => (
//         <div
//           key={contact._id}
//           onClick={() => handleClick(contact)}
//           className={`pl-10 py-2 transition-all duration-300 cursor-pointer 
//             ${
//               selectedChatData && selectedChatData._id === contact._id
//                 ? "bg-blue-500 text-white"
//                 : "hover:bg-gray-700 text-gray-300"
//             }`}
//         >
//           <div className="flex gap-3 items-center justify-start text-neutral-300">
//             {!isChannel && (
//               <Avatar className="h-10 w-10 rounded-full overflow-hidden border-2 border-gray-600">
//                 {contact.image ? (
//                   <AvatarImage
//                     src={getImageUrl(contact.image)}
//                     alt="profile"
//                     className="object-cover w-full h-full bg-black"
//                   />
//                 ) : (
//                   <div
//                     className={`uppercase h-full w-full text-xl flex items-center justify-center rounded-full ${getColor(
//                       contact.color || 0
//                     )}`}
//                   >
//                     {contact.firstName
//                       ? contact.firstName.charAt(0)
//                       : contact.email?.charAt(0)}
//                   </div>
//                 )}
//               </Avatar>
//             )}
//             {/* Display name or email */}
//             <span>{contact.firstName || contact.email || contact._id}</span>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default ContactList;

