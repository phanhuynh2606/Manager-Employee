const API_BE = {
    LOGIN: "/auth/login",
    FIRST_TIME_CHANGE_PASSWORD: "/auth/first-time-change-password",
    REFRESH_TOKEN: "/auth/get-access-token",
    LOGOUT: "/auth/logout",
    GET_PROFILE: "/auth/get-profile",
    DOWLOAD_FILE_BACKUP: "/download-latest",
    RESTORES: "/restores",
    GET_PROFILE_USER: "/auth/get-profile-user",
    BACKUP_DATA_IN_DATABASE: "/create-backup-from-mongodb",
    RESTORE_DATA_IN_DATABASE: "/restore-latest-backup",
}

export default API_BE;