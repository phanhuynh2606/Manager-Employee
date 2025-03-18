import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import {BrowserRouter} from "react-router-dom";
import {ThemeProvider} from "@material-tailwind/react";
import {MaterialTailwindControllerProvider} from "@/context";
import "../public/css/tailwind.css";
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {Provider} from "react-redux";
import {persistor, store} from "@/redux/store.js";
import {PersistGate} from "redux-persist/integration/react";

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter>
        <ThemeProvider>
            <MaterialTailwindControllerProvider>
                <Provider store={store}>
                    <PersistGate loading={null} persistor={persistor}>
                        <App/>
                        <ToastContainer/>
                    </PersistGate>
                </Provider>
            </MaterialTailwindControllerProvider>
        </ThemeProvider>
    </BrowserRouter>
);
