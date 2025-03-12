import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  HomeModernIcon,
  BanknotesIcon,
  PowerIcon
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import Department from "./pages/department/Department";
import Employee from "./pages/employee/Employee";
import ViewEmployee from "./pages/employee/ViewEmployee";
import Salary from "./pages/salary/salary";
import AttendanceManagement from "./pages/attendance/attendance";

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
        element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "tables",
        path: "/tables",
        element: <Tables />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
      },
      {
        icon: <HomeModernIcon {...icon} />,
        name: "Departments",
        path:'/departments',
        element: <Department />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Employees",
        path:'/employee',
        element: <Employee />,
      } ,
      {
        path:'/employee/:employeeId',
        element: <ViewEmployee />,
      },
      {
            icon: <BanknotesIcon {...icon} />,
            name: "Salary",
            path:'/salaries',
            element: <Salary />,
      },
      {
            icon: <UserCircleIcon {...icon} />,
            name: "Attendance",
            path:'/attendance',
            element: <AttendanceManagement />,
      },
      {
        icon: <PowerIcon {...icon} />,
        name: "Logout",
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
