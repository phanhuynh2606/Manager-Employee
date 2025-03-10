import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    isAuthenticated: false,
};

console.log(initialState.user, "123");

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        setLogout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
});

export const { setUser, setLogout } = authSlice.actions;
export default authSlice.reducer;
