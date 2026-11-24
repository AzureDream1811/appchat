import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { useAppDispatch } from "../../hooks/useAppDispatch";
import { useAppSelector } from "../../hooks/useAppSelector";
import { clearSession } from "../../store/slices/authSlice";
import { socket } from "../../services/socket";

export default function NavBar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    async function handleLogout() {
        if (!window.confirm("Bạn có chắc chắn muốn đăng xuất không?")) return;

        setIsLoggingOut(true);
        try {
            await socket.request("LOGOUT");
        } catch (error) {
            console.error("Đăng xuất khỏi máy chủ thất bại:", error);
        } finally {
            dispatch(clearSession());
            navigate("/");
            setIsLoggingOut(false);
        }
    }

    return (
        <nav className="w-full py-4 sticky top-0 z-50">
            <div className="container mx-auto px-6 flex justify-between items-center">
                {isScrolled ? (
                    <a href="/" className="text-white font-black p-3 text-2xl tracking-tighter flex items-center gap-2 rounded-sm bg-appchat-bluesky">
                        <i className="fa-solid fa-comment"></i> ChatApp
                    </a>
                ): (
                    <a href="/" className="text-appchat-bluesky font-black p-3 text-2xl tracking-tighter flex items-center gap-2 rounded-sm">
                        <i className="fa-solid fa-comment"></i> ChatApp - Connecting you with people
                    </a>
                )}
                <div className="flex items-center gap-5">
                    {isLoggedIn ? (
                        <>
                            <Button
                                className="bg-appchat-bluesky text-lg text-white hover:bg-white hover:border hover:text-appchat-bluesky/80 rounded-b-md px-4 h-12 font-semibold transition-all"
                                onClick={() => navigate("/chat")}
                            >
                                Chat
                            </Button>
                            <Button
                                className="bg-white text-lg text-appchat-bluesky hover:bg-slate-100 rounded-b-md px-4 h-12 font-semibold transition-all"
                                onClick={() => void handleLogout()}
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? "Logging out..." : "Logout"}
                            </Button>
                        </>
                    ) : (
                        <Button
                            className="bg-appchat-bluesky text-lg text-white hover:bg-white hover:border hover:text-appchat-bluesky/80 rounded-b-md px-4 h-12 font-semibold transition-all"
                            onClick={() => navigate("/login")}
                        >
                            Login
                        </Button>
                    )}
                </div>
            </div>
        </nav>

    )
}