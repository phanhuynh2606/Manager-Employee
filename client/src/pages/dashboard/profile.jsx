import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Avatar,
  Typography,
  Tabs,
  TabsHeader,
  Tab,
  Switch,
  Tooltip,
  Button,
  Chip,
} from "@material-tailwind/react";
import {
  HomeIcon,
  ChatBubbleLeftEllipsisIcon,
  Cog6ToothIcon,
  PencilIcon,
  KeyIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { ProfileInfoCard, MessageCard } from "@/widgets/cards";
import { platformSettingsData, conversationsData, projectsData } from "@/data";
import { useEffect, useState } from "react";
import { getProfileUser } from "@/apis/auth/auth";
import { Loader } from "@/Loading/Loader";
import useIsAdmin from "@/utils/useIsAdmin";

export function Profile() {
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(false);

  const getProfileEmployee = async () => {
    try {
      setLoading(true);
      const response = await getProfileUser();
      if (response.success) {
        setProfile(response.result);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProfileEmployee();
  }, []);

  if (loading) return <Loader />;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 lg:mx-4 border border-blue-gray-100">
        <CardBody className="p-4">
          {/* Header Section */}
          <div className="mb-10 flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <Avatar
                src={profile?.avatar}
                alt={profile?.fullName}
                size="xl"
                variant="rounded"
                className="rounded-lg shadow-lg shadow-blue-gray-500/40"
              />
              <div>
                <Typography variant="h5" color="blue-gray" className="mb-1">
                  {profile?.fullName}
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-600"
                >
                  {profile?.position === "STAFF" ? "Nhân viên" : "Quản lý"} tại {profile?.departmentName}
                </Typography>
              </div>
            </div>
            {
              useIsAdmin ? null : (
                <div className="w-96">
                  <Tabs value="app">
                    <TabsHeader>
                      <Tab value="app">
                        <KeyIcon className="-mt-1 mr-2 inline-block h-5 w-5" />
                        Thay đổi mật khẩu
                      </Tab>
                    </TabsHeader>
                  </Tabs>
                </div>
              )
            }
          </div>

          {/* Main Content */}
          <div className="grid gap-12 px-4 lg:grid-cols-2 xl:grid-cols-3">
            {/* Personal Information */}
            <ProfileInfoCard
              title="Thông tin hồ sơ"
              details={{
                "Họ và tên đầy đủ": profile?.fullName,
                "Ngày sinh": formatDate(profile?.dateOfBirth),
                "Giới tính": profile?.gender === "MALE" ? "Nam" : "Nữ",
                "Địa chỉ": profile?.address,
                "Số điện thoại": profile?.phoneNumber,
              }}
              action={
                <Tooltip content="Edit Profile">
                  <PencilIcon className="h-4 w-4 cursor-pointer text-blue-gray-500" />
                </Tooltip>
              }
            />

            {/* Work Information */}
            <ProfileInfoCard
              title="Thông tin công việc"
              details={{
                "Chức vụ": profile?.position ? "Nhân viên" : "Quản lý",
                "Phòng ban": profile?.departmentName,
                "Số phòng": profile?.roomNumber,
                "Ngày bắt đầu làm việc": formatDate(profile?.hireDate),
              }}
            />

            {/* Salary Information */}
            {
              useIsAdmin ? null : (<div>
                <Typography variant="h6" color="blue-gray" className="mb-3">
                  Lương & Phúc lợi
                </Typography>
                <div className="flex flex-col gap-4">
                  <div>
                    <Typography className="text-sm font-semibold text-blue-gray-500">
                      Lương cơ bản: {formatCurrency(profile?.baseSalary)}
                    </Typography>
                    <Typography className="text-sm font-semibold text-blue-gray-500">
                      Mức lương mới nhất: {formatCurrency(profile?.latestSalary)}
                    </Typography>
                  </div>

                  {/* Bonuses */}
                  <div>
                    <Typography className="text-xs font-semibold uppercase text-blue-gray-500 mb-2">
                      Tiền thưởng
                    </Typography>
                    {profile?.bonuses?.map((bonus) => (
                      <div key={bonus._id} className="mb-2">
                        <Typography className="text-sm">
                          {bonus.name}: {formatCurrency(bonus.amount)}
                        </Typography>
                        <Typography className="text-xs text-blue-gray-500">
                          {bonus.reason}
                        </Typography>
                      </div>
                    ))}
                  </div>

                  {/* Allowances */}
                  <div>
                    <Typography className="text-xs font-semibold uppercase text-blue-gray-500 mb-2">
                      Phụ cấp
                    </Typography>
                    {profile?.allowances?.map((allowance) => (
                      <div key={allowance._id} className="mb-2">
                        <Typography className="text-sm">
                          {allowance.name}: {formatCurrency(allowance.amount)}
                        </Typography>
                      </div>
                    ))}
                  </div>

                  {/* Deductions */}
                  <div>
                    <Typography className="text-xs font-semibold uppercase text-blue-gray-500 mb-2">
                      Trừ tiền
                    </Typography>
                    {profile?.deductions?.map((deduction) => (
                      <div key={deduction._id} className="mb-2">
                        <Typography className="text-sm">
                          {deduction.name}: {formatCurrency(deduction.amount)}
                        </Typography>
                        <Typography className="text-xs text-blue-gray-500">
                          {deduction.reason}
                        </Typography>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Leave Information */}
                <div>
                  <Typography variant="h6" color="blue-gray" className="mb-3">
                    Ngày nghỉ phép
                  </Typography>
                  <div className="flex flex-col gap-4">
                    <Typography className="text-sm">
                      Nghỉ phép hàng năm: {profile?.annualLeave} ngày
                    </Typography>
                    <Typography className="text-sm">
                      Nghỉ ốm: {profile?.sickLeave} ngày
                    </Typography>
                    <Typography className="text-sm">
                      Nghỉ phép không lương: {profile?.unpaidLeave} ngày
                    </Typography>
                  </div>
                </div>

              </div>)
            }
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default Profile;