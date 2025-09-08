import { FaRegChartBar } from "react-icons/fa";
import { GrLineChart } from "react-icons/gr";
import { BsBoxSeam } from "react-icons/bs";
import { GoPeople } from "react-icons/go";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { AiOutlineThunderbolt } from "react-icons/ai";
import { TbWorld } from "react-icons/tb";
import { LuTruck } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { MdOutlineStar } from "react-icons/md";
import img from "./a.avif"
import NumberFlow from '@number-flow/react'
import StarBackground from '../components/StarBackground';


export default function Home() {
  return (
    <section className=''>
    <div className='relative min-h-screen font-inter'> {/* This is the main container */}

      <StarBackground/> {/* Star background is now in the main container */}

      <div className='relative z-10'> {/* All your content goes in this div with a higher z-index */}
        
        {/* Your navigation bar */}
        <nav className='text-white'>
          <div className='flex justify-between px-5 py-2'>
            <div><h1 className='font-bold text-3xl'>Track In</h1></div>
            <div className='flex gap-5'>
              <a href='/login' className='bg-gray-800 px-3 pt-1 rounded-2xl hover:bg-gray-900 font-bold'>Login</a>
            </div>
          </div>
        </nav>

        {/* Hero section */}
        <section className='text-white'>
          <div className="flex flex-col-reverse md:flex-row w-full">
            <div className="w-full md:w-1/2 flex justify-center">
              <img
                className="w-[300px] sm:w-[400px] md:w-[450px] lg:w-[550px] dark-image image-float"
                src={img}
                alt="Illustration of a dynamic inventory dashboard"
              />
            </div>
            <div className="w-full md:w-1/2 py-10 px-5 lg:mt-24 pt-20 ">
              <h1 className="lg:text-7xl md:text-5xl text-4xl font-bold text-center md:text-left">
                Welcome to Track In.AI
              </h1>
              <p className="text-center md:text-left lg:text-2xl text-lg mt-5">
                Streamline your inventory operations with advanced analytics, predictive insights, and real-time monitoring. Take control of your stock levels and boost your business efficiency.
              </p>
            </div>
          </div>
        </section> 
        
        {/* Everything You Need section */}
        <section className='text-white'>
          <div className='mt-12 lg:px-24 md:px-12 sm:px-5 shadow-xl'>
            <h1 className='text-center font-bold text-4xl'>Everything You Need to Manage Inventory</h1>
            <h1 className='text-center font-bold text-gray-700 text-2xl mt-5'>From basic stock tracking to advanced AI predictions, we've got all the tools you need to optimize your inventory operations.</h1>
            <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 justify-center items-stretch gap-5 mt-12 px-5 pb-24">
              {/* Feature cards go here */}
              <div className="card p-5 rounded-xl h-full bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                <div className='head flex gap-2 align-center'><FaRegChartBar size={35} /><h1 className='text-2xl font-bold'>Advanced Analytics</h1></div>
                <div className='body'><p className='text-gray-700 pt-2'>Get detailed insights into your sales performance, stock levels, and business trends with interactive charts and reports.</p></div>
              </div>
              <div className='card p-5 rounded-xl h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-lg'>
                <div className='head flex gap-2 align-center'><GrLineChart size={35} /><h1 className='text-2xl font-bold'>Predictive Insights</h1></div>
                <div className='body'><p className='text-gray-700 pt-2'>AI-powered predictions help you anticipate stock needs, prevent shortages, and optimize your inventory levels.</p></div>
              </div>
              <div className='card p-5 rounded-xl h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-lg'>
                <div className='head flex gap-2 align-center'><BsBoxSeam size={35} /><h1 className='text-2xl font-bold'>Real-time Monitoring</h1></div>
                <div className='body'><p className='text-gray-700 pt-2'>Track your inventory in real-time with instant alerts for low stock, high-demand items, and critical thresholds.</p></div>
              </div>
              <div className='card p-5 rounded-xl h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-lg'>
                <div className='head flex gap-2 align-center'><GoPeople size={35} /><h1 className='text-2xl font-bold'>Team Collaboration</h1></div>
                <div className='body'><p className='text-gray-700 pt-2'>Role-based access control ensures your team has the right permissions while maintaining security and accountability.</p></div>
              </div>
              <div className='card p-5 rounded-xl h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-lg'>
                <div className='head flex gap-2 align-center'><IoShieldCheckmarkOutline size={35} /><h1 className='text-2xl font-bold'>Secure & Reliable</h1></div>
                <div className='body'><p className='text-gray-700 pt-2'>Enterprise-grade security with data encryption, regular backups, and 99.9% uptime guarantee.</p></div>
              </div>
              <div className='card p-5 rounded-xl h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-lg'>
                <div className='head flex gap-2 align-center'><AiOutlineThunderbolt size={35} /><h1 className='text-2xl font-bold'>Lightning Fast</h1></div>
                <div className='body'><p className='text-gray-700 pt-2'>Optimized performance ensures quick loading times and smooth user experience across all devices.</p></div>
              </div>
            </div>
          </div>
        </section>

        {/* Stat section */}
        <div className='py-12 grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-2 grid-cols-2 gap-10 justify-center bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl'>
          <div className='p-5 text-center'>
            <h1 className='text-4xl text-red-200 font-bold'><NumberFlow value={10000} />+</h1>
            <p className='text-gray-600'>Active Users</p>
          </div>
          <div className='p-5 text-center'>
            <h1 className='text-4xl text-green-200 font-bold'>₹<NumberFlow value={50} />Cr+</h1>
            <p className='text-gray-600'>Inventory Managed</p>
          </div>
          <div className='p-5 text-center'>
            <h1 className='text-4xl text-blue-200 font-bold'><NumberFlow value={99.9} />%</h1>
            <p className='text-gray-600'>Uptime</p>
          </div>
          <div className='p-5 text-center'>
            <h1 className='text-4xl text-yellow-200 font-bold'><NumberFlow value={24}/>/<NumberFlow value={7}/></h1>
            <p className='text-gray-600'>Support</p>
          </div>
        </div>

        {/* Perfect for Every Business Type section */}
        <section className='text-white'>
          <div className='mt-16 lg:px-24 md:px-12 sm:px-5'>
            <h1 className='text-center font-bold text-4xl'>Perfect for Every Business Type</h1>
            <h1 className='text-center font-bold text-gray-700 text-2xl mt-5'>Whether you're a small retailer or a large enterprise, Track In adapts to your specific industry needs.</h1>
            <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-2 justify-center items-stretch gap-5 mt-12 px-5 pb-24">
              <div className="card p-5 rounded-xl h-full bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-md border border-white/20 shadow-lg">
                <div className='head flex gap-2 align-center'><TbWorld size={35} /><h1 className='text-2xl font-bold'>E-commerce Businesses</h1></div>
                <div className='body'><p className='text-gray-700 pt-2'>Manage multi-channel inventory across online marketplaces</p></div>
                <div className='mt-5 flex-col gap-5'>
                  <div className='flex gap-2'><IoMdCheckmarkCircleOutline style={{color:'lightgreen', marginTop:'3px' }}/><h1>Real-time sync</h1></div>
                  <div className='flex gap-2'><IoMdCheckmarkCircleOutline style={{color:'lightgreen', marginTop:'3px' }}/><h1>Order management</h1></div>
                  <div className='flex gap-2'><IoMdCheckmarkCircleOutline style={{color:'lightgreen', marginTop:'3px' }}/><h1>Stock alerts</h1></div>
                </div>
              </div>
              <div className='card p-5 rounded-xl h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-lg'>
                <div className='head flex gap-2 align-center'><IoSettingsOutline size={35} /><h1 className='text-2xl font-bold'>Manufacturing</h1></div>
                <div className='body'><p className='text-gray-700 pt-2'>Track raw materials and finished goods efficiently</p></div>
                <div className='mt-5 flex-col gap-5'>
                  <div className='flex gap-2'><IoMdCheckmarkCircleOutline style={{color:'lightgreen', marginTop:'3px' }}/><h1>Production planning</h1></div>
                  <div className='flex gap-2'><IoMdCheckmarkCircleOutline style={{color:'lightgreen', marginTop:'3px' }}/><h1>Material tracking</h1></div>
                  <div className='flex gap-2'><IoMdCheckmarkCircleOutline style={{color:'lightgreen', marginTop:'3px' }}/><h1>Quality control</h1></div>
                </div>
              </div>
              <div className='card p-5 rounded-xl h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-lg'>
                <div className='head flex gap-2 align-center'><BsBoxSeam size={35} /><h1 className='text-2xl font-bold'>Retail Stores</h1></div>
                <div className='body'><p className='text-gray-700 pt-2'>Optimize in-store and warehouse inventory levels</p></div>
                <div className='mt-5 flex-col gap-5'>
                  <div className='flex gap-2'><IoMdCheckmarkCircleOutline style={{color:'lightgreen', marginTop:'3px' }}/><h1>POS integration</h1></div>
                  <div className='flex gap-2'><IoMdCheckmarkCircleOutline style={{color:'lightgreen', marginTop:'3px' }}/><h1>Multi-location</h1></div>
                  <div className='flex gap-2'><IoMdCheckmarkCircleOutline style={{color:'lightgreen', marginTop:'3px' }}/><h1>Customer insights</h1></div>
                </div>
              </div>
              <div className='card p-5 rounded-xl h-full bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-lg'>
                <div className='head flex gap-2 align-center'><LuTruck size={35} /><h1 className='text-2xl font-bold'>Distributors</h1></div>
                <div className='body'><p className='text-gray-700 pt-2'>Manage complex supply chains and vendor relationships</p></div>
                <div className='mt-5 flex-col gap-5'>
                  <div className='flex gap-2'><IoMdCheckmarkCircleOutline style={{color:'lightgreen', marginTop:'3px' }}/><h1>Supplier management</h1></div>
                  <div className='flex gap-2'><IoMdCheckmarkCircleOutline style={{color:'lightgreen', marginTop:'3px' }}/><h1>Bulk operation</h1></div>
                  <div className='flex gap-2'><IoMdCheckmarkCircleOutline style={{color:'lightgreen', marginTop:'3px' }}/><h1>Route optimization</h1></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials section */}
        <section className='text-white'>
          <div className='mt-2 lg:px-24 md:px-12 sm:px-5'>
            <h1 className='text-center font-bold text-4xl'>Trusted by Industry Leaders</h1>
            <h1 className='text-center font-bold text-gray-700 text-2xl mt-5'>See what our customers have to say about their experience with Track In</h1>
            <div className='grid lg:grid-cols-3 grid-cols-1 gap-7 mt-12 px-5'>
              <div className='review-card p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl rounded-xl'>
                <div className='head flex'>
                  <div className='img-container'></div>
                  <div>
                    <h1 className='text-xs font-bold'>Sarah Johnson</h1>
                    <h1 className='text-xs'>Operations Manager</h1>
                    <h1 className='text-xs'>TechFlow Solutions</h1>
                  </div>
                </div>
                <div className='body mt-3'>
                  <div className='flex'><MdOutlineStar style={{color:'yellow'}}/><MdOutlineStar style={{color:'yellow'}}/><MdOutlineStar style={{color:'yellow'}}/><MdOutlineStar style={{color:'yellow'}}/><MdOutlineStar style={{color:'yellow'}}/></div>
                  <p className='mt-3 text-gray-600'>"Track In transformed our inventory management completely. We reduced stockouts by 85% and improved our cash flow significantly. The AI predictions are incredibly accurate!"</p>
                </div>
              </div>
              <div className='review-card p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl rounded-xl'>
                <div className='head flex'>
                  <div className='img-container'></div>
                  <div>
                    <h1 className='text-xs font-bold'>Michael Chen</h1>
                    <h1 className='text-xs'>Supply Chain Director</h1>
                    <h1 className='text-xs'>Global Manufacturing Inc</h1>
                  </div>
                </div>
                <div className='body mt-3'>
                  <div className='flex'><MdOutlineStar style={{color:'yellow'}}/><MdOutlineStar style={{color:'yellow'}}/><MdOutlineStar style={{color:'yellow'}}/><MdOutlineStar style={{color:'yellow'}}/><MdOutlineStar style={{color:'yellow'}}/></div>
                  <p className='mt-3 text-gray-600'>"The analytics dashboard gives us insights we never had before. We've optimized our stock levels and reduced carrying costs by 30%. Highly recommended!"</p>
                </div>
              </div>
              <div className='review-card p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 shadow-xl rounded-xl'>
                <div className='head flex'>
                  <div className='img-container'></div>
                  <div>
                    <h1 className='text-xs font-bold'>Emily Rodriguez</h1>
                    <h1 className='text-xs'>Warehouse Manager</h1>
                    <h1 className='text-xs'>RetailMax</h1>
                  </div>
                </div>
                <div className='body mt-3'>
                  <div className='flex'><MdOutlineStar style={{color:'yellow'}}/><MdOutlineStar style={{color:'yellow'}}/><MdOutlineStar style={{color:'yellow'}}/><MdOutlineStar style={{color:'yellow'}}/><MdOutlineStar style={{color:'yellow'}}/></div>
                  <p className='mt-3 text-gray-600'>"Implementation was seamless and the support team is fantastic. The real-time alerts have prevented countless stockouts. It's a game-changer for our business."</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-black mt-8 p-5">
          <div className="flex justify-between px-5 text-white">
            <h1 className="font-bold text-xl">Track In</h1>
            <p>© 2025 SecurePay. All rights reserved.</p>
          </div>
        </section>
      </div>
    </div>
    </section>
  )
}