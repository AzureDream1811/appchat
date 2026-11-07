import { createBrowserRouter } from "react-router-dom";
import Home from "../components/home/Home";
import Register from "../components/auth/Register";
import LoginPage from "../pages/LoginPage";
import ChatPage from "../pages/ChatPage";


const route = createBrowserRouter(
    [
        {
            path: "/",
            element: <Home />
        },
        {
            path: "/register",
            element: <Register />
        },
        {
            path: "/login",
            element: <LoginPage />
        },
        {
            path: "/chat",
            element: <ChatPage />
        }
    ]
  
)

export default route
