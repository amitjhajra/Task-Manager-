import React from 'react'
import { useUserAuth } from '../../hooks/useUserAuth'

const UserDashboard = () => {
  useUserAuth();
  return (
    <div>
      User dashBoard
    </div>
  )
}

export default UserDashboard
