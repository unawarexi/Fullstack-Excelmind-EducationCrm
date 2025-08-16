import React from 'react'
import Sidebar from '../components/navigations/Sidebar'

const AdminLayout = ({children}) => {
  return (
      <div>
          <Sidebar />
          <navbar />
         {children}
    </div>
  )
}

export default AdminLayout
