// src/pages/Profile.jsx
import { useAppStore } from "@/store";
import { IoArrowBack } from 'react-icons/io5';
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { colors, getColor } from "@/lib/utils";
import { FaPlus, FaTrash } from 'react-icons/fa';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import { UPDATE_PROFILE_ROUTE, ADD_PROFILE_IMAGE_ROUTE, REMOVE_PROFILE_IMAGE_ROUTE } from "@/utills/constants";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "@/utills/imageUtils";

const Profile = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore(); 
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null);
  const [localImage, setLocalImage] = useState(null);

  useEffect(() => {
    if (userInfo) {
      setFirstName(userInfo.firstName || "");
      setLastName(userInfo.lastName || "");
      setSelectedColor(userInfo.color || 0);
    }
  }, [userInfo]);

  const validateProfile = () => {
    if (!firstName) {
      toast.error("First name is required");
      return false;
    }
    if (!lastName) {
      toast.error("Last name is required");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (validateProfile()) {
      try {
        const response = await apiClient.post(
          UPDATE_PROFILE_ROUTE, 
          { 
            firstName, 
            lastName, 
            color: selectedColor,
            profileSetup: true
          }, 
          { withCredentials: true }
        );
        
        if (response.status === 200) {
          setUserInfo({
            ...userInfo,
            firstName,
            lastName,
            color: selectedColor,
            profileSetup: true,
            image: userInfo.image // Preserve existing image
          });
          toast.success("Profile successfully updated");
          navigate("/chat");
        }   
      } catch (error) {
        console.error("Update error:", error);
        toast.error(error.response?.data?.message || "Failed to update profile");
      }
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setLocalImage(previewUrl);

    try {
      const formData = new FormData();
      formData.append("profile-image", file);
      
      const response = await apiClient.post(
        ADD_PROFILE_IMAGE_ROUTE, 
        formData, 
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );

      if (response.data?.image) {
        setUserInfo(prev => ({ 
          ...prev, 
          image: response.data.image,
          color: selectedColor
        }));
        setLocalImage(null);
        toast.success("Profile image updated successfully");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload image");
      setLocalImage(null);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteImage = async () => {
    try {
      const response = await apiClient.post(
        REMOVE_PROFILE_IMAGE_ROUTE,
        {},
        { withCredentials: true }
      );

      if (response.status === 200) {
        setUserInfo(prev => ({ ...prev, image: null }));
        toast.success("Profile image removed successfully");
      }
    } catch (error) {
      console.error("Image delete error:", error);
      toast.error(error.response?.data?.message || "Failed to remove image");
    }
  };

  const currentImageUrl = localImage || getImageUrl(userInfo?.image);

  if (!userInfo) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center gap-10">
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div onClick={() => userInfo.profileSetup ? navigate("/chat") : toast.error("Please set up your profile")}>
          <IoArrowBack className="text-4xl lg:text-6xl text-white/90 cursor-pointer"/>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="h-full w-32 md:w-48 relative flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <label className="cursor-pointer">
              <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden relative">
                {currentImageUrl ? (
                  <AvatarImage 
                    src={currentImageUrl}
                    alt="profile" 
                    className="object-cover w-full h-full bg-black"
                  />
                ) : (
                  <div className={`
                    uppercase h-full w-full 
                    text-5xl flex items-center justify-center 
                    rounded-full ${getColor(selectedColor)}
                  `}>
                    {firstName ? firstName.charAt(0) : userInfo.email.charAt(0)}
                  </div>
                )}
                {hovered && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      userInfo.image ? handleDeleteImage() : fileInputRef.current?.click();
                    }}
                  >
                    {userInfo.image ? (
                      <FaTrash className="text-white text-3xl" />
                    ) : (
                      <FaPlus className="text-white text-3xl" />
                    )}
                  </div>
                )}
              </Avatar>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleImageChange} 
                accept=".png,.jpg,.jpeg,.webp"
              />
            </label>
          </div>

          <div className="flex flex-col gap-5 text-white">
            <Input 
              placeholder="Email" 
              type="email" 
              disabled 
              value={userInfo.email} 
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
            />
            <Input 
              placeholder="First Name" 
              type="text" 
              onChange={(e) => setFirstName(e.target.value)} 
              value={firstName} 
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
            />
            <Input 
              placeholder="Last Name" 
              type="text" 
              onChange={(e) => setLastName(e.target.value)} 
              value={lastName} 
              className="rounded-lg p-6 bg-[#2c2e3b] border-none"
            />
            <div className="w-full flex gap-5">
              {colors.map((color, index) => (
                <div 
                  key={index}
                  className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300
                    ${selectedColor === index ? 'ring-2 ring-white' : ''}`}
                  onClick={() => setSelectedColor(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <Button 
          className="h-16 w-full bg-purple-700 duration-300 hover:bg-purple-800"
          onClick={saveChanges}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default Profile;


//working code 

// import { useAppStore } from "@/store";
// import { IoArrowBack } from 'react-icons/io5';
// import { useEffect, useRef, useState } from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { colors, getColor } from "@/lib/utils";
// import { FaPlus, FaTrash } from 'react-icons/fa';
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import apiClient from "@/lib/api-client";
// import { UPDATE_PROFILE_ROUTE, ADD_PROFILE_IMAGE_ROUTE, REMOVE_PROFILE_IMAGE_ROUTE } from "@/utills/constants";
// import { useNavigate } from "react-router-dom";

// const Profile = () => {
//   const navigate = useNavigate();
//   const { userInfo, setUserInfo } = useAppStore(); 
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [hovered, setHovered] = useState(false);
//   const [selectedColor, setSelectedColor] = useState(0);
//   const fileInputRef = useRef(null);
//   const [localImage, setLocalImage] = useState(null); // For instant preview

//   useEffect(() => {
//     if (userInfo?.profileSetup) {
//       setFirstName(userInfo.firstName || "");
//       setLastName(userInfo.lastName || "");
//       setSelectedColor(userInfo.color || 0);
//     }
//   }, [userInfo]);

//   const validateProfile = () => {
//     if (!firstName) {
//       toast.error("First name is required");
//       return false;
//     }
//     if (!lastName) {
//       toast.error("Last name is required");
//       return false;
//     }
//     return true;
//   };
//  const saveChanges = async () => {
//     if (validateProfile()) {
//       try {
//         const response = await apiClient.post(
//           UPDATE_PROFILE_ROUTE, 
//           { 
//             firstName, 
//             lastName, 
//             color: selectedColor,
//             profileSetup: true // Ensure this is set
//           }, 
//           { 
//             withCredentials: true 
//           }
//         );
        
//         if (response.status === 200) {
//           // Update all relevant user info
//           setUserInfo({
//             ...userInfo,
//             firstName,
//             lastName,
//             color: selectedColor,
//             profileSetup: true
//           });
//           toast.success("Profile successfully updated");
//           navigate("/chat");
//         }   
//       } catch (error) {
//         console.error("Update error:", error);
//         toast.error(error.response?.data?.message || "Failed to update profile");
//       }
//     }
//   };


//   // const handleImageChange = async (event) => {
//   //   const file = event.target.files[0];
//   //   if (!file) return;

//   //   // Create instant preview
//   //   const previewUrl = URL.createObjectURL(file);
//   //   setLocalImage(previewUrl);

//   //   try {
//   //     const formData = new FormData();
//   //     formData.append("profile-image", file);
      
//   //     const response = await apiClient.post(
//   //       ADD_PROFILE_IMAGE_ROUTE, 
//   //       formData, 
//   //       {
//   //         withCredentials: true,
//   //         headers: {
//   //           'Content-Type': 'multipart/form-data'
//   //         }
//   //       }
//   //     );

//   //     if (response.data?.image) {
//   //       // Add timestamp to force image reload
//   //       const imageUrl = `${response.data.image}?v=${Date.now()}`;
//   //       setUserInfo(prev => ({ ...prev, image: imageUrl }));
//   //       setLocalImage(null); // Clear local preview
//   //       toast.success("Profile image updated successfully");
//   //     }
//   //   } catch (error) {
//   //     console.error("Image upload error:", error);
//   //     toast.error(error.response?.data?.message || "Failed to upload image");
//   //     setLocalImage(null); // Clear local preview on error
//   //   } finally {
//   //     if (fileInputRef.current) {
//   //       fileInputRef.current.value = '';
//   //     }
//   //   }
//   // };

// const handleImageChange = async (event) => {
//   const file = event.target.files[0];
//   if (!file) return;

//   // Create instant preview
//   const previewUrl = URL.createObjectURL(file);
//   setLocalImage(previewUrl);

//   try {
//     const formData = new FormData();
//     formData.append("profile-image", file);
    
//     const response = await apiClient.post(
//       ADD_PROFILE_IMAGE_ROUTE, 
//       formData, 
//       {
//         withCredentials: true,
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       }
//     );

//     if (response.data?.image) {
//       // Update user info with the new image path
//       setUserInfo(prev => ({ 
//         ...prev, 
//         image: response.data.image,
//         // Ensure color is also preserved
//         color: selectedColor 
//       }));
//       setLocalImage(null);
//       toast.success("Profile image updated successfully");
//     }
//   } catch (error) {
//     console.error("Image upload error:", error);
//     toast.error(error.response?.data?.message || "Failed to upload image");
//     setLocalImage(null);
//   } finally {
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   }
// };

//   const handleDeleteImage = async () => {
//     try {
//       const response = await apiClient.post(
//         REMOVE_PROFILE_IMAGE_ROUTE,
//         {},
//         { withCredentials: true }
//       );

//       if (response.status === 200) {
//         setUserInfo(prev => ({ ...prev, image: "" }));
//         toast.success("Profile image removed successfully");
//       }
//     } catch (error) {
//       console.error("Image delete error:", error);
//       toast.error(error.response?.data?.message || "Failed to remove image");
//     }
//   };

//   const getImageUrl = () => {
//     // Show local preview if available
//     if (localImage) return localImage;
    
//     if (!userInfo?.image) return null;
    
//     // If image is already a full URL (includes http/https)
//     if (userInfo.image.startsWith('http')) return userInfo.image;
    
//     // Construct full URL with cache buster
//     return `${import.meta.env.VITE_SERVER_URL}/${userInfo.image}`;
//   };

//   if (!userInfo) {
//     return <div>Loading user data...</div>;
//   }

//   return (
//     <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center gap-10">
//       <div className="flex flex-col gap-10 w-[80vw] md:w-max">
//         <div onClick={() => userInfo.profileSetup ? navigate("/chat") : toast.error("Please set up your profile")}>
//           <IoArrowBack className="text-4xl lg:text-6xl text-white/90 cursor-pointer"/>
//         </div>
        
//         <div className="grid grid-cols-2 gap-4">
//           <div 
//             className="h-full w-32 md:w-48 relative flex items-center justify-center"
//             onMouseEnter={() => setHovered(true)}
//             onMouseLeave={() => setHovered(false)}
//           >
//             <label className="cursor-pointer">
//               <Avatar className="h-32 w-32 md:w-48 md:h-48 rounded-full overflow-hidden relative">
//                 {getImageUrl() ? (
//                   <AvatarImage 
//                     src={getImageUrl()}
//                     alt="profile" 
//                     className="object-cover w-full h-full bg-black"
//                     key={getImageUrl()} // Key forces re-render when URL changes
//                   />
//                 ) : (
//                   <div className={`
//                     uppercase h-full w-full 
//                     text-5xl flex items-center justify-center 
//                     rounded-full ${getColor(selectedColor)}
//                   `}>
//                     {firstName ? firstName.charAt(0) : userInfo.email.charAt(0)}
//                   </div>
//                 )}
//                 {hovered && (
//                   <div 
//                     className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer"
//                     onClick={(e) => {
//                       e.preventDefault();
//                       if (userInfo.image) {
//                         handleDeleteImage();
//                       } else {
//                         fileInputRef.current?.click();
//                       }
//                     }}
//                   >
//                     {userInfo.image ? (
//                       <FaTrash className="text-white text-3xl" />
//                     ) : (
//                       <FaPlus className="text-white text-3xl" />
//                     )}
//                   </div>
//                 )}
//               </Avatar>
//               <input 
//                 type="file" 
//                 ref={fileInputRef} 
//                 className="hidden" 
//                 onChange={handleImageChange} 
//                 accept=".png,.jpg,.jpeg,.webp"
//               />
//             </label>
//           </div>

//           <div className="flex flex-col gap-5 text-white">
//             <Input 
//               placeholder="Email" 
//               type="email" 
//               disabled 
//               value={userInfo.email} 
//               className="rounded-lg p-6 bg-[#2c2e3b] border-none"
//             />
//             <Input 
//               placeholder="First Name" 
//               type="text" 
//               onChange={(e) => setFirstName(e.target.value)} 
//               value={firstName} 
//               className="rounded-lg p-6 bg-[#2c2e3b] border-none"
//             />
//             <Input 
//               placeholder="Last Name" 
//               type="text" 
//               onChange={(e) => setLastName(e.target.value)} 
//               value={lastName} 
//               className="rounded-lg p-6 bg-[#2c2e3b] border-none"
//             />
//             <div className="w-full flex gap-5">
//               {colors.map((color, index) => (
//                 <div 
//                   key={index}
//                   className={`${color} h-8 w-8 rounded-full cursor-pointer transition-all duration-300`}
//                   onClick={() => setSelectedColor(index)}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>

//         <Button 
//           className="h-16 w-full bg-purple-700 duration-300 hover:bg-purple-800"
//           onClick={saveChanges}
//         >
//           Save Changes
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default Profile;

