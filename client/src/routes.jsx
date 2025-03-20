import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  HomeModernIcon,
  ChartPieIcon,
  BanknotesIcon,
  PowerIcon
} from "@heroicons/react/24/solid";
import { GrUserAdmin } from "react-icons/gr";
import { LuMapPinCheckInside } from "react-icons/lu";
import { MdOutlineEditNotifications } from "react-icons/md"
import { Home, Profile, Tables } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import Department from "./pages/department/Department";
import Statistic  from "./pages/statistic/statistic"
import ActiveLog from "./pages/activelog/activelog";
import Employee from "./pages/employee/Employee";
import ViewEmployee from "./pages/employee/ViewEmployee";
import Salary from "./pages/salary/salary";
import AttendanceManagement from "./pages/attendance/attendance";
import ViewSalaryDetail from "./pages/salary/viewSalaryDetail";
import Notifications from "./pages/notification/Notifications";
import AdminManagement from "./pages/administration/Administration";
import AdminDetail from "./pages/administration/AdminView";


const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Statistic />,
        roles: ["ADMIN"],
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
        roles: ["EMPLOYEE"],
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "tables",
        path: "/tables",
        element: <Tables />,
        roles: ["EMPLOYEE"],
      },
      {
        icon: <MdOutlineEditNotifications {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
        roles: ["EMPLOYEE", "ADMIN"],
      },
      {
        icon: <HomeModernIcon {...icon} />,
        name: "Departments",
        path: '/departments',
        element: <Department />,
        roles: ["ADMIN"],
      },
     
      {
        icon: <ChartPieIcon {...icon} />,
        name: "Active log",
        path:'/activelog',
        element: <ActiveLog />,
        roles: ["EMPLOYEE","ADMIN"],
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Employees",
        path: '/employee',
        element: <Employee />,
        roles: ["ADMIN", "EMPLOYEE"],
      },
      {
        icon: <GrUserAdmin {...icon} />,
        name: "Administration",
        path: '/admin',
        element: <AdminManagement />,
        roles: ["ADMIN"],
      },
      {
        path: '/admin/:adminId',
        element: <AdminDetail />,
        roles: ["ADMIN"],
      },
      {
        path: '/employee/:employeeId',
        element: <ViewEmployee />,
        roles: ["EMPLOYEE", "ADMIN"],
      },
      {
        icon: <BanknotesIcon {...icon} />,
        name: "Salary",
        path: '/salaries',
        element: <Salary />,
        roles: ["EMPLOYEE", "ADMIN"],
      },
      {
        path: '/salaries/:salaryId',
        element: <ViewSalaryDetail />,
        roles: ["EMPLOYEE", "ADMIN"],
      },
      {
        icon: <LuMapPinCheckInside {...icon} />,
        name: "Attendance",
        path: '/attendance',
        element: <AttendanceManagement />,
        roles: ["EMPLOYEE", "ADMIN"],
      },
      {
        icon: <PowerIcon {...icon} />,
        name: "Logout",
        path: "/logout",
        roles: ["EMPLOYEE", "ADMIN"],
      }
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;
