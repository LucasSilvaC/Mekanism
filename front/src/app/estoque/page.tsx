"use client";

import { useState, useMemo } from "react";
import Header from "@/components/organisms/header";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";
import { FiArrowDownCircle, FiArrowUpCircle } from "react-icons/fi";

export type ProdutoEstoque = {
  id: string;
  nome: string;
  estoqueAtual: number;
  estoqueMinimo: number;
};

// 📌 Mock inicial
const produtosMock: ProdutoEstoque[] = [
  { id: "1", nome: "Broca Aço Rápido", estoqueAtual: 12, estoqueMinimo: 5 },
  { id: "2", nome: "Chave Torx T10", estoqueAtual: 4, estoqueMinimo: 6 },
  { id: "3", nome: "Serra Circular 7¼", estoqueAtual: 20, estoqueMinimo: 8 },
];

export default function EstoquePage() {
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>(produtosMock);

  const [selecionado, setSelecionado] = useState<ProdutoEstoque | null>(null);

  const [tipoMov, setTipoMov] = useState<"entrada" | "saida">("entrada");
  const [quantidade, setQuantidade] = useState<number>(0);
  const [dataOperacao, setDataOperacao] = useState<string>("");

  // ✔ Ordenação alfabética – RF24 / RF25
  const produtosOrdenados = useMemo(() => {
    return [...produtos].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [produtos]);

  const registrarMovimentacao = () => {
    if (!selecionado) return;

    const qtd = Number(quantidade);
    if (qtd <= 0) return;

    const atualizado = produtos.map((p) => {
      if (p.id !== selecionado.id) return p;

      const novoEstoque =
        tipoMov === "entrada"
          ? p.estoqueAtual + qtd
          : p.estoqueAtual - qtd;

      return { ...p, estoqueAtual: novoEstoque };
    });

    setProdutos(atualizado);

    setQuantidade(0);
    setDataOperacao("");

    const novoProduto = atualizado.find((p) => p.id === selecionado.id)!;
    setSelecionado(novoProduto);
  };

  return (
    <div className="min-h-screen bg-toolgear-black-125">
      <Header />

      <main className="mx-auto flex flex-col px-6 py-16 max-w-7xl">

        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-toolgear-purple-25 hover:text-toolgear-purple-50 transition-colors"
          >
            <HiArrowLeft className="text-xl" />
            <span className="font-medium">Voltar</span>
          </Link>
        </div>

        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-toolgear-gray-0 mb-4">
            Gestão de Estoque
          </h1>
          <p className="text-xl text-toolgear-gray-75">
            Controle completo do seu estoque com atualização em tempo real
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16 max-w-5xl mx-auto">

          <div className="group bg-gradient-to-br from-toolgear-black-75 to-toolgear-black-125 border border-toolgear-gray-75 rounded-2xl p-8 hover:border-toolgear-purple-25 hover:shadow-toolgear-purple-25/20 hover:shadow-xl transition-all">
            <h3 className="text-xl font-semibold text-toolgear-gray-0 mb-3">
              Estoque Atual
            </h3>
            <p className="text-toolgear-gray-75 mb-6">
              Quantidade total armazenada.
            </p>
            <div className="text-4xl font-bold text-toolgear-purple-25">
              {produtos.reduce((acc, p) => acc + p.estoqueAtual, 0)}
            </div>
          </div>

          <div className="group bg-gradient-to-br from-toolgear-black-75 to-toolgear-black-125 border border-toolgear-gray-75 rounded-2xl p-8 hover:border-toolgear-orange-25 hover:shadow-toolgear-orange-25/20 hover:shadow-xl transition-all">
            <h3 className="text-xl font-semibold text-toolgear-gray-0 mb-3">
              Alertas de Baixa
            </h3>
            <p className="text-toolgear-gray-75 mb-6">
              Produtos abaixo do estoque mínimo.
            </p>
            <div className="text-4xl font-bold text-toolgear-orange-25">
              {produtos.filter((p) => p.estoqueAtual < p.estoqueMinimo).length}
            </div>
          </div>

          <div className="group bg-gradient-to-br from-toolgear-black-75 to-toolgear-black-125 border border-toolgear-gray-75 rounded-2xl p-8 hover:border-toolgear-green-25 hover:shadow-toolgear-green-25/20 hover:shadow-xl transition-all">
            <h3 className="text-xl font-semibold text-toolgear-gray-0 mb-3">
              Movimentações
            </h3>
            <p className="text-toolgear-gray-75 mb-6">
              Histórico de entradas e saídas.
            </p>
            <div className="text-4xl font-bold text-toolgear-green-25">
              156
            </div>
          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-10">

          <div className="bg-toolgear-black-100 border border-toolgear-gray-75 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-toolgear-gray-0 mb-6">
              Produtos em Estoque
            </h2>

            <table className="w-full text-left">
              <thead className="text-toolgear-gray-50 border-b border-toolgear-gray-50">
                <tr>
                  <th className="py-3">Nome</th>
                  <th>Atual</th>
                  <th>Mínimo</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {produtosOrdenados.map((produto) => (
                  <tr
                    key={produto.id}
                    className="text-toolgear-gray-0 border-b border-toolgear-black-75/50"
                  >
                    <td className="py-3">{produto.nome}</td>
                    <td>{produto.estoqueAtual}</td>
                    <td>{produto.estoqueMinimo}</td>
                    <td>
                      <button
                        className="px-3 py-1 text-sm rounded-lg bg-toolgear-purple-75 text-toolgear-gray-0 cursor-pointer hover:bg-toolgear-purple-100 transition"
                        onClick={() => setSelecionado(produto)}
                      >
                        Selecionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-toolgear-black-100 border border-toolgear-gray-75 rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-toolgear-gray-0 mb-6">
              Movimentação de Estoque
            </h2>

            {!selecionado ? (
              <p className="text-toolgear-gray-50">
                Selecione um produto na lista ao lado para iniciar uma movimentação.
              </p>
            ) : (
              <div className="space-y-6">

                <div>
                  <p className="text-toolgear-gray-75 text-sm mb-1">Produto</p>
                  <p className="text-toolgear-gray-0 font-semibold">
                    {selecionado.nome}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                      tipoMov === "entrada"
                        ? "bg-toolgear-green-50 text-toolgear-gray-0 border-toolgear-green-25"
                        : "border-toolgear-gray-75 text-toolgear-gray-0"
                    }`}
                    onClick={() => setTipoMov("entrada")}
                  >
                    <FiArrowUpCircle />
                    Entrada
                  </button>

                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                      tipoMov === "saida"
                        ? "bg-toolgear-orange-50 text-toolgear-gray-0 border-toolgear-orange-25"
                        : "border-toolgear-gray-75 text-toolgear-gray-0"
                    }`}
                    onClick={() => setTipoMov("saida")}
                  >
                    <FiArrowDownCircle />
                    Saída
                  </button>
                </div>

                <div>
                  <label className="text-toolgear-gray-75 text-sm block mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="w-full bg-toolgear-black-75 border border-toolgear-gray-75 rounded-lg px-3 py-2 text-toolgear-gray-0"
                  />
                </div>

                <div>
                  <label className="text-toolgear-gray-75 text-sm block mb-1">
                    Data da Operação
                  </label>
                  <input
                    type="date"
                    value={dataOperacao}
                    onChange={(e) => setDataOperacao(e.target.value)}
                    className="w-full bg-toolgear-black-75 border border-toolgear-gray-75 rounded-lg px-3 py-2 text-toolgear-gray-0"
                  />
                </div>

                {tipoMov === "saida" &&
                  selecionado.estoqueAtual - quantidade < selecionado.estoqueMinimo &&
                  quantidade > 0 && (
                    <div className="text-toolgear-orange-25 font-semibold">
                      ⚠ Atenção: Estoque abaixo do mínimo!
                    </div>
                )}

                <button
                  onClick={registrarMovimentacao}
                  className="w-full py-3 rounded-xl bg-toolgear-purple-75 text-toolgear-gray-0 font-semibold hover:bg-toolgear-purple-100 cursor-pointer transition"
                >
                  Registrar Movimentação
                </button>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}