import React, { useEffect, useState, useRef } from "react";
import {
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Typography,
} from "@material-tailwind/react";
import { BellIcon, ClockIcon } from "@heroicons/react/24/solid";
import socket from "@/utils/socket";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { getNotifications } from "@/apis/notifications/notifications.api";
import dayjs from "dayjs"; // Import dayjs
import relativeTime from "dayjs/plugin/relativeTime"; // Plugin để dùng fromNow()
import { notification } from "antd";
import { useNavigate } from "react-router-dom";

// Thêm plugin relativeTime vào dayjs
dayjs.extend(relativeTime);
const pageSize = 5;
const NotificaionNavbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1); // Trang hiện tại
  const [hasMore, setHasMore] = useState(true); // Còn thông báo để tải không
  const [loading, setLoading] = useState(false); // Trạng thái đang tải
  const { employeeId, departmentId } = useSelector((state) => state.auth.user);
  const menuListRef = useRef(null); // Ref để theo dõi scroll
  const [numberOfUnread, setNumberOfUnread] = useState(0);
  const navigate = useNavigate();
  const [threshold, setThreshold] = React.useState(3);
  const notificationSound = useRef(null);
  const [api, contextHolder] = notification.useNotification({
    stack: {
          threshold,
        },
  });
  const openNotification = (title) => {
    api.open({
      message: 'Bạn có thông báo mới!',
      description: `${title}!`,
      duration: 30,
      placement: 'topRight',
      showProgress: true,
    });
  };
  // Hàm lấy thông báo
  const fetchNotifications = async (pageNum) => {
    if (!employeeId || loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await getNotifications(pageNum, pageSize, "UNREAD");
      console.log(response.data);
      if (response.success) {
        const newNotifications = response.data;
        setNumberOfUnread(response.unreadNotifications);
        setNotifications((prev) =>
          pageNum === 1 ? newNotifications : [...prev, ...newNotifications]
        );
        setHasMore(newNotifications.length === pageSize); // Nếu trả về đủ 10, còn dữ liệu
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Lấy thông báo thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Lấy thông báo ban đầu và thiết lập socket
  useEffect(() => {
    if (!employeeId) return;

    fetchNotifications(1);

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("Socket connected in NotificationDropdown, socket.id:", socket.id);
      socket.emit("joinRoom", employeeId);
      if (departmentId) {
        socket.emit("joinRoom", departmentId);
      }
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    socket.on("joinedRoom", (message) => {
      console.log("NotificationDropdown joined room:", message);
    });

    socket.on("newNotification", (newNotification) => {
      console.log("New notification received:", newNotification);
      if (notificationSound.current) {
        notificationSound.current.play().catch((error) => console.warn("Audio play failed:", error));
      }
      openNotification(newNotification.title);
      setNotifications((prev) => [newNotification, ...prev]);
      setNumberOfUnread((prev) => prev + 1); // Tăng số lượng chưa đọc
    });

    return () => {
      console.log("Cleaning up NotificationDropdown socket listeners");
      socket.off("connect");
      socket.off("connect_error");
      socket.off("joinedRoom");
      socket.off("newNotification");
    };
  }, [employeeId, departmentId]);

  // Xử lý scroll để tải thêm thông báo
  const handleScroll = () => {
    const menuList = menuListRef.current;
    if (!menuList || loading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = menuList;
    console.log(scrollTop, scrollHeight, clientHeight);
    if (scrollTop + clientHeight >= scrollHeight - 10) { // Gần cuối danh sách
      setPage((prev) => {
        const nextPage = prev + 1;
        fetchNotifications(nextPage);
        return nextPage;
      });
    }
  };

  return (
    <Menu>
      <audio ref={notificationSound} src="/audio/notification.wav" />
      {contextHolder}
      <MenuHandler>
        <IconButton variant="text" color="blue-gray" className="relative">
          <BellIcon className="h-6 w-6 text-blue-gray-500" />
          {notifications.length > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {numberOfUnread}
            </span>
          )}
        </IconButton>
      </MenuHandler>
      <MenuList
        className="w-max border-0 max-h-72 overflow-y-auto" // Giới hạn chiều cao và thêm scroll
        onScroll={handleScroll} // Gắn sự kiện scroll
        ref={menuListRef} // Gắn ref
      >
        {notifications.length > 0 ? (
          notifications.map((notification, index) => (
            <MenuItem key={index} className="flex items-center gap-3"
              onClick={() => navigate(`./notifications`)}
            >
              <Avatar
                src={notification.createdBy?.avatarUrl}
                alt="notification"
                size="sm"
                variant="circular"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://static.vecteezy.com/system/resources/previews/009/170/419/non_2x/a-unique-design-icon-of-employee-management-vector.jpg";
                }}
              />
              <div>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="mb-0 font-normal"
                >
                  <strong>{notification.title}</strong>
                </Typography>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="flex items-center gap-1 text-xs font-normal opacity-60"
                >
                  <ClockIcon className="h-3.5 w-3.5" />
                  {dayjs(notification.createdAt).fromNow()} {/* Thời gian tương đối */}
                </Typography>
              </div>
            </MenuItem>
          ))
        ) : (
          <MenuItem>
            <Typography variant="small" color="blue-gray">
              Không có thông báo chưa đọc
            </Typography>
          </MenuItem>
        )}
        {loading && (
          <MenuItem>
            <Typography variant="small" color="blue-gray">
              Đang tải...
            </Typography>
          </MenuItem>
        )}
      </MenuList>
    </Menu>
  );
};

NotificaionNavbar.displayName = "/src/components/NotificaionNavbar.jsx";
export default NotificaionNavbar;