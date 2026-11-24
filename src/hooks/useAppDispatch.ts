import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/reduxStore";

export const useAppDispatch = () => useDispatch<AppDispatch>();