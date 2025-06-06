import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Shield, 
  Users, 
  CheckCircle, 
  Clock,
  Smartphone,
  ArrowRight,
  BookOpen,
  MapPin,
  Phone
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">VERITAS</h1>
                <p className="text-xs text-gray-500">Exeat System</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
        </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                  Modern <span className="text-blue-600">Student</span> Exeat Management
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Streamline student permissions with our digital exeat system. 
                  Secure, efficient, and designed for Veritas University.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link 
                  to="/register?role=student" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Student Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
          
                <Link 
                  to="/register?role=staff" 
                  className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-2 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <Shield className="w-5 h-5" />
                  <span>Staff Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Quick Access Buttons */}
              <div className="pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">Quick Access</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link 
                    to="/login?role=parent" 
                    className="flex flex-col items-center p-4 bg-white rounded-lg border hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <Users className="w-6 h-6 text-gray-600 group-hover:text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Parent</span>
                  </Link>
                  
                  <Link 
                    to="/login?role=dean" 
                    className="flex flex-col items-center p-4 bg-white rounded-lg border hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <BookOpen className="w-6 h-6 text-gray-600 group-hover:text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Dean</span>
            </Link>
            
                  <Link 
                    to="/login?role=security" 
                    className="flex flex-col items-center p-4 bg-white rounded-lg border hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <Shield className="w-6 h-6 text-gray-600 group-hover:text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Security</span>
            </Link>
            
                  <Link 
                    to="/login?role=staff" 
                    className="flex flex-col items-center p-4 bg-white rounded-lg border hover:border-blue-200 hover:shadow-md transition-all group"
                  >
                    <Users className="w-6 h-6 text-gray-600 group-hover:text-blue-600 mb-2" />
                    <span className="text-sm font-medium text-gray-700">Staff</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Illustration */}
            <div className="lg:order-last">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-3xl p-8 md:p-12">
                <div className="space-y-6">
                  {/* Mock Phone Interface */}
                  <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-auto">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <GraduationCap className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-gray-900">Exeat Request</span>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Home Visit</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">3 Days</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Emergency Contact</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-600">Approved</span>
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Smartphone className="w-6 h-6 text-gray-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Features */}
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Digital Process</h3>
                    <p className="text-sm text-gray-600">From request to approval, everything is digital</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A streamlined approval process that involves students, parents, deans, and security
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                <GraduationCap className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">1. Student Request</h3>
              <p className="text-gray-600">
                Students submit exeat requests with destination, dates, and emergency contacts
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">2. Parent & Dean Approval</h3>
              <p className="text-gray-600">
                Parents receive email notifications and deans provide final academic approval
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">3. Security Check</h3>
              <p className="text-gray-600">
                QR codes enable easy check-in/check-out at campus security points
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Veritas University</h3>
                <p className="text-sm text-gray-400">Student Exeat System</p>
              </div>
            </div>
            <p className="text-sm text-gray-400">
              © 2024 Veritas University. All rights reserved.
            </p>
        </div>
      </div>
      </footer>
    </div>
  );
};

export default LandingPage; 