import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiCreditCard, FiBriefcase, FiChevronLeft, FiChevronDown } from 'react-icons/fi';
import { PiBuildingOfficeLight } from "react-icons/pi";
import img from "./b.avif"
import StarBackground from '../components/StarBackground';
import "../css/login.css";


const API_URL = process.env.REACT_APP_API_URL;

// Message Box Component
const MessageBox = ({ message, type }) => {
  if (!message) return null;
  const baseClasses = "absolute top-4 left-1/2 -translate-x-1/2 p-4 rounded-lg shadow-lg z-50 text-center text-sm font-medium";
  const typeClasses = { success: "bg-green-500 text-white", error: "bg-red-500 text-white" };
  return <div className={`${baseClasses} ${typeClasses[type]}`}>{message}</div>;
};

// Input Component
const IconInput = ({ label, type, placeholder, icon: Icon, value, onChange, name, error }) => (
  <div>
    <label className="text-gray-200 text-sm mb-1 block">{label}</label>
    <div className="relative flex items-center">
      <span className="absolute left-3 text-gray-400"><Icon size={18} /></span>
      <input
        className="w-full rounded bg-white/90 border border-gray-300 pl-10 pr-3 py-2 text-black focus:ring-2 focus:ring-blue-400 outline-none transition-shadow"
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
      />
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// Select Field Component
const SelectField = ({ label, options, value, onChange, name, error }) => (
  <div>
    <label className="text-gray-200 text-sm mb-1 block">{label}</label>
    <div className="relative">
      <select 
        className="w-full rounded bg-white/90 border border-gray-300 p-2 text-black focus:ring-2 focus:ring-blue-400 outline-none appearance-none"
        value={value}
        onChange={onChange}
        name={name}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
        <FiChevronDown size={18} />
      </span>
    </div>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

// Submit Button Component
const SubmitButton = ({ text, onClick, isLoading }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={isLoading}
    className={`p-2 rounded-xl text-white w-full transition-all duration-300 font-bold shadow-lg mt-2 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#f9a8a8] via-[#fcd48d] via-[#f9f871] via-[#8ce3a3] to-[#6dd5ed] hover:shadow-xl'}`}
  >
    {isLoading ? 'Loading...' : text}
  </button>
);

const App = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    full_name: '', username: '', email: '', password: '', confirm_password: '', role: '',
    business_name: '', business_type: '', contact_number: '', gst_tax_id: '', business_address: '', department_branch: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const showMessage = (text, type = 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const validateStep1 = () => {
    const errors = {};
    if (!formData.full_name.trim()) errors.full_name = "Full name is required";
    if (!formData.username.trim()) errors.username = "Username is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Invalid email";
    if (!formData.password) errors.password = "Password is required";
    else {
      if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";
      if (!/[A-Z]/.test(formData.password)) errors.password = "Password must include 1 uppercase";
      if (!/\d/.test(formData.password)) errors.password = "Password must include 1 number";
    }
    if (!formData.confirm_password) errors.confirm_password = "Confirm password is required";
    else if (formData.password !== formData.confirm_password) errors.confirm_password = "Passwords do not match";
    if (!formData.role) errors.role = "Role is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!formData.business_name.trim()) errors.business_name = "Business name is required";
    if (!formData.business_type.trim()) errors.business_type = "Business type is required";
    if (!formData.contact_number.trim()) errors.contact_number = "Contact number is required";
    if (!formData.business_address.trim()) errors.business_address = "Business address is required";
    if (!formData.department_branch.trim()) errors.department_branch = "Department / Branch is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => { if (validateStep1()) setStep(2); };
  const prevStep = () => setStep(1);

  const handleSignup = async () => {
    if (!validateStep1()) { setStep(1); return; }
    if (!validateStep2()) { setStep(2); return; }

    setIsLoading(true); setFieldErrors({});
    try {
      const res = await axios.post(`${API_URL}/signup/`, formData);
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      localStorage.setItem('username', res.data.username);
      showMessage(res.data.message, 'success');
      setTimeout(() => window.location.href = '/dashboard', 500);
    } catch (err) {
      const backendData = err.response?.data || {};
      if (backendData.errors) setFieldErrors(backendData.errors);
      showMessage(backendData.message || 'Signup failed', 'error');
    } finally { setIsLoading(false); }
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) { showMessage('Enter both username & password'); return; }
    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/login/`, {
        username: formData.username,
        password: formData.password,
      });
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      localStorage.setItem('username', res.data.username);
      showMessage('Login successful!', 'success');
      setTimeout(() => window.location.href = '/dashboard', 500);
    } catch (err) {
      showMessage(err.response?.data?.message || 'Login failed', 'error');
    } finally { setIsLoading(false); }
  };

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (localStorage.getItem('access_token')) window.location.href = '/dashboard';
  }, []);

  return (
    <>
      <MessageBox message={message.text} type={message.type} />
      <section className="text-white w-full min-h-screen flex flex-col gap-12 items-center justify-center p-4 py-10 relative overflow-x-hidden font-sans">
        <h1 className='text-[13dvh] text-center font-bold text-gray-500'>Track In</h1>
        <StarBackground />
        <div className="bg-gradient-to-br from-white/5 to-white/1 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl w-full max-w-6xl p-6 sm:p-8 flex items-center justify-center z-10 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-8 w-full relative">

            {/* Login */}
            <div className={`flex flex-col sm:flex-row items-center gap-8 w-full form-container overflow-y-hidden ${isLogin ? 'opacity-100 relative' : 'opacity-0 absolute translate-x-full'}`}>
              <div className="w-full sm:w-1/2">
                <div className='flex'>
                  <h1 className="text-4xl font-bold text-gray-100 mb-6">Login</h1>
                  <a className='text-gray-700 absolute right-0' href='/'>Home</a>
                </div>
                <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
                  <IconInput label="Username" type="text" icon={FiUser} name="username" value={formData.username} onChange={handleChange} error={fieldErrors.username}/>
                  <IconInput label="Password" type="password" icon={FiLock} name="password" value={formData.password} onChange={handleChange} error={fieldErrors.password}/>
                  <SubmitButton text="Login" onClick={handleLogin} isLoading={isLoading}/>
                  <p className="text-gray-300 text-sm text-center">
                    Don’t have an account?{' '}
                    <span onClick={() => { setIsLogin(false); setFieldErrors({}); }} className="text-red-400 font-medium underline cursor-pointer hover:text-red-300 transition">Signup</span>
                  </p>
                </form>
              </div>
              <div className="flex justify-center sm:w-1/2">
                <img src={img} alt="Login Illustration" className="h-48 sm:h-64 object-contain image-float"/>
              </div>
            </div>

            {/* Signup */}
            <div className={`flex flex-col sm:flex-row items-center gap-8 w-full form-container ${!isLogin ? 'opacity-100 relative' : 'opacity-0 absolute -translate-x-full'}`}>
              <div className="flex justify-center sm:w-1/2 order-1 sm:order-none">
                <img src={img} alt="Signup Illustration" className="h-48 sm:h-64 object-contain image-float"/>
              </div>
              <div className="w-full sm:w-1/2 overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between">
                  <div className='flex'>
                    <h1 className="text-4xl font-bold text-gray-100 mb-6">Signup</h1>
                    <a className='text-gray-700 absolute right-0' href='/'>Home</a>
                  </div>
                  {!isLogin && step > 1 && <button onClick={prevStep} className="text-gray-400 hover:text-blue-400 transition-colors mb-6"><FiChevronLeft size={24}/></button>}
                </div>
                <div className="flex justify-between items-center mb-6">
                  <div className="w-full h-2 bg-gray-700 rounded-full">
                    <div className={`h-full bg-yellow-300 rounded-full transition-all duration-500 ${step===1?'w-1/2':'w-full'}`}></div>
                  </div>
                  <div className="ml-4 text-sm text-gray-400">Step {step} of 2</div>
                </div>

                <form className="flex flex-col gap-6" onSubmit={e => e.preventDefault()}>
                  {step===1 && <>
                    <h2 className="text-2xl font-semibold text-green-300 mb-4">Personal Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <IconInput label="Full Name" type="text" icon={FiUser} name="full_name" value={formData.full_name} onChange={handleChange} error={fieldErrors.full_name}/>
                      <IconInput label="Username" type="text" icon={FiUser} name="username" value={formData.username} onChange={handleChange} error={fieldErrors.username}/>
                      <IconInput label="Email" type="email" icon={FiMail} name="email" value={formData.email} onChange={handleChange} error={fieldErrors.email}/>
                      <IconInput label="Password" type="password" icon={FiLock} name="password" value={formData.password} onChange={handleChange} error={fieldErrors.password}/>
                      <IconInput label="Confirm Password" type="password" icon={FiLock} name="confirm_password" value={formData.confirm_password} onChange={handleChange} error={fieldErrors.confirm_password}/>
                      <SelectField label="Role" options={[{value:'',label:'Select Role'},{value:'admin',label:'Admin'}]} name="role" value={formData.role} onChange={handleChange} error={fieldErrors.role}/>
                    </div>
                    <SubmitButton text="Next Step" onClick={nextStep}/>
                  </>}
                  {step===2 && <>
                    <h2 className="text-2xl font-semibold text-green-300 mb-4">Business Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <IconInput label="Business Name" type="text" icon={PiBuildingOfficeLight} name="business_name" value={formData.business_name} onChange={handleChange} error={fieldErrors.business_name}/>
                      <IconInput label="Business Type" type="text" icon={FiBriefcase} name="business_type" value={formData.business_type} onChange={handleChange} error={fieldErrors.business_type}/>
                      <IconInput label="Contact Number" type="tel" icon={FiPhone} name="contact_number" value={formData.contact_number} onChange={handleChange} error={fieldErrors.contact_number}/>
                      <IconInput label="GST / Tax ID" type="text" icon={FiCreditCard} name="gst_tax_id" value={formData.gst_tax_id} onChange={handleChange} error={fieldErrors.gst_tax_id}/>
                      <div className="sm:col-span-2">
                        <IconInput label="Business Address" type="text" icon={FiMapPin} name="business_address" value={formData.business_address} onChange={handleChange} error={fieldErrors.business_address}/>
                      </div>
                      <div className="sm:col-span-2">
                        <SelectField label="Department / Branch" options={[
                          {value:'',label:'Select Department'},{value:'sales',label:'Sales'},
                          {value:'marketing',label:'Marketing'},{value:'hr',label:'Human Resources'},
                          {value:'it',label:'IT Department'},{value:'finance',label:'Finance'}
                        ]} name="department_branch" value={formData.department_branch} onChange={handleChange} error={fieldErrors.department_branch}/>
                      </div>
                    </div>
                    <SubmitButton text="Signup" onClick={handleSignup} isLoading={isLoading}/>
                  </>}
                  <p className="text-gray-300 text-sm text-center mt-4">
                    Already have an account?{' '}
                    <span onClick={() => { setIsLogin(true); setFieldErrors({}); }} className="text-red-400 font-medium underline cursor-pointer hover:text-red-300 transition">Login</span>
                  </p>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default App;
