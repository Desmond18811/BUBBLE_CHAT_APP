import Background from '@/assets/login2.png';
import Victory from '@/assets/victory.svg';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useState } from 'react';
import { toast } from 'sonner';
import apiClient from "@/lib/api-client"
import { LOGIN, SIGNUP } from '@/utills/constants';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';

const Auth = () => {
 const navigate = useNavigate()
 const {setUserInfo} = useAppStore()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("")
  
const validateSignUp = () =>{
  if(!email.length){
    toast.error("Email is required")
    return false
  }
  if(!password.length){
    toast.error("Password is required")
    return false
  }
  if(password !== confirmPassword){
    toast.error("Passwords do not match")
    return false
  }
  return true
}

const validateLogin = () =>{
  if(!email.length){
    toast.error("Email is required")
    return false
  }
  if(!password.length){
    toast.error("Password is required")
    return false
  }
  return true
}

const handleLogin = async () => {
    if (validateLogin()) {
      try {
        const response = await apiClient.post(LOGIN, { email, password }, { withCredentials: true });
        console.log({ response });

       if(response.data.user.id){
        setUserInfo(response.data.user)
        if(response.data.user.profileSetup) navigate('/chat')
        else 
          navigate("/profile")
       }
      } catch (error) {
        toast.error(error.response?.data?.error || "Login failed");
      }
    }
  };
 
  const handleSignUp = async () => {
    if (validateSignUp()) {
      try {
        const response = await apiClient.post(
          SIGNUP,
          { email, password },
          { withCredentials: true }
        );
        console.log({ response });

        if (response.status === 201) {
          setUserInfo(response.data.user)
          navigate("/profile"); 
        }
      } catch (error) {
        toast.error(error.response?.data?.error || "Signup failed");
      }
    }
  };

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center p-4">
      <div className="h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-full max-w-[1800px] rounded-3xl grid lg:grid-cols-2">
        {/* Left Column - Form */}
        <div className="flex flex-col items-center justify-center p-6 overflow-auto">
          <div className="w-full max-w-md flex flex-col items-center">
            <div className="flex items-center justify-center mb-6">
              <h1 className="text-5xl font-bold md:text-6xl mr-2">Welcome</h1>
              <img 
                src={Victory} 
                alt="Victory Emoji" 
                className="h-[80px] w-[80px] md:h-[100px] md:w-[100px]" 
              />
            </div>
            <p className="font-medium text-center mb-8">
              Fill in the details to get started with the best chat app!
            </p>
            
            <Tabs className="w-full" defaultValue='login'>
              <TabsList className="bg-transparent rounded-none w-full mb-8">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:border-b-purple-500
                  text-black text-opacity-90 border-b-2 rounded-none
                  w-full data-[state=active]:text-black 
                  data-[state=active]:font-semibold data-[state=active]
                  :border-b-purple-500 p-3 transition-all duration-300">
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:border-b-purple-500
                  text-black text-opacity-90 border-b-2 rounded-none
                  w-full data-[state=active]:text-black 
                  data-[state=active]:font-semibold data-[state=active]
                  :border-b-purple-500 p-3 transition-all duration-300">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent className="flex flex-col gap-5 w-full" value="login">
                <Input 
                  placeholder="Email" 
                  type="email" 
                  className="rounded-full p-6"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input 
                  placeholder="Password" 
                  type="password" 
                  className="rounded-full p-6"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button className="rounded-full p-6 mt-4" onClick={handleLogin}>
                  Login
                </Button>
              </TabsContent>
              
              <TabsContent className="flex flex-col gap-5 w-full" value="signup">
                <Input 
                  placeholder="Email" 
                  type="email" 
                  className="rounded-full p-6"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input 
                  placeholder="Password" 
                  type="password" 
                  className="rounded-full p-6"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  placeholder="Confirm Password" 
                  type="password" 
                  className="rounded-full p-6"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button className="rounded-full p-6 mt-4" onClick={handleSignUp}>
                  Sign Up
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Column - Background Image */}
        <div className="hidden lg:flex justify-center items-center overflow-hidden">
          <img 
            src={Background} 
            alt="background-login" 
            className="h-[440px]" 
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;

