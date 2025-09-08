import Sales from "./Sales";
import TotalOrders from "./TotalOrders";
import TopSales from "./TopSales";
import LowStock from "./LowStock";
import Return from "./Return";
import NetProfit from "./NetProfit";
import SalesChart from "../charts/SalesChart";
import CategoryChart from "../charts/CategoryChart";
import '../css/comp.css';

export default function Hero() {
  return (
    <>
  <div className="hero flex flex-col gap-5"> {/* Changed to flex-col for the main container */}
    <div className="top-row flex gap-5 items-start"> {/* This div will hold the top row elements */}
      {/* Left Group (Sales, Total Orders, Net Profit, Returns) */}
      <div className="flex flex-col gap-5">
        <div className="comp rounded-xl w-56 h-[106px]" id='comp'>
          <Sales />
        </div>
        <div className="comp rounded-xl w-56 h-[106px]" id='comp'>
          <TotalOrders />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <div className="comp rounded-xl w-56 h-[106px]" id='comp'>
          <NetProfit />
        </div>
        <div className="comp rounded-xl w-56 h-[106px]" id='comp'>
          <Return />
        </div>
      </div>

      {/* Top 5 Products */}
      <div className="comp rounded-xl w-36 h-auto" id='comp'>
        <TopSales />
      </div>

      {/* Low Stock */}
      <div className="comp rounded-xl w-36 h-auto" id='comp'>
        <LowStock />
      </div>
    </div>

    {/* Daily Sales Chart - This will be below the entire top row */}
    <div className="flex gap-5">
    <div className="comp rounded-xl w-[632px] h-80" id='comp'> {/* Approximate width calculation based on your current component widths and gaps */}
      <SalesChart />
    </div>

    <div className="comp rounded-xl w-[432px] h-80" id='comp'> {/* Approximate width calculation based on your current component widths and gaps */}
      <CategoryChart />
    </div>
    </div>
  </div>
</>

  )
}
