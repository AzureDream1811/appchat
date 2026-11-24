import HeaderHome from "./common/HeaderHome";
import MainPage from "../components/home/MainPage";
import Footer from "../components/home/Footer";
import FeatureTemp from "../components/home/FeatureTemp";

export default function Home() {
    return (
        <div className="min-h-screen w-full flex flex-col font-sans antialiased bg-white ">
            <HeaderHome />
            <MainPage/>
            <FeatureTemp/>
            <Footer/>
        </div>
    )
}