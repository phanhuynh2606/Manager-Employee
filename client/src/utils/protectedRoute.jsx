import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return isAuthenticated ? <Outlet /> : <Navigate to="/auth/sign-in" replace />;
};

export default ProtectedRoute;
