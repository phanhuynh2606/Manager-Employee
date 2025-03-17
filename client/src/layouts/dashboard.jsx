import { Routes, Route, useLocation } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { useSelector } from "react-redux";
import Error from "@/pages/auth/Error";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;
  const {user} = useSelector(state => state.auth);

  // Kiểm tra xem route hiện tại có hợp lệ và user có quyền truy cập không
  const hasAccess = routes.some(({ layout, pages }) =>
    layout === "dashboard" &&
    pages.some(({ path, roles }) =>
      location.pathname.includes(path) && (!roles || roles.includes(user.role))
    )
  );

  if (!hasAccess) {
    return <Error />;
  }
  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        <Configurator />
        <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton>
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({roles, path, element }) => {
                if (roles?.includes(user.role)) {
                  return <Route path={path} element={element} />
                }
              })
          )} 
        </Routes>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
