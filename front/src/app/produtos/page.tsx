"use client";

import Header from "@/components/organisms/header";
import Link from "next/link";
import { DataTable } from "@/components/organisms/data-table";
import { columns, Produto } from "@/components/molecules/columns";
import { FiArrowLeft } from "react-icons/fi";

export default function ProdutosPage() {
  const data: Produto[] = [
    {
      id: "1",
      nome: "Chave de Fenda",
      tipo: "Ferramenta",
      peso: "200g",
      tamanho: "15cm",
      estoqueAtual: 32,
      estoqueMinimo: 10,
    },
    {
      id: "2",
      nome: "Parafuso M10",
      tipo: "Peça",
      peso: "12g",
      tamanho: "10mm",
      estoqueAtual: 250,
      estoqueMinimo: 50,
    },
  ];

  return (
    <div className="min-h-screen bg-toolgear-black-125">
      <Header />

      <main className="flex flex-col mx-auto px-6 py-12">

        <div className="mb-10">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-toolgear-purple-25 hover:text-toolgear-purple-50 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Voltar para o início
          </Link>
        </div>

        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-toolgear-gray-0 mb-3">
            Gerenciar Produtos
          </h1>
          <p className="text-lg text-toolgear-gray-75 max-w-2xl mx-auto">
            Cadastre, edite e organize seus produtos de forma centralizada
          </p>
        </div>

        <div className="max-w-5xl mx-auto">

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            <div className="bg-gradient-to-br from-toolgear-black-75 to-toolgear-black-125 border border-toolgear-gray-75 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-toolgear-gray-0 mb-2">Total de Produtos</h3>
              <p className="text-toolgear-gray-75 mb-5 text-sm">
                Produtos cadastrados no sistema.
              </p>
              <div className="text-4xl font-bold text-toolgear-green-25">342</div>
              <div className="text-sm text-toolgear-gray-50 mt-1">Ativos</div>
            </div>

            <div className="bg-gradient-to-br from-toolgear-black-75 to-toolgear-black-125 border border-toolgear-gray-75 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-toolgear-gray-0 mb-2">Categorias</h3>
              <p className="text-toolgear-gray-75 mb-5 text-sm">
                Organização por categorias.
              </p>
              <div className="text-4xl font-bold text-toolgear-purple-25">18</div>
              <div className="text-sm text-toolgear-gray-50 mt-1">Categorias</div>
            </div>

            <div className="bg-gradient-to-br from-toolgear-black-75 to-toolgear-black-125 border border-toolgear-gray-75 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-toolgear-gray-0 mb-2">Novos Hoje</h3>
              <p className="text-toolgear-gray-75 mb-5 text-sm">
                Produtos cadastrados recentemente.
              </p>
              <div className="text-4xl font-bold text-toolgear-blue-25">7</div>
              <div className="text-sm text-toolgear-gray-50 mt-1">Hoje</div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full mt-20">
          <h2 className="text-2xl font-bold text-toolgear-gray-0 mb-6">
            Lista de Produtos
          </h2>

          <DataTable
            columns={columns}
            data={data}
            onAdd={() => console.log("Adicionar Produto")}
          />
        </div>
      </main>
    </div>
  );
}