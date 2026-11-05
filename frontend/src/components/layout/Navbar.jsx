import React, { useState } from 'react'
import SideMenu from './SideMenu';
import {HiOutlineX,HiOutlineMenu} from 'react-icons/hi'


const Navbar = ({activeMenu}) => {
  const [openSideMenu, setopenSideMenu] = useState(false);
  return (
    <div className='flex bg-white border border-b border-gray-200/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30'>

      <button
      className='block lg:hidden text-black'
      onClick={()=>{
        setopenSideMenu(!openSideMenu);
      }}
      >
        {openSideMenu?(
          <HiOutlineX className=''/>
        ):(
          <HiOutlineMenu className=''/>
        )}
      </button>
      <h2 className='text-lg font-medium text-black'>Expense Tracker</h2>

      {openSideMenu && (
        <div className='fixed top-[61px] -ml-4 bg-white'>
          <SideMenu activeMenu={activeMenu}/>

        </div>
      )}
      
    </div>
  )
}

export default Navbar
