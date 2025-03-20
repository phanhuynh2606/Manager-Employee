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
  KeyIcon
} from "@heroicons/react/24/solid";
import { RxCountdownTimer } from "react-icons/rx";
import { GrUserAdmin } from "react-icons/gr";
import { LuMapPinCheckInside } from "react-icons/lu";
import { MdOutlineEditNotifications } from "react-icons/md";
import { Flex, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
const Profile = lazy(() => import("../src/pages/dashboard/profile"));
const Tables = lazy(() => import("../src/pages/dashboard/tables"));
const SignIn = lazy(() => import("../src/pages/auth/sign-in"));
const FirstTimeChangePassword = lazy(() => import("../src/pages/auth/first-time-password-change"));
const Department = lazy(() => import("../src/pages/department/Department"));
const Statistic = lazy(() => import("../src/pages/statistic/statistic"));
const ActiveLog = lazy(() => import("../src/pages/activelog/activelog"));
const Employee = lazy(() => import("../src/pages/employee/Employee"));
const ViewEmployee = lazy(() => import("../src/pages/employee/ViewEmployee"));
const Salary = lazy(() => import("../src/pages/salary/salary"));
const AttendanceManagement = lazy(() =>
  import("../src/pages/attendance/attendance"),
);
const ViewSalaryDetail = lazy(() => import("../src/pages/salary/viewSalaryDetail"));
const Notifications = lazy(() => import("../src/pages/notification/Notifications"));
const AdminManagement = lazy(() =>
  import("../src/pages/administration/Administration"),
);
const AdminDetail = lazy(() => import("../src/pages/administration/AdminView"));

const icon = {
  className: "w-5 h-5 text-inherit",
};

const LazyElement = (Component) => (
  <Suspense fallback={<Flex align="center" gap="middle" style={{ height: "100vh",textAlign: "center", justifyContent: "center" }}>
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
        roles: ["EMPLOYEE", "ADMIN"],
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
        name: "Đăng nhập",
        path: "/sign-in",
        element: LazyElement(SignIn),
      },
      {
        icon: <KeyIcon {...icon} />,
        name: "Thay đổi mật khẩu lần đầu",
        path: "/first-time-password-change",
        element: LazyElement(FirstTimeChangePassword),
      },
    ],
  },
];

export default routes;
