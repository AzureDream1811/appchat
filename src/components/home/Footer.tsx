import { Github, Linkedin, Facebook } from "lucide-react";

export default function Footer() {
    const footerSections = [
        { title: "Resources", items: ["College", "Support", "Safety", "Blog", "Feedback"] },
        { title: "Policies", items: ["Terms", "Privacy", "Cookie Settings", "Guidelines"] },
    ]

    return (
        <footer className="text-white bg-footer pt-70">
            <div className="container mx-auto px-6">

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10 mb-16">
                    <div className="lg:col-span-2">
                            <div className="flex items-center gap-4 mt-6">
                                <a
                                    href="https://github.com/your-username"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white hover:text-footer text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm"
                                    title="GitHub"
                                >
                                    <Github className="w-5 h-5" />
                                </a>

                                <a
                                    href="https://linkedin.com/in/your-profile"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white hover:text-[#0A66C2] text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm"
                                    title="LinkedIn"
                                >
                                    <Linkedin className="w-5 h-5" />
                                </a>


                                <a
                                    href="https://facebook.com/your-profile"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-11 h-11 rounded-full bg-white/10 hover:bg-white hover:text-[#1877F2] text-white flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-sm"
                                    title="Facebook"
                                >
                                    <Facebook className="w-5 h-5" />
                                </a>
                            </div>
                        
                    </div>

                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h4 className="text-white font-medium mb-4">{section.title}</h4>
                            <ul className="space-y-2">
                                {section.items.map((item) => (
                                    <li key={item}>
                                        <a href="/" className="hover:underline">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="my-8"></div>


            </div>
        </footer>
    );
}