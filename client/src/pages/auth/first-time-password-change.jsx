import {
    Card,
    Input,
    Checkbox,
    Button,
    Typography,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

import { Loader } from "@/Loading/Loader.jsx";
import { firstTimeChangePassword } from "@/apis/auth/auth.js";

export function FirstTimeChangePassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const { state } = useLocation();
    const email = state?.email; 
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newConfirmPassword, setNewConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate('/auth/sign-in');
        }
    }, [email, navigate]);

    const handleError = (response) => {
        const message = response?.data?.message || response?.message || 'Có lỗi xảy ra!';
        toast.error(message, {
            autoClose: 2000,
            closeOnClick: true,
            pauseOnHover: false,
        });
    };

    const handleChangePassword = async () => {
        setLoading(true);
        try {
            const result = await firstTimeChangePassword(email, oldPassword, newPassword, newConfirmPassword);

            const errorResponse = result?.response?.data;
            if (errorResponse?.success === false || result?.success === false) {
                handleError(errorResponse || result);
                return;
            }
            
            if (result?.success) {
                toast.success(result.message, {
                    autoClose: 3000,
                    closeOnClick: true,
                    pauseOnHover: false,
                });
                
                return navigate('/auth/sign-in');
            }
        } catch (e) {
            console.error(e, "Error");
            toast.error("Thay đổi mật khẩu không thành công!", {
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
            {loading ? (<Loader />) : (<section className="m-8 flex">
                <div className="w-2/5 h-full hidden lg:block">
                    <img
                        src="/img/pattern.png"
                        className="h-full w-full object-cover rounded-3xl"
                    />
                </div>
                <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
                    <div className="text-center">
                        <Typography variant="h2" className="font-bold mb-4">Thay đổi mật khẩu lần đầu</Typography>
                        <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
                            Nhập mật khẩu của bạn và mật khẩu mới để thay đổi.
                        </Typography>
                    </div>
                    <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
                        <div className="mb-1 flex flex-col gap-6">
                            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                                Mật khẩu cũ
                            </Typography>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                size="lg"
                                placeholder="********"
                                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                labelProps={{
                                    className: "before:content-none after:content-none",
                                }}
                                onChange={(e) => setOldPassword(e.target.value)}
                            />

                            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                                Mật khẩu mới
                            </Typography>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                size="lg"
                                placeholder="********"
                                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                labelProps={{
                                    className: "before:content-none after:content-none",
                                }}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />

                            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                                Xác nhận mật khẩu mới
                            </Typography>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                size="lg"
                                placeholder="********"
                                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                                labelProps={{
                                    className: "before:content-none after:content-none",
                                }}
                                onChange={(e) => setNewConfirmPassword(e.target.value)}
                            />
                        </div>
                        <Checkbox
                            label={
                                <Typography
                                    variant="small"
                                    color="gray"
                                    className="flex items-center justify-start font-medium"
                                >
                                    Hiển thị mật khẩu
                                </Typography>
                            }
                            containerProps={{ className: "-ml-2.5" }}
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        <Button className="mt-6" fullWidth onClick={handleChangePassword}>
                            Thay đổi mật khẩu
                        </Button>
                    </form>
                </div>
            </section>)}
        </>

    );
}

export default FirstTimeChangePassword;
