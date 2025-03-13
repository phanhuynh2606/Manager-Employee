import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import FirstTimeChangePassword from "@/pages/auth/first-time-password-change.jsx";
import ProtectedRoute from "@/utils/protectedRoute.jsx";
import Error from "./pages/auth/Error";

function App() {
    return (
        <Routes>
            <Route path="/auth/*" element={<Auth />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard/*" element={<Dashboard />} />
            {/* <Route path="//*" element={<Error/>} /> */}
                <Route path="/auth/first-time-password-change" element={<FirstTimeChangePassword />} />
            </Route>

            <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
        </Routes>
    );
}

export default App;
