import React from 'react'

import {BrowserRouter as Router , Routes, Route} from 'react-router-dom'
import Login from './pages/auth/Login'
import SignUp from './pages/auth/SignUp'

import Dashboard from './pages/admin/Dashboard'
import ManageTasks from './pages/admin/ManageTasks'
import CreateTask from './pages/admin/CreateTask'
import ManageUsers from './pages/admin/ManageUsers'
import UserDashboard from './pages/user/UserDashboard'
import MyTasks from './pages/user/MyTasks'
import PrivateRoute from './routes/PrivateRoute'
import ViewTaskDetails from './pages/user/ViewTaskDetails'


const App = () => {
  return (
    <div>
      
     <Router>

      <Routes>
        <Route path='/login' element={<Login/>}/>
        <Route path='/signUp' element={<SignUp/>}/>
        {/* Admin Routes  */}
        
        <Route element={<PrivateRoute allowedRoles={['admin']}/>}>
        <Route path='/admin/dashboard' element={<Dashboard/>}/>
        <Route path='/admin/tasks' element={<ManageTasks/>}/>
        <Route path='/admin/create-task' element={<CreateTask/>}/>
        <Route path='/admin/users' element={<ManageUsers/>}/>
        
        </Route>
        {/* User Routes  */}
        
        <Route element={<PrivateRoute allowedRoles={['user']}/>}>
        <Route path='/user/dashboard' element={<UserDashboard/>}/>
        <Route path='/user/tasks' element={<ManageTasks/>}/>
        <Route path='/user/tasks' element={<MyTasks/>}/>
        <Route path='/user/task-details/:id' element={<ViewTaskDetails/>}/>
        
        </Route>




      </Routes>
     </Router>
    </div>
  )
}

export default App
