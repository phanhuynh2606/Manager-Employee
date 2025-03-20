import React, { lazy, Suspense } from "react";
import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  ServerStackIcon,
  RectangleStackIcon,
  HomeModernIcon,
  BanknotesIcon,
  PowerIcon,
} from "@heroicons/react/24/solid";
import { RxCountdownTimer } from "react-icons/rx";
import { GrUserAdmin } from "react-icons/gr";
import { LuMapPinCheckInside } from "react-icons/lu";
import { MdOutlineEditNotifications } from "react-icons/md";
import { Flex, Spin } from "antd";
import { LoadingOutlined, TeamOutlined } from "@ant-design/icons";

const Profile = lazy(() => import("@/pages/dashboard/Profile"));
const Tables = lazy(() => import("@/pages/dashboard/Tables"));
const SignIn = lazy(() => import("@/pages/auth/sign-in"));
const Department = lazy(() => import("./pages/department/Department"));
const Statistic = lazy(() => import("./pages/statistic/statistic"));
const ActiveLog = lazy(() => import("./pages/activelog/activelog"));
const Employee = lazy(() => import("./pages/employee/Employee"));
const ViewEmployee = lazy(() => import("./pages/employee/ViewEmployee"));
const Salary = lazy(() => import("./pages/salary/salary"));
const AttendanceManagement = lazy(() =>
  import("./pages/attendance/attendance"),
);
const ViewSalaryDetail = lazy(() => import("./pages/salary/viewSalaryDetail"));
const Notifications = lazy(() => import("./pages/notification/Notifications"));
const AdminManagement = lazy(() =>
  import("./pages/administration/Administration"),
);
const AdminDetail = lazy(() => import("./pages/administration/AdminView"));
const Positions = lazy(() => import("./pages/positions/position"));

const icon = {
  className: "w-5 h-5 text-inherit",
};

const LazyElement = (Component) => (
  <Suspense fallback={<Flex align="center" gap="middle" style={{ height: "100vh", textAlign: "center", justifyContent: "center" }}>
    <Spin indicator={<LoadingOutlined spin />} size="large" />
  </Flex>}>
    <Component />
  </Suspense>
);

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Tổng quan",
        path: "/home",
        element: LazyElement(Statistic),
        roles: ["ADMIN"],
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Trang cá nhân",
        path: "/profile",
        element: LazyElement(Profile),
        roles: ["EMPLOYEE"],
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "tables",
        path: "/tables",
        element: LazyElement(Tables),
        roles: ["EMPLOYEE"],
      },
      {
        icon: <MdOutlineEditNotifications {...icon} />,
        name: "Thông báo",
        path: "/notifications",
        element: LazyElement(Notifications),
        roles: ["EMPLOYEE", "ADMIN"],
      },
      {
        icon: <GrUserAdmin {...icon} />,
        name: "Quản trị viên",
        path: "/admin",
        element: LazyElement(AdminManagement),
        roles: ["ADMIN"],
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Nhân Viên",
        path: "/employee",
        element: LazyElement(Employee),
        roles: ["ADMIN", "EMPLOYEE"],
      },
      {
        icon: <TeamOutlined {...icon} />,
        name: "Vị trí việc làm",
        path: "/position",
        element: LazyElement(Positions),
        roles: ["ADMIN"],
      },
      {
        icon: <HomeModernIcon {...icon} />,
        name: "Phòng ban",
        path: "/departments",
        element: LazyElement(Department),
        roles: ["ADMIN"],
      },
      {
        path: "/admin/:adminId",
        element: LazyElement(AdminDetail),
        roles: ["ADMIN"],
      },
      {
        path: "/employee/:employeeId",
        element: LazyElement(ViewEmployee),
        roles: ["EMPLOYEE", "ADMIN"],
      },
      {
        icon: <BanknotesIcon {...icon} />,
        name: "Quản lý lương",
        path: "/salaries",
        element: LazyElement(Salary),
        roles: ["EMPLOYEE", "ADMIN"],
      },
      {
        path: "/salaries/:salaryId",
        element: LazyElement(ViewSalaryDetail),
        roles: ["EMPLOYEE", "ADMIN"],
      },
      {
        icon: <LuMapPinCheckInside {...icon} />,
        name: "Quản lý điểm danh",
        path: "/attendance",
        element: LazyElement(AttendanceManagement),
        roles: ["EMPLOYEE", "ADMIN"],
      },
      {
        icon: <RxCountdownTimer {...icon} />,
        name: "Nhật ký hoạt động",
        path: "/activelog",
        element: LazyElement(ActiveLog),
        roles: ["ADMIN"],
      },
      {
        icon: <PowerIcon {...icon} />,
        name: "Đăng xuất",
        path: "/logout",
        roles: ["EMPLOYEE", "ADMIN"],
      },
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
        element: LazyElement(SignIn),
      },
    ],
  },
];

export default routes;
