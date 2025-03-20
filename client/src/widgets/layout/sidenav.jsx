import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { toast } from "react-toastify";
import { logout } from "@/apis/auth/auth.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { setLogout } from "@/redux/slice/auth/auth.slice.js";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const {user} = useSelector(state => state.auth);
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };
  const dispatched = useDispatch();
  const navigate = useNavigate();

  const handleToast = (message, type) => {
    const toastMethod = type === 'error' ? toast.error : toast.success;
    toastMethod(message, {
      autoClose: 2000,
      closeOnClick: true,
      pauseOnHover: false,
    });
  };

  const handleLogout = async () => {
    try {
      const response = await logout();

      const errorResponse = response?.response?.data;
      if (errorResponse?.success === false) {
          return handleToast(errorResponse.message, 'error');
      }
      
      if (response?.success) {
          dispatched(setLogout());
          handleToast(response.message, 'success');
          return navigate('/auth/sign-in');
      }      
    } catch (e) {
      console.error(e, "Error");
      toast.error("Đăng xuất thất bại!", {
        autoClose: 2000,
        closeOnClick: true,
        pauseOnHover: false,
      });
    }
  }

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${openSidenav ? "translate-x-0" : "-translate-x-80"
        } overflow-auto fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
    >
      <div
        className={`relative`}
      >
        <Link to="./home" className="py-6 px-8 pl-4 text-center border-b border-blue-gray-100 block">
          <Typography
            variant="h4"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
          >
            {brandName}
          </Typography>
        </Link>
        
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
        
      </div>
      <div className="m-4">
        {routes.filter(router => router.layout !== "auth").map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-1">
            {title && (
              <li className="mx-3.5 mt-4 mb-2">
                <Typography
                  variant="small"
                  color={sidenavType === "dark" ? "white" : "blue-gray"}
                  className="font-black uppercase opacity-75"
                >
                  {title}
                </Typography>
              </li>
            )}
            {pages.filter(page => page.name && (!page.roles || page.roles.includes(user.role))).map(({ icon, name, path }, index) => (
              <li key={index}>
                <NavLink
                  to={`/${layout}${path}`}
                  onClick={e => {
                    if (name === "Đăng xuất") {
                      e.preventDefault();
                      handleLogout();
                    }
                  }}
                >
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "gradient" : "text"}
                      color={
                        isActive
                          ? sidenavColor
                          : sidenavType === "dark"
                            ? "white"
                            : "gray"
                      }
                      className="flex items-center gap-4 px-4 capitalize"
                      fullWidth
                    >
                      {icon}
                      <Typography
                        color="inherit"
                        className="font-medium capitalize"
                      >
                        {name === "Logout" ? (
                          <span>Logout</span>
                        ) : (
                          name
                        )}
                      </Typography>
                    </Button>
                  )}
                </NavLink>
              </li>
            ))}

          </ul>
        ))}
      </div>
      
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-cty.jpg",
  brandName: "Quản lý nhân viên",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
