import Image from "next/image";
import Mekanism from "../../../public/Mekanism.png";
import { OnHover } from "../atoms/on-hover";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { AiOutlineLogout } from "react-icons/ai";

export default function Header() {
    return (
        <header className="flex items-center justify-between px-6 py-4 h-20 border-b border-toolgear-gray-75 bg-gradient-to-r from-toolgear-black-125 via-toolgear-black-125 to-toolgear-black-75 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <OnHover>
                    <div className="relative">
                        <Image
                            src={Mekanism}
                            alt="Logo Mekanism"
                            className="h-12 w-auto object-contain"
                        />
                    </div>
                </OnHover>

                <div className="flex items-center gap-2">
                    <div className="w-px h-8 bg-gradient-to-b from-toolgear-purple-25 to-toolgear-purple-75"></div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-toolgear-purple-25 to-toolgear-purple-75 bg-clip-text text-transparent">
                        Mekanism
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <OnHover>
                    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-toolgear-black-75 hover:bg-toolgear-black-50 transition-all duration-300 group">
                        <div className="text-sm font-medium text-toolgear-gray-50 group-hover:text-toolgear-gray-25 transition-colors">
                            Usuário
                        </div>
                        <Avatar className="h-8 w-8 border-2 border-toolgear-purple-25">
                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                            <AvatarFallback className="text-xs font-bold text-toolgear-purple-25">USER</AvatarFallback>
                        </Avatar>
                    </div>
                </OnHover>
                
                <OnHover>
                    <div className="p-3 rounded-xl bg-toolgear-black-75 hover:bg-toolgear-purple-25 hover:border-toolgear-purple-50 transition-all duration-300 group">
                        <AiOutlineLogout className="text-xl text-toolgear-gray-50 group-hover:text-toolgear-black-125 transition-colors" />
                    </div>
                </OnHover>
            </div>
        </header>
    );
}
