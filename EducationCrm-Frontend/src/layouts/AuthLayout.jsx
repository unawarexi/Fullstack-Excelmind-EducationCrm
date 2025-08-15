import React from "react";
import { motion } from "framer-motion";


const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Left Side - Form */}
      <motion.div className="w-full lg:w-1/2 flex items-center justify-center p-8" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <motion.div className="mb-12" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
              <span className="text-2xl font-bold text-gray-900">Excelmiind</span>
            </div>
          </motion.div>

          {/* Form Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
            {children}
          </motion.div>

          {/* Footer */}
          <motion.div className="mt-16 text-center text-sm text-gray-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }}>
            <p>Copyright © 2025 Excelmiind Education LTD.</p>
            <a href="#" className="text-blue-600 hover:text-blue-700 transition-colors">
              Privacy Policy
            </a>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Hero Section */}
      <motion.div className="hidden rounded-tl-[4rem] rounded-bl-[4rem] lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 items-center justify-center p-12" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
        <div className="text-center text-white max-w-lg">
          <motion.h1 className="text-4xl font-bold mb-6 leading-tight" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}>
            Effortlessly manage your students and learning operations.
          </motion.h1>

          <motion.p className="text-xl text-blue-100 mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}>
            Log in to access your education dashboard and manage your institution.
          </motion.p>

          {/* Dashboard Preview */}
          <motion.div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl" initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.7, ease: "easeOut" }} whileHover={{ scale: 1.02, y: -5 }}>
            {/* Dashboard Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex space-x-4">
                <div className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium">Student Progress</div>
                <div className="text-white/70 px-3 py-2 text-sm">Course Analytics</div>
                <div className="text-white/70 px-3 py-2 text-sm">Learning Overview</div>
              </div>
              <div className="text-white/70 text-sm">Monthly</div>
            </div>

            {/* Education Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <div className="text-white text-2xl font-bold">2,847</div>
                <div className="text-blue-200 text-sm">Active Students</div>
              </div>
              <div>
                <div className="text-white text-2xl font-bold">94.2%</div>
                <div className="text-blue-200 text-sm">Completion Rate</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-white text-2xl font-bold">156</div>
              <div className="text-blue-200 text-sm">Courses Available</div>
              <div className="mt-2 flex items-center space-x-2">
                <div className="w-12 h-1 bg-green-400 rounded"></div>
                <div className="text-green-300 text-xs">+12.8%</div>
                <div className="text-white/50 text-xs">this month</div>
              </div>
            </div>

            {/* Chart Area */}
            <div className="mb-6">
              <div className="h-16 bg-white/5 rounded-lg flex items-end justify-center space-x-1 p-2">
                {[40, 65, 45, 80, 55, 90, 70, 85].map((height, index) => (
                  <motion.div key={index} className="bg-gradient-to-t from-blue-400 to-purple-400 rounded-sm" style={{ width: "8px", height: `${height}%` }} initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }} />
                ))}
              </div>
            </div>

            {/* Student Enrollments Circle */}
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-medium">Course Enrollments</div>
                <div className="text-blue-200 text-sm mt-1">Recent activities</div>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <div className="text-white text-xs font-bold">
                    1,482
                    <br />
                    Students
                  </div>
                </div>
              </div>
            </div>

            {/* Course Enrollment List */}
            <div className="mt-4 space-y-2">
              {[
                { id: "CS-101-24", course: "Introduction to Computer Science", date: "February 2025", students: "89 students" },
                { id: "MATH-205-24", course: "Advanced Mathematics", date: "13 February 2025", students: "67 students" },
                { id: "ENG-150-24", course: "Academic Writing Skills", date: "13 February 2025", students: "124 students" },
              ].map((enrollment, index) => (
                <motion.div key={enrollment.id} className="flex justify-between items-center py-2 px-3 bg-white/5 rounded-lg" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 + index * 0.1, duration: 0.4 }}>
                  <div>
                    <div className="text-white text-sm font-medium">{enrollment.course}</div>
                    <div className="text-blue-200 text-xs">{enrollment.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm font-medium">{enrollment.students}</div>
                    <div className="text-blue-200 text-xs">{enrollment.date}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;