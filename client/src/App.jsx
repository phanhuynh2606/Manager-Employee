import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import FirstTimeChangePassword from "@/pages/auth/first-time-password-change.jsx";
import ProtectedRoute from "@/utils/protectedRoute.jsx"; 

function App() {
    return (
        <Routes>
            <Route path="/auth/*" element={<Auth />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard/*" element={<Dashboard />} />
            {/* <Route path="//*" element={<Error/>} /> */} 
            </Route>
            <Route path="/auth/first-time-password-change" element={<FirstTimeChangePassword />} />
            <Route path="*" element={<Navigate to="/auth/sign-in" replace />} />
        </Routes>
    );
}

export default App;
