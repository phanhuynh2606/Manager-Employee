import React from "react";
import {
    Typography,
    Card,
    CardHeader,
    CardBody,
    IconButton,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Avatar,
    Tooltip,
    Progress,
    Checkbox
} from "@material-tailwind/react";
import {
    EllipsisVerticalIcon,
    ArrowUpIcon,
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
    statisticsCardsData,
    statisticsChartsData,
    projectsTableData,
    ordersOverviewData,
} from "@/data";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";
import { Square3Stack3DIcon } from "@heroicons/react/24/outline";
import Chart from "react-apexcharts"
import instance from "../../configs/axiosCustomize"
import StatisticEmployee from "./employee";
import BaseSalaryStatisyic from "./basesalary";

export function Statistic() {  
    return (
        <div className="p-6 bg-gray-50 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Employee Dashboard</h1>
        
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Employee Statistics</h2>
            <StatisticEmployee />
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Salary Information</h2>
            <BaseSalaryStatisyic />
          </div>
        </div>
      </div>
    )
}

export default Statistic;
