import React, { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Auth from './pages/auth'
import Profile from './pages/profile'
import Chat from './pages/chat'
import { useAppStore } from './store'
import apiClient from './lib/api-client'
import { GET_USER_INFO } from './utills/constants'

const PrivateRoute = ({ children }) => {
  const { userInfo } = useAppStore()
  return userInfo ? children : <Navigate to="/auth" />
}

const AuthRoute = ({ children }) => {
  const { userInfo } = useAppStore()
  return userInfo ? <Navigate to="/chat" /> : children
}

function App() {
  const { userInfo, setUserInfo } = useAppStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
 const getUserData = async () => {
  try {
    const response = await apiClient.get(GET_USER_INFO, {
      withCredentials: true
    });

    if (response.data?.user?.id) { // Check for nested user object
      setUserInfo(response.data.user);
    } else if (response.data?.id) { // Check for flat structure
      setUserInfo(response.data);
    } else {
      setUserInfo(undefined);
    }
  } catch (error) {
    console.log(error);
    setUserInfo(undefined);
  } finally {
    setLoading(false);
  }
};

    if (!userInfo) {
      getUserData()
    } else {
      setLoading(false)
    }
  }, [userInfo, setUserInfo])

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <Auth />
            </AuthRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
       <Route
  path="/profile"
  element={
    <PrivateRoute>
      <Profile />
    </PrivateRoute>
  }
/>
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
