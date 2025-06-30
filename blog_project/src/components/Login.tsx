import React, { useState } from 'react';
import { X, User, Lock, Eye, EyeOff, Mail, UserPlus, LogIn } from 'lucide-react';
import { useBlog } from '../contexts/BlogContext';
import { User as UserType, RegisterUser, LoginCredentials } from '../types';
import { Captcha } from './Captcha';
import { hashPassword, verifyPassword, generateId } from '../lib/crypto';

interface LoginProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'user' | 'admin';
}

export function Login({ isOpen, onClose, mode = 'user' }: LoginProps) {
  const { state, dispatch } = useBlog();
  const { currentTheme, users } = state;
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaValid, setCaptchaValid] = useState(false);

  const [loginForm, setLoginForm] = useState<LoginCredentials>({
    username: '',
    password: '',
    captcha: ''
  });

  const [registerForm, setRegisterForm] = useState<RegisterUser>({
    username: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    email: '',
    captcha: ''
  });

  const handleCaptchaChange = (value: string, isValid: boolean) => {
    setCaptchaValue(value);
    setCaptchaValid(isValid);
    
    if (activeTab === 'login') {
      setLoginForm(prev => ({ ...prev, captcha: value }));
    } else {
      setRegisterForm(prev => ({ ...prev, captcha: value }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!captchaValid) {
      setError('请完成人机验证');
      setIsLoading(false);
      return;
    }

    // 模拟登录延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 查找用户
    const user = users.find(u => 
      u.username === loginForm.username && u.isActive
    );

    if (user) {
      // 验证密码
      const isPasswordValid = await verifyPassword(loginForm.password, user.password);
      
      if (isPasswordValid) {
        // 检查权限
        if (mode === 'admin' && user.role !== 'admin') {
          setError('没有管理员权限');
        } else {
          dispatch({ type: 'LOGIN', payload: user });
          onClose();
          resetForms();
        }
      } else {
        setError('用户名或密码错误');
      }
    } else {
      setError('用户名或密码错误');
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!captchaValid) {
      setError('请完成人机验证');
      setIsLoading(false);
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('两次输入的密码不一致');
      setIsLoading(false);
      return;
    }

    if (registerForm.password.length < 6) {
      setError('密码长度至少6位');
      setIsLoading(false);
      return;
    }

    // 检查用户名是否已存在
    if (users.some(u => u.username === registerForm.username)) {
      setError('用户名已存在');
      setIsLoading(false);
      return;
    }

    // 检查邮箱是否已存在
    if (users.some(u => u.email === registerForm.email)) {
      setError('邮箱已被注册');
      setIsLoading(false);
      return;
    }

    // 模拟注册延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 哈希密码
    const hashedPassword = await hashPassword(registerForm.password);

    const newUser: UserType = {
      id: generateId(),
      username: registerForm.username,
      password: hashedPassword,
      displayName: registerForm.displayName || registerForm.username,
      email: registerForm.email,
      bio: '',
      role: 'user',
      createdAt: new Date().toISOString(),
      isActive: true
    };

    dispatch({ type: 'REGISTER_USER', payload: newUser });
    dispatch({ type: 'LOGIN', payload: newUser });
    onClose();
    resetForms();

    setIsLoading(false);
  };

  const resetForms = () => {
    setLoginForm({ username: '', password: '', captcha: '' });
    setRegisterForm({ 
      username: '', 
      password: '', 
      confirmPassword: '', 
      displayName: '', 
      email: '', 
      captcha: '' 
    });
    setCaptchaValue('');
    setCaptchaValid(false);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`relative w-full max-w-md rounded-xl shadow-2xl transition-all duration-300 ${
        currentTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* 关闭按钮 */}
        <button
          onClick={() => {
            onClose();
            resetForms();
          }}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            currentTheme === 'dark'
              ? 'text-gray-400 hover:text-white hover:bg-gray-700'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {/* 标题 */}
          <div className="text-center mb-6">
            <h2 className={`text-2xl font-bold mb-2 ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              {mode === 'admin' ? '站长登录' : '用户登录'}
            </h2>
            <p className={`text-sm ${
              currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {mode === 'admin' ? '请输入管理员账号密码' : '登录或注册账号以使用完整功能'}
            </p>
          </div>

          {/* 标签页 - 只在用户模式显示 */}
          {mode === 'user' && (
            <div className={`flex rounded-lg p-1 mb-6 ${
              currentTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <button
                onClick={() => setActiveTab('login')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'login'
                    ? currentTheme === 'dark'
                      ? 'bg-gray-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                    : currentTheme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <LogIn size={16} />
                登录
              </button>
              <button
                onClick={() => setActiveTab('register')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'register'
                    ? currentTheme === 'dark'
                      ? 'bg-gray-600 text-white'
                      : 'bg-white text-gray-800 shadow-sm'
                    : currentTheme === 'dark'
                      ? 'text-gray-300 hover:text-white'
                      : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <UserPlus size={16} />
                注册
              </button>
            </div>
          )}

          {/* 登录表单 */}
          {(mode === 'admin' || activeTab === 'login') && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* 用户名 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  用户名
                </label>
                <div className="relative">
                  <User size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      currentTheme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                    placeholder="请输入用户名"
                    required
                  />
                </div>
              </div>

              {/* 密码 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  密码
                </label>
                <div className="relative">
                  <Lock size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      currentTheme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                    placeholder="请输入密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      currentTheme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* 人机验证 */}
              <Captcha 
                onCaptchaChange={handleCaptchaChange}
                theme={currentTheme}
              />

              {/* 错误信息 */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {/* 登录按钮 */}
              <button
                type="submit"
                disabled={isLoading || !captchaValid}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                  isLoading || !captchaValid
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 transform hover:scale-[1.02]'
                } text-white`}
              >
                {isLoading ? '登录中...' : '登录'}
              </button>
            </form>
          )}

          {/* 注册表单 */}
          {mode === 'user' && activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* 用户名 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  用户名
                </label>
                <div className="relative">
                  <User size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      currentTheme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                    placeholder="设置用户名"
                    required
                  />
                </div>
              </div>

              {/* 显示名称 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  显示名称
                </label>
                <div className="relative">
                  <User size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    value={registerForm.displayName}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, displayName: e.target.value }))}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      currentTheme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                    placeholder="设置显示名称（可选）"
                  />
                </div>
              </div>

              {/* 邮箱 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  邮箱
                </label>
                <div className="relative">
                  <Mail size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      currentTheme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                    placeholder="请输入邮箱地址"
                    required
                  />
                </div>
              </div>

              {/* 密码 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  密码
                </label>
                <div className="relative">
                  <Lock size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      currentTheme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                    placeholder="设置密码（至少6位）"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      currentTheme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* 确认密码 */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  确认密码
                </label>
                <div className="relative">
                  <Lock size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className={`w-full pl-10 pr-12 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      currentTheme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-50 border-gray-300 text-gray-800 placeholder-gray-500'
                    }`}
                    placeholder="再次输入密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                      currentTheme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* 人机验证 */}
              <Captcha 
                onCaptchaChange={handleCaptchaChange}
                theme={currentTheme}
              />

              {/* 错误信息 */}
              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              {/* 注册按钮 */}
              <button
                type="submit"
                disabled={isLoading || !captchaValid}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
                  isLoading || !captchaValid
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 transform hover:scale-[1.02]'
                } text-white`}
              >
                {isLoading ? '注册中...' : '注册'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
