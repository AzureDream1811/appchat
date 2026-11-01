import NavBar from "../home/NavBar";
import MainPage from "../home/MainPage";
import Footer from "../home/Footer";
import FeatureTemp from "../home/FeatureTemp";

export default function Home() {
    return (
        <div className="min-h-screen w-full flex flex-col font-sans antialiased bg-white ">
            <NavBar />
            <MainPage/>
            <FeatureTemp/>
            <Footer/>
        </div>
    )
}