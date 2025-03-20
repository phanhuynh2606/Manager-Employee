import {
    Card,
    Input,
    Checkbox,
    Button,
    Typography,
} from "@material-tailwind/react";
import { useState } from "react";
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';

import { Loader } from "@/Loading/Loader.jsx";
import { firstTimeChangePassword } from "@/apis/auth/auth.js";

export function FirstTimeChangePassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const { email } = location.state
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newConfirmPassword, setNewConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleError = (response) => {
        const message = response?.data?.message || response?.message || 'Something went wrong';
        toast.error(message, {
            autoClose: 2000,
            closeOnClick: true,
            pauseOnHover: false,
        });
    }; 
    const verifyPassword = () =>{ 
        if (!oldPassword || !newPassword || !newConfirmPassword){
            toast.error("Vui lòng nhập đầy đủ thông tin", {
                autoClose: 2000,
                closeOnClick: true,
                pauseOnHover: false,
            });
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            toast.error("Mật khẩu phải chứa ít nhất 1 kí tự viết hoa, 1 kí tự viết thường, 1 số, 1 kí tự đặc biệt và tối thiểu 8 kí tự", {
                autoClose: 2000,
                closeOnClick: true,
                pauseOnHover: false,
            });
            return;
        }
        if (oldPassword === newPassword){
            toast.error("Mật khẩu mới phải khác mật khẩu cũ", {
                autoClose: 2000,
                closeOnClick: true,
                pauseOnHover: false,
            });
            return;
        }
        if (newPassword !== newConfirmPassword){
            toast.error("Mật khẩu xác nhận không trùng khớp", {
                autoClose: 2000,
                closeOnClick: true,
                pauseOnHover: false,
            });
            return;
        } 
        handleChangePassword();
    }
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
                        <Button className="mt-6" fullWidth onClick={verifyPassword}>
                            Thay đổi mật khẩu
                        </Button>
                    </form>
                </div>
            </section>)}
        </>

    );
}

export default FirstTimeChangePassword;
