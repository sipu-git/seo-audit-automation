import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/src/shared/lib/store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
