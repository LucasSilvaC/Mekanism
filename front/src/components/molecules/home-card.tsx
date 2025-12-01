import Link from "next/link";
import { OnHover } from "@/components/atoms/on-hover";
import { IconType } from "react-icons";

interface HomeCardProps {
  title: string;
  description: string;
  href: string;
  icon: IconType;
  color: "purple" | "green";
}

export function HomeCard({ title, description, href, icon: Icon, color }: HomeCardProps) {
  
  const colorMap = {
    purple: {
      border: "hover:border-toolgear-purple-25",
      shadow: "hover:shadow-toolgear-purple-25/20",
      bg: "bg-toolgear-purple-25/10 group-hover:bg-toolgear-purple-25/20",
      iconBg: "bg-toolgear-purple-25",
      text: "text-toolgear-purple-25 group-hover:text-toolgear-purple-50",
      overlay: "from-toolgear-purple-25/20",
      dot: "bg-toolgear-purple-25",
    },
    green: {
      border: "hover:border-toolgear-green-25",
      shadow: "hover:shadow-toolgear-green-25/20",
      bg: "bg-toolgear-green-25/10 group-hover:bg-toolgear-green-25/20",
      iconBg: "bg-toolgear-green-25",
      text: "text-toolgear-green-25 group-hover:text-toolgear-green-50",
      overlay: "from-toolgear-green-25/20",
      dot: "bg-toolgear-green-25",
    },
  };

  const c = colorMap[color];

  return (
    <Link href={href}>
      <OnHover>
        <div className={`
          group relative overflow-hidden rounded-2xl 
          bg-gradient-to-br from-toolgear-black-75 to-toolgear-black-125
          border border-toolgear-gray-75 p-10 h-72 cursor-pointer 
          transition-all duration-300 
          ${c.border} hover:shadow-2xl ${c.shadow}
        `}>

          <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
            <div className={`absolute inset-0 bg-gradient-to-br ${c.overlay} to-transparent`}></div>
          </div>

          <div className={`flex items-center justify-center w-20 h-20 rounded-xl mb-8 transition-colors ${c.bg}`}>
            <Icon className={`text-4xl transition-transform group-hover:scale-110 ${c.iconBg} text-black p-2 rounded-lg`} />
          </div>

          <h2 className="text-2xl font-bold text-toolgear-gray-0 mb-4">
            {title}
          </h2>

          <p className="text-toolgear-gray-75 mb-8 leading-relaxed">
            {description}
          </p>

          <div className={`flex items-center font-medium transition-colors ${c.text}`}>
            <span>Acessar</span>
            <Icon className="ml-2 text-xl group-hover:translate-x-1 transition-transform" />
          </div>

          <div className={`absolute top-4 right-4 w-2 h-2 rounded-full opacity-50 group-hover:opacity-100 transition-opacity ${c.dot}`}></div>
          <div className={`absolute bottom-4 left-4 w-1 h-1 rounded-full opacity-30 group-hover:opacity-60 transition-opacity ${c.dot}`}></div>

        </div>
      </OnHover>
    </Link>
  );
}