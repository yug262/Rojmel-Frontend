import '../css/navbar.css';
import { TiThMenu } from "react-icons/ti";
import { IoMdClose } from "react-icons/io";
import { useState, useEffect } from 'react';
import { useBusiness } from '../contexts/BusinessContext';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const { businesses, selected, setSelected, refresh } = useBusiness();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBiz, setNewBiz] = useState({
    business_name: '', business_type: '', contact_number: '',
    gst_tax_id: '', business_address: '', department_branch: '',
    copy_from_business: ''
  });
  const API_URL = process.env.REACT_APP_API_URL;

  // Toggle mobile menu
  const handleMenuToggle = () => setMenuOpen(!menuOpen);

  // Logout user
  const handleLogout = () => {
    const refresh = localStorage.getItem("refresh_token");
    fetch(`${API_URL}/logout/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refresh }),
    })
      .then(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("username");
        window.location.href = "/login";
      })
      .catch(err => console.error("Logout error:", err));
  };

  // Create new business
  const createBusiness = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/businesses/add/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newBiz),
      });
      if (!res.ok) {
        alert('Failed to create business');
        return;
      }
      setShowAddModal(false);
      setNewBiz({
        business_name: '', business_type: '', contact_number: '',
        gst_tax_id: '', business_address: '', department_branch: '',
        copy_from_business: ''
      });
      await refresh();
    } catch (e) {
      console.error('Failed to create business', e);
      alert('Failed to create business');
    }
  };

  // Lock scroll when menu open
  useEffect(() => { document.body.style.overflow = menuOpen ? 'hidden' : ''; }, [menuOpen]);

  // Load username from localStorage
  useEffect(() => {
    const name = localStorage.getItem('username') || '';
    setUsername(name);
    const onStorage = (e) => { if (e.key === 'username') setUsername(e.newValue || ''); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <>
      <div className='navbar sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200 flex h-14 px-4 items-center'>
        <div className='flex items-center gap-3 min-w-0'>
          <a href='/' className='font-bold text-xl whitespace-nowrap'>Track In</a>
        </div>

        <div className='md:flex items-center gap-2 mx-auto'>
          <a href='/dashboard' className='px-3 py-1 rounded-full text-sm bg-yellow-600/90 text-white hover:bg-yellow-600'>Dashboard</a>
          <a href='/orders&returns' className='px-3 py-1 rounded-full text-sm bg-blue-100 hover:bg-blue-200 text-blue-900'>Orders & Returns</a>
          <a href='/products' className='px-3 py-1 rounded-full text-sm bg-green-100 hover:bg-green-200 text-green-900'>Products</a>
          <a href='/analysis' className='px-3 py-1 rounded-full text-sm bg-purple-100 hover:bg-purple-200 text-purple-900'>Analysis</a>
          <a href='/advance_analysis' className='px-3 py-1 rounded-full text-sm bg-red-100 hover:bg-red-200 text-red-900'>Advance Analysis</a>
        </div>

        <div className='ml-auto md:flex items-center gap-3'>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className='px-2 py-1 border rounded-md text-sm'
          >
            <option value={'all'}>All businesses</option>
            {businesses.map((b) => (
              <option key={b.id} value={String(b.id)}>{b.business_name || `Business ${b.id}`}</option>
            ))}
          </select>
          <button className='px-3 py-1 rounded-full text-sm bg-green-600 text-white hover:bg-green-700' onClick={() => setShowAddModal(true)}>Add Business</button>

          {username ? (
            <div className='flex items-center gap-2 px-2 py-1 rounded-full bg-gray-100 border border-gray-200'>
              <div className='w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold'>
                {username.charAt(0).toUpperCase()}
              </div>
              <span className='text-sm font-medium max-w-[10rem] truncate'>{username}</span>
            </div>
          ) : <span className='text-sm opacity-70'>Not signed in</span>}

          <button className='px-3 py-1 rounded-full text-sm bg-red-600 text-white hover:bg-red-700' onClick={handleLogout}>Logout</button>
        </div>

        <div className='nav-toggle md:hidden z-50'>
          {menuOpen ? <IoMdClose size={26} onClick={handleMenuToggle} /> : <TiThMenu size={26} onClick={handleMenuToggle} />}
        </div>
      </div>

      {/* Add Business Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-xl p-4 w-full max-w-md'>
            <h3 className='text-lg font-bold mb-3'>Add Business</h3>
            <div className='grid grid-cols-1 gap-2'>
              {["business_name","business_type","contact_number","gst_tax_id","business_address","department_branch"].map(field => (
                <input
                  key={field}
                  className='border rounded p-2'
                  placeholder={field.replace('_',' ').toUpperCase()}
                  value={newBiz[field]}
                  onChange={(e)=>setNewBiz({...newBiz,[field]:e.target.value})}
                />
              ))}
              <div>
                <label className='block text-sm mb-1'>Copy products from</label>
                <select className='border rounded p-2 w-full' value={newBiz.copy_from_business} onChange={(e)=>setNewBiz({...newBiz, copy_from_business: e.target.value})}>
                  <option value=''>Do not copy</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={String(b.id)}>{b.business_name || `Business ${b.id}`}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className='flex justify-end gap-2 mt-4'>
              <button className='px-3 py-1 rounded bg-gray-200' onClick={()=>setShowAddModal(false)}>Cancel</button>
              <button className='px-3 py-1 rounded bg-green-600 text-white' onClick={createBusiness}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      <div className={`nav-mobile fixed top-0 left-0 w-full h-full z-50 flex flex-col p-6 transition-transform duration-300 md:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className='w-full flex justify-between items-center mt-8 mb-6 px-1'>
          <div className='flex items-center gap-2 text-gray-800'>
            <div className='w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold'>
              {(username || 'U').charAt(0).toUpperCase()}
            </div>
            <span className='text-lg'>{username || 'User'}</span>
          </div>
          <button onClick={handleLogout} className='px-3 py-1 rounded-full text-sm bg-red-600 text-white'>Logout</button>
        </div>
        {['/dashboard','/orders&returns','/products','/analysis','/advance_analysis'].map((path,i)=>(
          <a key={i} href={path} className='text-3xl mb-2' onClick={handleMenuToggle}>
            {path.split('/')[1].replace('&',' & ').toUpperCase()}
          </a>
        ))}
      </div>
    </>
  );
}
