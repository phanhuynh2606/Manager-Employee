import { useLocation, Link } from "react-router-dom";
import {
    Navbar,
    Typography,
    Button,
    IconButton,
    Breadcrumbs,
    Input,
    Menu,
    MenuHandler,
    MenuList,
    MenuItem,
    Avatar,
} from "@material-tailwind/react";
import {
    UserCircleIcon,
    Cog6ToothIcon,
    BellIcon,
    ClockIcon,
    CreditCardIcon,
    Bars3Icon,
    ArrowPathIcon,
} from "@heroicons/react/24/solid";
import {
    useMaterialTailwindController,
    setOpenConfigurator,
    setOpenSidenav,
} from "@/context";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getProfile } from "@/apis/auth/auth.js";
import { useNavigate } from 'react-router-dom';
import NotificaionNavbar from "./NotificaionNavbar";
import useIsAdmin from "@/utils/useIsAdmin";
import { downloadBackup, restoreBackup } from "@/apis/backup/backup";

export function DashboardNavbar() {
    const [controller, dispatch] = useMaterialTailwindController();
    const { fixedNavbar, openSidenav } = controller;
    const { pathname } = useLocation();
    const [layout, page] = pathname.split("/").filter((el) => el !== "");
    const navigate = useNavigate();
    const isAdmin = useIsAdmin();
    const [userName, setUserName] = useState("");
    const [file, setFile] = useState(null);

    useEffect(() => {
        const GET_PROFILE = async () => {
            try {
                const response = await getProfile();
                setUserName(response.result.username);
            } catch (e) {
                console.error(e, "Error");
                toast.error("Lấy thông tin người dùng thất bại!", {
                    autoClose: 500,
                    closeOnClick: true,
                    pauseOnHover: false,
                });

                setTimeout(() => {
                    navigate('/auth/sign-in');
                }, 2000);
            }
        };

        GET_PROFILE();
    }, [navigate]);

const handleBackups = async () => {
    console.log("Bắt đầu lấy dữ liệu backup...");
    
    const result = await downloadBackup(); // Đổi từ downloadLatestBackup thành fetchLatestBackup

    if (result.success) {
        console.log("Tên file backup:", result.filename);
        console.log("Dữ liệu backup:", result.data);
        alert(`Lấy dữ liệu backup thành công! File: ${result.filename}`);
    } else {
        alert(result.message);
    }
};


    const handleFileChange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
        }
    };

    const handleRestores = async () => {
        if (!file) {
            alert("Vui lòng chọn file backup để phục hồi!");
            return;
        }
        console.log("Bắt đầu phục hồi dữ liệu...");
        const result = await restoreBackup(file);
        alert(result.success ? "Phục hồi dữ liệu thành công!" : result.message);
    };

    return (
        <Navbar
            color={fixedNavbar ? "white" : "transparent"}
            className={`rounded-xl transition-all ${fixedNavbar
                ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
                : "px-0 py-1"
                }`}
            fullWidth
            blurred={fixedNavbar}
        >
            <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
                <div className="capitalize">
                    <Breadcrumbs
                        className={`bg-transparent p-0 transition-all ${fixedNavbar ? "mt-1" : ""
                            }`}
                    >
                        <Link to={`/${layout}/home`} className="flex items-center gap-2">
                            <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
                            >
                                {layout} 
                            </Typography>
                        </Link>
                        <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                        >
                            {page}
                        </Typography>
                    </Breadcrumbs>
                </div>
                <div className="flex items-center">
                    {
                        isAdmin && (
                            <div className="mr-auto md:mr-4 md:w-56 flex gap-2">
                            <Button color="blue" className="flex items-center gap-2" onClick={handleBackups}>
                                Sao lưu dữ liệu
                            </Button>
                
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleFileChange}
                                className="hidden"
                                id="backupFileInput"
                            />
                            <label htmlFor="backupFileInput" className="flex items-center gap-2">
                                <Button color="green" as="span">
                                    Chọn file
                                </Button>
                            </label>
                
                            <Button color="green" className="flex items-center gap-2" onClick={handleRestores} disabled={!file}>
                                Phục hồi dữ liệu
                            </Button>
                        </div>
                        )
                    }
                    <IconButton
                        variant="text"
                        color="blue-gray"
                        className="grid xl:hidden"
                        onClick={() => setOpenSidenav(dispatch, !openSidenav)}
                    >
                        <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
                    </IconButton>
                    <div>
                        <Button
                            variant="text"
                            color="blue-gray"
                            className="hidden items-center gap-1 px-4 xl:flex normal-case"
                        >
                            <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
                            {`${userName}`}
                        </Button>
                        <IconButton
                            variant="text"
                            color="blue-gray"
                            className="grid xl:hidden"
                        >
                            <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
                        </IconButton>
                    </div>
                    <NotificaionNavbar/>
                    <IconButton
                        variant="text"
                        color="blue-gray"
                        onClick={() => setOpenConfigurator(dispatch, true)}
                    >
                        <Cog6ToothIcon className="h-5 w-5 text-blue-gray-500" />
                    </IconButton>
                </div>
            </div>
        </Navbar>
    );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
