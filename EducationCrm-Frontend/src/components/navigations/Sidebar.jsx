import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, BookOpen, Users, UserCheck, GraduationCap, Settings, BarChart3, Calendar, MessageSquare, FileText, Award, User, LogOut, Menu, X, ChevronDown, Bell, Search, Plus } from "lucide-react";
import useResponsive from "../../core/hooks/useResponsive";

// Mock responsive hook - replace with your actual hook

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [userRole, setUserRole] = useState("student"); // Change this to test different roles
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Role-based sidebar options
  const getSidebarOptions = (role) => {
    const baseOptions = [{ name: "Dashboard", icon: LayoutDashboard, route: "/dashboard" }];

    const roleOptions = {
      student: [
        ...baseOptions,
        { name: "My Courses", icon: BookOpen, route: "/courses" },
        { name: "Assignments", icon: FileText, route: "/assignments" },
        { name: "Grades", icon: Award, route: "/grades" },
        { name: "Schedule", icon: Calendar, route: "/schedule" },
        { name: "Messages", icon: MessageSquare, route: "/messages" },
        { name: "Profile", icon: User, route: "/profile" },
      ],
      lecturer: [
        ...baseOptions,
        { name: "My Courses", icon: BookOpen, route: "/courses" },
        { name: "Students", icon: Users, route: "/students" },
        { name: "Assignments", icon: FileText, route: "/assignments" },
        { name: "Grading", icon: Award, route: "/grading" },
        { name: "Analytics", icon: BarChart3, route: "/analytics" },
        { name: "Schedule", icon: Calendar, route: "/schedule" },
        { name: "Messages", icon: MessageSquare, route: "/messages" },
        { name: "Profile", icon: User, route: "/profile" },
      ],
      admin: [
        ...baseOptions,
        { name: "User Management", icon: Users, route: "/users" },
        { name: "Course Management", icon: BookOpen, route: "/course-management" },
        { name: "Lecturer Management", icon: UserCheck, route: "/lecturers" },
        { name: "Student Management", icon: GraduationCap, route: "/students" },
        { name: "Analytics & Reports", icon: BarChart3, route: "/reports" },
        { name: "System Settings", icon: Settings, route: "/settings" },
        { name: "Notifications", icon: Bell, route: "/notifications" },
        { name: "Profile", icon: User, route: "/profile" },
      ],
    };

    return roleOptions[role] || roleOptions.student;
  };

  const sidebarOptions = getSidebarOptions(userRole);

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: isMobile ? "-100%" : isTablet ? "-80px" : "0",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      opacity: isDesktop ? 1 : 0,
      x: isDesktop ? 0 : -20,
    },
  };

  const logoVariants = {
    open: {
      scale: 1,
      opacity: 1,
    },
    closed: {
      scale: isDesktop ? 0.8 : 1,
      opacity: isDesktop ? 0.8 : 1,
    },
  };

  const getRoleColor = (role) => {
    const colors = {
      student: "from-blue-500 to-purple-600",
      lecturer: "from-green-500 to-blue-600",
      admin: "from-purple-500 to-red-600",
    };
    return colors[role] || colors.student;
  };

  const getRoleTitle = (role) => {
    const titles = {
      student: "Student Portal",
      lecturer: "Lecturer Dashboard",
      admin: "Admin Panel",
    };
    return titles[role] || titles.student;
  };

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <motion.button onClick={() => setIsOpen(!isOpen)} className="fixed top-4 left-4 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl shadow-lg" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <X size={20} />
              </motion.div>
            ) : (
              <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Menu size={20} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      )}

      {/* Sidebar */}
      <motion.div
        variants={sidebarVariants}
        animate={isOpen || !isMobile ? "open" : "closed"}
        className={`
          fixed left-0 top-0 h-full bg-white shadow-2xl z-40 flex flex-col
          ${isMobile ? "w-80" : isTablet ? "w-20 hover:w-80" : "w-80"}
          transition-all duration-300 ease-in-out group
        `}
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Header */}
        <motion.div className="p-6 border-b border-gray-100" variants={logoVariants}>
          <div className="flex items-center space-x-3">
            <motion.div className={`w-10 h-10 bg-gradient-to-r ${getRoleColor(userRole)} rounded-xl flex items-center justify-center shadow-lg`} whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: "spring", stiffness: 300 }}>
              <div className="w-5 h-5 bg-white rounded-sm"></div>
            </motion.div>
            <AnimatePresence>
              {(isOpen || !isMobile) && (
                <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className={`${isTablet && !isOpen ? "group-hover:block hidden" : ""}`}>
                  <h1 className="text-xl font-bold text-gray-900">Excelmiind</h1>
                  <p className="text-sm text-gray-500">{getRoleTitle(userRole)}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Role Switcher (for demo purposes) */}
          <AnimatePresence>
            {(isOpen || !isMobile) && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`mt-4 ${isTablet && !isOpen ? "group-hover:block hidden" : ""}`}>
                <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Admin</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <motion.div className="space-y-2 px-4" initial="closed" animate={isOpen || !isMobile ? "open" : "closed"}>
            {sidebarOptions.map((item, index) => {
              const IconComponent = item.icon;
              const isActive = activeItem === item.name;

              return (
                <motion.div key={item.name} variants={itemVariants} custom={index} transition={{ delay: index * 0.1 }} whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }}>
                  <button
                    onClick={() => setActiveItem(item.name)}
                    className={`
                      w-full flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200
                      ${isActive ? `bg-gradient-to-r ${getRoleColor(userRole)} text-white shadow-lg` : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}
                      ${isTablet && !isOpen ? "justify-center group-hover:justify-start" : ""}
                    `}
                  >
                    <IconComponent size={20} className={`${isActive ? "text-white" : "text-gray-500"} flex-shrink-0`} />
                    <AnimatePresence>
                      {(isOpen || !isMobile || (isTablet && !isOpen)) && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          className={`
                            font-medium whitespace-nowrap
                            ${isTablet && !isOpen ? "group-hover:block hidden" : ""}
                          `}
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    {isActive && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto w-2 h-2 bg-white rounded-full" />}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div className="p-4 border-t border-gray-100" variants={itemVariants}>
          <motion.button whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }} className="w-full flex items-center space-x-4 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200">
            <LogOut size={20} className="text-gray-500 flex-shrink-0" />
            <AnimatePresence>
              {(isOpen || !isMobile) && (
                <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "auto" }} exit={{ opacity: 0, width: 0 }} className={`font-medium whitespace-nowrap ${isTablet && !isOpen ? "group-hover:block hidden" : ""}`}>
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Overlay for mobile */}
      <AnimatePresence>{isMobile && isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-30" />}</AnimatePresence>
    </>
  );
};

export default Sidebar;
