import {useRef} from "react"
import {motion, useScroll, useTransform} from "framer-motion"
// image for parallax
import img_1 from "@/assets/img/Texting-bro.svg"
import img_2 from "@/assets/img/Video call-pana.svg"
import img_3 from "@/assets/img/Voice chat-pana.svg"

const features = [
    {
        id: 1,
        title: "Send a message to friends",
        description: "Only message those who have been invited",
        imageSrc: img_1,
    },
    {
        id: 2,
        title: "Community building",
        description: "Create a place for you and the community",
        imageSrc: img_2,
    },
    {
        id: 3,
        title: "Share everything from one to others",
        description: "Send photos, text, audio, and more",
        imageSrc: img_3,
    }
]
export default function FeatureTemp() {
    const sectionRef = useRef<HTMLElement>(null)
    const {scrollYProgress} = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    })
    const imageY = useTransform(scrollYProgress, [0, 1], [0, -120]);
    return (
        <section ref={sectionRef} className={"relative min-h-screen flex flex-col items-center justify-center"}>
            <div className="grid ms-50 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-50 mt-24">
                {features.map((feature) => (
                    <div key={feature.id} className="relative group h-full mt-16">
                        <div
                            className={`h-full w-[350px] bg-appchat-bluesky/10 rounded-[35px] p-6 pt-24 text-center relative z-10 transition-transform group-hover:scale-[1.02]`}
                        >
                            <div
                                className="absolute top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-white/40 blur-xl rounded-full z-0"></div>

                            <h3 className="text-2xl font-bold text-footer relative z-10">
                                {feature.title}
                            </h3>
                            <p className="text-appchat-bluesky/80 font-bold text-lg my-2 relative z-10">
                                {feature.description}
                            </p>
                        </div>
                        <motion.img
                            style={{ y: imageY }}
                            src={feature.imageSrc}
                            alt={feature.title}
                            className="absolute -top-10 left-[170px] -translate-x-1/2 w-80 h-auto object-fit z-20 drop-shadow-2xl pointer-events-none transition-transform group-hover:scale-110"
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}