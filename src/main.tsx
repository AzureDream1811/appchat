import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import App from "./App";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ChatInterface from "./pages/chat/ChatInterface";
import NotFound from "./pages/error/NotFound";
import RequireAuth from "./routes/RequireAuth";
import { store } from "./store/reduxStore";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      {
        element: <RequireAuth />,
        children: [{ path: "chat", element: <ChatInterface /> }],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Missing root element with id "root"');
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
