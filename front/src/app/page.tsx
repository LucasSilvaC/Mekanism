import Header from "@/components/organisms/header";
import { HomeCard } from "@/components/molecules/home-card";
import { VscTools } from "react-icons/vsc";
import { FiInbox } from "react-icons/fi";

export default function Home() {
  return (
    <div className="min-h-screen bg-toolgear-black-125">
      <Header />

      <main className="mx-auto flex flex-col px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-toolgear-gray-0 mb-4">
            Bem-vindo ao Mekanism
          </h1>
          <p className="text-xl text-toolgear-gray-75">
            Gerencie seu estoque e produtos com facilidade
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
          <HomeCard
            title="Gestão de Estoque"
            description="Controle e monitore seu estoque em tempo real, com alertas de reposição e relatórios detalhados."
            icon={FiInbox}
            href="/estoque"
            color="purple"
          />

          <HomeCard
            title="Gerenciar Produtos"
            description="Cadastre, edite e organize seus produtos com informações detalhadas e categorização inteligente."
            icon={VscTools}
            href="/produtos"
            color="green"
          />
        </div>

        <div className="text-center mt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-toolgear-black-75 border border-toolgear-gray-75">
            <div className="w-2 h-2 bg-toolgear-purple-25 rounded-full animate-pulse"></div>
            <span className="text-sm text-toolgear-gray-50">Sistema em tempo real</span>
          </div>
        </div>
      </main>
    </div>
  );
}
