import {Button} from "../ui/Button";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

export default function NavBar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
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
                    <Button
                        className="bg-appchat-bluesky text-lg text-white hover:bg-white hover:border hover:text-appchat-bluesky/80 rounded-b-md px-4 h-12 w-50 font-semibold transition-all" onClick={()=> navigate("login")}
                    >
                        Login
                    </Button>
                </div>
            </div>
        </nav>

    )
}