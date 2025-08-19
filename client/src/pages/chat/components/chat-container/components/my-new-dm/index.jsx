import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@radix-ui/react-tooltip";
import { FaPlus } from "react-icons/fa";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
} from "@/components/ui/dialog";
import { animationDefaultOption } from "@/lib/utils";
import Lottie from "react-lottie";
import apiClient from "@/lib/api-client";
import { CONTACT_ROUTES } from "@/utills/constants";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store";

const NewDm = () => {
  const {setSelectedChatType,   setSelectedChatData} = useAppStore()
  const [openNewContactModal, setOpenNewContactModal] = useState(false);
  const [searchedContacts, setSearchedContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchContacts = async (term) => {
    try {
      if (term.trim().length > 0) {
        setIsLoading(true);
        const response = await apiClient.get(`${CONTACT_ROUTES}/search?q=${term}`, { 
          withCredentials: true 
        });
        
        if (response.status === 200) {
          setSearchedContacts(response.data.data || []);
        }
      } else {
        setSearchedContacts([]);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setSearchedContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (image.startsWith('http')) return image;
    return `${import.meta.env.VITE_SERVER_URL}/${image}`;
  };

  const shouldShowEmptyState = !isLoading && searchedContacts.length === 0;


  const selectNewContact = (contact) => {
    setOpenNewContactModal(false)
    setSelectedChatType("contact")
    setSelectedChatData(contact)
    setSearchedContacts([])
  }
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              className="text-neutral-400 font-light text-opacity-90 hover:text-neutral-100 cursor-pointer transition-all duration-300"
              onClick={() => setOpenNewContactModal(true)}
            >
              <FaPlus />
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
            <p>Select New contact</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog open={openNewContactModal} onOpenChange={setOpenNewContactModal}>
        <DialogContent className="max-w-[425px] bg-[#1b1c24] border-none">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Contact</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Search for users to start a new conversation
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <input 
              type="text" 
              placeholder="Search by username or email"
              className="w-full p-2 rounded bg-[#2a2b33] text-white placeholder-neutral-500"
              onChange={(e) => searchContacts(e.target.value)}
            />
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : searchedContacts.length > 0 ? (
              <ScrollArea className="h-[300px] mt-4">
                <div className="flex flex-col gap-3">
                  {searchedContacts.map(contact => (
                    <div key={contact._id} className="flex gap-3 items-center cursor-pointer p-3 hover:bg-[#2a2b33] rounded"  onClick={() => selectNewContact(contact)}>
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
                              contact.color || 0
                            )}`}
                          >
                            {contact.firstName
                              ? contact.firstName.charAt(0)
                              : contact.email.charAt(0)}
                          </div>
                        )}
                      </Avatar>
                      <div className="text-white">
                        <p className="font-medium text-sm">
                          {contact.firstName
                            ? `${contact.firstName} ${contact.lastName}`
                            : contact.email}
                        </p>
                        <p className="text-xs text-gray-400">
                          {contact.status || "Online"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : shouldShowEmptyState ? (
              <div className="flex-1 md:bg-[#1c1d25] mt-5 md:flex flex-col justify-center items-center duration-1000 transition-all">
                <Lottie
                  isClickToPauseDisabled={true}
                  height={100}
                  width={100}
                  options={animationDefaultOption}
                />
                <div className="text-opacity-80 text-white flex flex-col gap-5 items mt-5 lg:text-2xl text-xl transition-all duration-300 text-center">
                  <h3 className="poppins-medium">
                    Search for a <span className="text-blue-500">Bubble</span> user
                  </h3>
                </div>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewDm;
