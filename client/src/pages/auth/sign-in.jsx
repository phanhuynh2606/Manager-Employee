import {
    Input,
    Button,
    Typography,
} from "@material-tailwind/react";
import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { authLogin } from "@/apis/auth/auth.js";
import { Loader } from "@/Loading/Loader.jsx";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/slice/auth/auth.slice.js";

export function SignIn() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleError = (response) => {
        const message = response?.data?.message || response?.message || "Lỗi máy chủ nội bộ";
        toast.error(message, {
            autoClose: 2000,
            closeOnClick: true,
            pauseOnHover: false,
        });
    };

    const handleLogin = async () => {
        setLoading(true);
        try {
            const result = await authLogin(email, password);

            const errorResponse = result?.response?.data;
            if (errorResponse?.success === false || result?.success === false) {
                handleError(errorResponse || result);
                return;
            }
            
            if (result?.active === "0") {
                toast.warning("Bạn cần thay đổi mật khẩu của mình.", {
                    autoClose: 2000,
                    closeOnClick: true,
                    pauseOnHover: false,
                });
                return navigate('/auth/first-time-password-change', { state: { email: result.email } });
            }
            
            if (result?.success) {
                toast.success(result.message, {
                    autoClose: 3000,
                    closeOnClick: true,
                    pauseOnHover: false,
                });
            
                dispatch(setUser({
                    email: result.email,
                    role: result.role,
                    position: result.position
                }));
            
                return navigate(result.role.toUpperCase() === "ADMIN" ? '/dashboard/home' : '/dashboard/employee');
            }
        } catch (e) {
            console.error(e, "Error");
            toast.error("Đăng nhập thất bại!", {
                autoClose: 2000,
                closeOnClick: true,
                pauseOnHover: false,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {
                loading ? (<Loader />) : (<section className="m-8 flex gap-4">
                    <div className="w-full lg:w-3/5 mt-24">
                        <div className="text-center">
                            <Typography variant="h2" className="font-bold mb-4">Đăng Nhập</Typography>
                            <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
                                Nhập email và mật khẩu của bạn để đăng nhập.
                            </Typography>
                        </div>
                        <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
                            <div className="mb-1 flex flex-col gap-6">
                                <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                                    Email của bạn
                                </Typography>
                                <Input
                                    size="lg"
                                    placeholder="name@mail.com"
                                    className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                    labelProps={{
                                        className: "before:content-none after:content-none",
                                    }}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                                    Mật khẩu
                                </Typography>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        size="lg"
                                        placeholder="********"
                                        className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                        labelProps={{
                                            className: "before:content-none after:content-none",
                                        }}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5 text-gray-500" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <Button className="mt-6" fullWidth onClick={handleLogin}>
                                Đăng Nhập
                            </Button>
                        </form>
                    </div>
                    <div className="w-2/5 h-full hidden lg:block">
                        <img
                            src="/img/pattern.png"
                            className="h-full w-full object-cover rounded-3xl"
                            alt={"Section"} />
                    </div>
                </section>)
            }
        </>
    );
}

export default SignIn;
