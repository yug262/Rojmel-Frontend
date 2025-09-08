import React from 'react'
import Navbar from '../components/Navbar'
import SalesForecast from '../components/SalesForecast'
import ForecastChart from '../components/ForecastChart'

export default function AdvanceAnalysis() {
  return (
    <>
        <section>
            <Navbar />
        </section>
        <section className='mt-24'>
            <div>
                <SalesForecast />
            </div>
            {/* <div>
                <ForecastChart />
            </div> */}
        </section>
    </>
  )
}