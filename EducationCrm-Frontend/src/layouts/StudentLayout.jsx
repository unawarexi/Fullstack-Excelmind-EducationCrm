import React from "react";
import Sidebar from "../components/navigations/Sidebar";

const StudentLayout = ({ children }) => {
  return (
    <div>
      <Sidebar />
      <navbar />
      {children}
    </div>
  );
};

export default StudentLayout;
