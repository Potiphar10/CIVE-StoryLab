/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Film, User, Mail, Lock, Sparkles, Building, AlertCircle } from 'lucide-react';

interface AuthProps {
  onAuthComplete: (user: any) => void;
  onBack: () => void;
}

export default function Auth({ onAuthComplete, onBack }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [instCode, setInstCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Simple password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { text: '', color: 'bg-slate-200' };
    if (password.length < 6) return { text: 'Weak (min 6 chars)', color: 'bg-red-400' };
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    if (hasLetters && hasNumbers) return { text: 'Strong', color: 'bg-green-500' };
    return { text: 'Medium (add numbers)', color: 'bg-yellow-400' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (!isLogin && !fullName) {
      setError('Full Name is required.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          instCode
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Authentication failed');
      }

      // Check if UDOM code is supplied, or email ends with udom.ac.tz
      const user = data.user;
      if (instCode.toLowerCase() === 'udom-coord' || email.toLowerCase().includes('coord@')) {
        user.role = 'coordinator';
        user.institution_id = 'inst-dodoma-1';
      } else if (email.toLowerCase().includes('student@') || instCode.toLowerCase() === 'udom-stud') {
        user.role = 'student';
        user.institution_id = 'inst-dodoma-1';
      }

      onAuthComplete(user);
    } catch (err: any) {
      setError(err.message || 'Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth_container" className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Branding header */}
        <div className="bg-[#0E2A5C] p-6 text-white text-center relative">
          <button onClick={onBack} className="absolute left-6 top-6 text-slate-300 hover:text-white text-xs">
            &larr; Back
          </button>
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Film className="w-6 h-6 text-[#0984FD]" />
          </div>
          <h2 className="text-xl font-bold">CIVE StoryLab Workspace</h2>
          <p className="text-xs text-slate-300 mt-1">AI-Orchestrated Film Pre-production Platform</p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 text-sm font-semibold text-slate-500">
          <button
            id="tab_auth_login"
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${isLogin ? 'text-[#0E2A5C] border-[#0E2A5C] bg-slate-50/50' : 'border-transparent hover:text-slate-800'}`}
          >
            Sign In
          </button>
          <button
            id="tab_auth_register"
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-3 text-center border-b-2 transition-all ${!isLogin ? 'text-[#0E2A5C] border-[#0E2A5C] bg-slate-50/50' : 'border-transparent hover:text-slate-800'}`}
          >
            Create Account
          </button>
        </div>

        {/* Main form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-start space-x-2 text-xs text-red-700 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Email field */}
          <div className="space-y-1">
            <label htmlFor="auth_email" className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
              Academic or Business Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                id="auth_email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@udom.ac.tz or personal@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0984FD] focus:border-transparent transition-all"
              />
            </div>
            {email.toLowerCase().includes('udom.ac.tz') && (
              <p className="text-[10px] text-[#0984FD] font-semibold flex items-center space-x-1 mt-1">
                <Sparkles className="w-3 h-3" />
                <span>University of Dodoma member detected. Campus license will apply.</span>
              </p>
            )}
          </div>

          {/* Full Name field (Register only) */}
          {!isLogin && (
            <div className="space-y-1">
              <label htmlFor="auth_fullname" className="text-xs font-bold text-slate-500 block uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  id="auth_fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Amina Mrema"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0984FD] focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {/* Password field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label htmlFor="auth_password" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Password
              </label>
              {isLogin && (
                <button type="button" onClick={() => alert('Mock password reset code requested. Password is pre-set.')} className="text-[11px] text-[#0984FD] hover:underline font-semibold">
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                id="auth_password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0984FD] focus:border-transparent transition-all"
              />
            </div>
            {!isLogin && password && (
              <div className="flex items-center justify-between text-[10px] mt-1 text-slate-500">
                <span>Strength: <strong className="text-slate-800">{strength.text}</strong></span>
                <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color}`} style={{ width: strength.text === 'Strong' ? '100%' : strength.text === 'Medium (add numbers)' ? '60%' : '30%' }}></div>
                </div>
              </div>
            )}
          </div>

          {/* Institution Code (optional) */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label htmlFor="auth_inst" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                <Building className="w-3.5 h-3.5 mt-0.5 text-slate-400" />
                <span>Institution Code (Optional)</span>
              </label>
              <span className="text-[10px] text-slate-400">e.g. udom-coord</span>
            </div>
            <input
              id="auth_inst"
              type="text"
              value={instCode}
              onChange={(e) => setInstCode(e.target.value)}
              placeholder="Enter department clearance code"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#0984FD] focus:border-transparent transition-all"
            />
          </div>

          {/* Submit button */}
          <button
            id="btn_auth_submit"
            type="submit"
            disabled={loading}
            className="w-full bg-[#0E2A5C] hover:bg-[#0984FD] disabled:bg-slate-400 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all text-sm mt-3 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isLogin ? 'Sign In to Studio' : 'Create Student Portfolio'}</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Tip */}
        <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-[11px] text-slate-500 text-center space-y-1">
          <p><strong>Coordinator login:</strong> Use <code className="bg-slate-200 px-1 rounded text-slate-700">coord@udom.ac.tz</code> to view aggregate tracking dashboards</p>
          <p><strong>Student login:</strong> Use <code className="bg-slate-200 px-1 rounded text-slate-700">student@udom.ac.tz</code> to create personal projects</p>
        </div>
      </div>
    </div>
  );
}
