import {
    Card,
    Input,
    Checkbox,
    Button,
    Typography,
} from "@material-tailwind/react";
import {useState} from "react";
import {toast} from 'react-toastify';
import {useNavigate, useLocation} from 'react-router-dom';

import {Loader} from "@/Loading/Loader.jsx";
import {firstTimeChangePassword} from "@/apis/auth/auth.js";

export function FirstTimeChangePassword() {
    const navigate = useNavigate();
    const location = useLocation();
    const {email} = location.state
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newConfirmPassword, setNewConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        setLoading(true);
        try {
            const result = await firstTimeChangePassword(email, oldPassword, newPassword, newConfirmPassword);
            if (!result.success) {
                return toast.error(result.message, {
                    autoClose: 2000,
                    closeOnClick: true,
                    pauseOnHover: false,
                });
            }

            toast.success(result.message, {
                autoClose: 3000,
                closeOnClick: true,
                pauseOnHover: false,
            });

            return navigate('/auth/sign-in');
        } catch (e) {
            console.error(e, "Error");
            toast.error("Change password failed!", {
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
            {loading ? (<Loader/>) : (<section className="m-8 flex">
                <div className="w-2/5 h-full hidden lg:block">
                    <img
                        src="/img/pattern.png"
                        className="h-full w-full object-cover rounded-3xl"
                    />
                </div>
                <div className="w-full lg:w-3/5 flex flex-col items-center justify-center">
                    <div className="text-center">
                        <Typography variant="h2" className="font-bold mb-4">First Time Change Password</Typography>
                        <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">Enter your
                            password
                            and new password to change.</Typography>
                    </div>
                    <form className="mt-8 mb-2 mx-auto w-80 max-w-screen-lg lg:w-1/2">
                        <div className="mb-1 flex flex-col gap-6">
                            <Typography variant="small" color="blue-gray" className="-mb-3 font-medium">
                                Old Password
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
                                New Password
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
                                Confirm New Password
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
                                    Show password
                                </Typography>
                            }
                            containerProps={{className: "-ml-2.5"}}
                            checked={showPassword}
                            onChange={() => setShowPassword(!showPassword)}
                        />
                        <Button className="mt-6" fullWidth onClick={handleChangePassword}>
                            Change Password
                        </Button>
                    </form>
                </div>
            </section>)}
        </>
    );
}

export default FirstTimeChangePassword;
