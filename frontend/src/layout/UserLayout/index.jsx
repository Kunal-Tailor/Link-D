import NavBarComponent from '@/Components/Navbar'
import React from 'react'

function UserLayout({children}) {
  return (
    <div>
        <NavBarComponent />
      {/* <h1>User Layout</h1> */}
      {children}
    </div>
  )
}

export default UserLayout