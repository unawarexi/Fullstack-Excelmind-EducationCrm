import React from "react";
import Sidebar from "../components/navigations/Sidebar";

const LecturerLayout = ({ children }) => {
  return (
    <div>
      <Sidebar />
      <navbar />
      {children}
    </div>
  );
};

export default LecturerLayout;
