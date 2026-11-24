import { useSelector, type TypedUseSelectorHook } from "react-redux";
import type { RootState } from "../store/reduxStore";

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
