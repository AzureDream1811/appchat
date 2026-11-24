import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { useAppDispatch } from "./useAppDispatch";

export function useLogout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return () => {
    void dispatch(logout())
      .unwrap()
      .then(() => navigate("/login"))
      .catch(() => undefined);
  };
}
