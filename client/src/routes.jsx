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
import useIsAdmin from "./utils/useIsAdmin";



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
        roles: ["EMPLOYEE"],
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
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
        roles: ["EMPLOYEE"],
      },
      {
        icon: <HomeModernIcon {...icon} />,
        name: "Departments",
        path:'/departments',
        element: <Department />,
        roles: ["ADMIN"],
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Employees",
        path:'/employee',
        element: <Employee /> ,
        roles: ["ADMIN","EMPLOYEE"],
      } ,
      {
        path:'/employee/:employeeId',
        element: <ViewEmployee />,
        roles: ["EMPLOYEE"],
      },
      {
            icon: <BanknotesIcon {...icon} />,
            name: "Salary",
            path:'/salaries',
            element: <Salary />,
            roles: ["EMPLOYEE"],
      },
      {
            icon: <UserCircleIcon {...icon} />,
            name: "Attendance",
            path:'/attendance',
            element: <AttendanceManagement />,
            roles: ["ADMIN"],
      },
      {
        icon: <PowerIcon {...icon} />,
        name: "Logout",
        path: "/logout",
        roles: ["EMPLOYEE","ADMIN"],
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
