import React from "react";
import StatisticEmployee from "./employee";
import BaseSalaryStatisyic from "./basesalary";

export function Statistic() {  
    return (
        <div className="w-full h-screen bg-gray-50 flex flex-col items-center p-8">
            <h1 className="text-4xl font-bold mb-8 text-gray-800">Trang tổng quan</h1>
            
            <div className="w-full max-w-[90%] flex flex-col gap-8">
                <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow w-full">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-3">Thống kê nhân viên</h2>
                    <StatisticEmployee />
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow w-full">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-700 border-b pb-3">Thông tin lương cơ bản $</h2>
                    <BaseSalaryStatisyic />
                </div>
            </div>
        </div>
    )
}

export default Statistic;