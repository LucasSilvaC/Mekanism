"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/organisms/header";
import Link from "next/link";
import { HiArrowLeft } from "react-icons/hi2";
import { FiArrowDownCircle, FiArrowUpCircle } from "react-icons/fi";
import { toast } from "react-toastify";

// Interface para produto do backend
interface BackendProduto {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  categoria: number;
  categoria_nome: string;
  quantidade: string;
  unidade: string;
  preco_custo: string;
  preco_venda: string;
  estoque_minimo: string;
  ativo: boolean;
  estoque_baixo: boolean;
  created_at: string;
  updated_at: string;
}

// Interface para movimentação do backend
interface BackendMovimentacao {
  id: number;
  produto: number;
  produto_nome: string;
  tipo: string;
  quantidade: string;
  observacao: string;
  usuario: number;
  usuario_nome: string;
  created_at: string;
}

export type ProdutoEstoque = {
  id: string;
  nome: string;
  estoqueAtual: number;
  estoqueMinimo: number;
};


export default function EstoquePage() {
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<BackendMovimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMovimentacao, setLoadingMovimentacao] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selecionado, setSelecionado] = useState<ProdutoEstoque | null>(null);

  const [tipoMov, setTipoMov] = useState<"entrada" | "saida" | "ajuste">("entrada");
  const [quantidade, setQuantidade] = useState<number>(0);
  const [dataOperacao, setDataOperacao] = useState<string>("");

  // Função para fazer requisições autenticadas
  const apiRequest = async (endpoint: string, options: any = {}) => {
    const token = localStorage.getItem('access_token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/${endpoint}`, {
        ...options,
        headers,
      });
      
      // Se token expirou, tenta renovar
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const refreshResponse = await fetch('http://localhost:8000/api/auth/login/refresh/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refresh: refreshToken }),
            });
            
            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              localStorage.setItem('access_token', refreshData.access);
              
              // Tenta a requisição original novamente
              headers['Authorization'] = `Bearer ${refreshData.access}`;
              return fetch(`http://localhost:8000/api/${endpoint}`, {
                ...options,
                headers,
              });
            }
          } catch (error) {
            // Se não conseguir renovar, faz logout
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return response;
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  };

  // Carregar dados
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar produtos
      const productsResponse = await apiRequest('produtos/');
      
      if (!productsResponse.ok) {
        const errorData = await productsResponse.json();
        console.error('API error:', errorData);
        let errorMessage = 'Erro ao carregar produtos';
        
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
        
        setError(errorMessage);
        return;
      }
      
      const productsData = await productsResponse.json();
      
      // Verificar se a resposta tem o formato paginado do DRF
      if (productsData.results && Array.isArray(productsData.results)) {
        const productsArray = productsData.results;
        
        // Transformar dados do backend para o formato do frontend
        const transformedProducts = productsArray.map((prod: BackendProduto): ProdutoEstoque => ({
          id: prod.id.toString(),
          nome: prod.nome,
          estoqueAtual: Number(prod.quantidade),
          estoqueMinimo: Number(prod.estoque_minimo),
        }));
        
        setProdutos(transformedProducts);
      } else {
        console.error('Unexpected products response format:', productsData);
        setError('Formato de resposta de produtos inválido');
      }
      
      // Carregar movimentações
      const movimentacoesResponse = await apiRequest('movimentacoes/');
      
      if (movimentacoesResponse.ok) {
        const movimentacoesData = await movimentacoesResponse.json();
        
        if (movimentacoesData.results && Array.isArray(movimentacoesData.results)) {
          setMovimentacoes(movimentacoesData.results);
        }
      } else {
        console.warn('Failed to load movimentações:', movimentacoesResponse.status);
        // Não mostrar erro para movimentações, pois pode ser que ainda não tenha nenhuma
      }
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro de conexão com o servidor. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // ✔ Ordenação alfabética – RF24 / RF25
  const produtosOrdenados = useMemo(() => {
    return [...produtos].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [produtos]);

  const registrarMovimentacao = async () => {
    if (!selecionado) {
      toast.error("Selecione um produto primeiro");
      return;
    }

    const qtd = Number(quantidade);
    if (qtd <= 0) {
      toast.error("Quantidade deve ser maior que zero");
      return;
    }

    // Validação específica para ajuste
    if (tipoMov === "ajuste" && qtd < 0) {
      toast.error("Quantidade de ajuste não pode ser negativa");
      return;
    }

    // Validação para saída: verificar se tem estoque suficiente
    if (tipoMov === "saida" && selecionado.estoqueAtual < qtd) {
      toast.error(`Estoque insuficiente. Disponível: ${selecionado.estoqueAtual}`);
      return;
    }

    setLoadingMovimentacao(true);
    
    try {
      // Enviar movimentação para o backend
      const movimentacaoData = {
        produto: parseInt(selecionado.id),
        tipo: tipoMov.toUpperCase(),
        quantidade: qtd,
        observacao: `Movimentação de ${tipoMov} realizada por ${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).username : 'usuário'}`,
      };

      const response = await apiRequest('movimentacoes/', {
        method: 'POST',
        body: JSON.stringify(movimentacaoData),
      });

      if (response.ok) {
        // Movimentação criada com sucesso
        const movimentacao = await response.json();
        
        // Atualizar o estoque local baseado no tipo de movimentação
        const atualizado = produtos.map((p) => {
          if (p.id !== selecionado.id) return p;

          let novoEstoque = p.estoqueAtual;
          if (tipoMov === "entrada") {
            novoEstoque = p.estoqueAtual + qtd;
          } else if (tipoMov === "saida") {
            novoEstoque = p.estoqueAtual - qtd;
          } else if (tipoMov === "ajuste") {
            novoEstoque = qtd;
          }

          return { ...p, estoqueAtual: novoEstoque };
        });

        setProdutos(atualizado);
        setSelecionado({ ...selecionado, estoqueAtual: atualizado.find(p => p.id === selecionado.id)!.estoqueAtual });

        // Recarregar movimentações e produtos para garantir dados atualizados
        await fetchData();

        const tipoTexto = tipoMov === "entrada" ? "entrada" : tipoMov === "saida" ? "saída" : "ajuste";
        toast.success(`Movimentação de ${tipoTexto} registrada com sucesso!`);
        
        setQuantidade(0);
        setDataOperacao("");
      } else {
        const errorData = await response.json();
        let errorMessage = 'Erro ao registrar movimentação';
        
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.tipo) {
          errorMessage = `Erro: ${errorData.tipo.join(', ')}`;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(', ');
        }
        
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      toast.error("Erro de conexão com o servidor. Verifique sua conexão e tente novamente.");
    } finally {
      setLoadingMovimentacao(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-toolgear-black-125">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-toolgear-gray-50">Carregando...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-toolgear-black-125">
        <Header />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
          <div className="text-toolgear-red-25 text-xl font-semibold mb-4">
            Erro ao carregar dados
          </div>
          <div className="text-toolgear-gray-50 text-center mb-6 max-w-md">
            {error}
          </div>
          <button
            onClick={() => {
              setError(null);
              setRetryCount(0);
              fetchData();
            }}
            className="px-6 py-2 bg-toolgear-purple-75 text-toolgear-gray-0 rounded-lg hover:bg-toolgear-purple-100 transition"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

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
              {movimentacoes.length}
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
                {produtosOrdenados.length > 0 ? (
                  produtosOrdenados.map((produto) => (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-toolgear-gray-50">
                      Nenhum produto encontrado no estoque
                    </td>
                  </tr>
                )}
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

                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
                      tipoMov === "ajuste"
                        ? "bg-toolgear-blue-50 text-toolgear-gray-0 border-toolgear-blue-25"
                        : "border-toolgear-gray-75 text-toolgear-gray-0"
                    }`}
                    onClick={() => setTipoMov("ajuste")}
                  >
                    ⚙️
                    Ajuste
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

                {tipoMov === "ajuste" && (
                  <div className="text-toolgear-blue-25 text-sm">
                    💡 Ajuste define o novo estoque para o valor informado
                  </div>
                )}

                <button
                  onClick={registrarMovimentacao}
                  disabled={loadingMovimentacao}
                  className="w-full py-3 rounded-xl bg-toolgear-purple-75 text-toolgear-gray-0 font-semibold hover:bg-toolgear-purple-100 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMovimentacao ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Registrando...
                    </span>
                  ) : (
                    'Registrar Movimentação'
                  )}
                </button>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}