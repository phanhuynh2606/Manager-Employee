function isActiveUser(isActive, res) {
    switch (isActive) {
        // case "0":
        //     return res.status(403).json({
        //         success: false,
        //         statusCode: 403,
        //         message: "You need to change your password."
        //     });
        // case "1":
        //     return res.status(200).json({
        //         success: true,
        //         statusCode: 200,
        //         message: "You have full access."
        //     });
        case "2":
            return res.status(403).json({
                success: false,
                statusCode: 403,
                message: "Tài khoản của bạn đã bị khóa!"
            });
        case "3":
            return res.status(410).json({
                success: false,
                statusCode: 410,
                message: "Tài khoản của bạn đã bị xóa!"
            });
    }
}

module.exports = {isActiveUser}