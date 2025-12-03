"use client";

import Header from "@/components/organisms/header";
import Link from "next/link";
import { DataTable } from "@/components/organisms/data-table";
import { createColumns, Produto } from "@/components/molecules/columns";
import { FiArrowLeft, FiX, FiSave, FiPlus } from "react-icons/fi";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

// Interface para produto do backend
interface BackendProduto {
  id: number;
  codigo: string;
  nome: string;
  descricao: string;
  categoria: number;
  categoria_nome: string;
  quantidade: number;
  unidade: string;
  preco_custo: string;
  preco_venda: string;
  estoque_minimo: number;
  ativo: boolean;
  estoque_baixo: boolean;
  created_at: string;
  updated_at: string;
}

// Categorias fixas (bloqueadas) - baseado nas que você tinha
const CATEGORIAS_FIXAS = [
  { id: 1, nome: "Ferramentas" },
  { id: 2, nome: "Peças" },
  { id: 3, nome: "Elétrica" },
  { id: 4, nome: "Hidráulica" },
  { id: 5, nome: "EPI" },
  { id: 6, nome: "Madeira" },
  { id: 7, nome: "Metais" },
  { id: 8, nome: "Químicos" },
];

export default function ProdutosPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [products, setProducts] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_produtos: 0,
    produtos_ativos: 0,
    categorias: 0,
    produtos_baixo_estoque: 0,
  });

  // Estado para o formulário simplificado
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    quantidade: "",
    estoque_minimo: "",
  });

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
    
    const response = await fetch(`http://localhost:8000/api/${endpoint}`, {
      ...options,
      headers,
    });
    
    // Se token expirou, tenta renovar
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const refreshResponse = await fetch('http://localhost:8000/api/token/refresh/', {
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
  };

  // Carregar produtos
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Carregar produtos
      const productsResponse = await apiRequest('produtos/');
      
      // Verificar se a resposta foi bem-sucedida
      if (!productsResponse.ok) {
        const errorData = await productsResponse.json();
        console.error('API error:', errorData);
        toast.error(`Erro ao carregar produtos: ${errorData.detail || 'Erro desconhecido'}`);
        return;
      }
      
      const productsData = await productsResponse.json();
      
      // Verificar se a resposta tem o formato paginado do DRF
      if (productsData.results && Array.isArray(productsData.results)) {
        // Usar o array de resultados
        const productsArray = productsData.results;
        console.log('Products array:', productsArray);
        
        // Transformar dados do backend para o formato do frontend
        const transformedProducts = productsArray.map((prod: BackendProduto): Produto => {
        // Encontrar o nome da categoria fixa pelo ID
        const categoria = CATEGORIAS_FIXAS.find(cat => cat.id === prod.categoria);
        const tipo = categoria ? categoria.nome : "Sem categoria";
        
        return {
          id: prod.id.toString(),
          nome: prod.nome,
          tipo: tipo,
          peso: "-",
          tamanho: "-",
          estoqueAtual: Number(prod.quantidade),
          estoqueMinimo: Number(prod.estoque_minimo),
        };
      });
      
      setProducts(transformedProducts);
    } else {
      // Se não for formato paginado, tenta usar os dados diretamente
      console.log('Direct products data:', productsData);
      const productsArray = Array.isArray(productsData) ? productsData : [productsData];
      
      const transformedProducts = productsArray.map((prod: BackendProduto): Produto => {
        // Encontrar o nome da categoria fixa pelo ID
        const categoria = CATEGORIAS_FIXAS.find(cat => cat.id === prod.categoria);
        const tipo = categoria ? categoria.nome : "Sem categoria";
        
        return {
          id: prod.id.toString(),
          nome: prod.nome,
          tipo: tipo,
          peso: "-",
          tamanho: "-",
          estoqueAtual: Number(prod.quantidade),
          estoqueMinimo: Number(prod.estoque_minimo),
        };
      });
      
      setProducts(transformedProducts);
    }
    
    // Carregar estatísticas do dashboard
    const statsResponse = await apiRequest('dashboard/');
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      setStats({
        total_produtos: statsData.total_produtos || 0,
        produtos_ativos: statsData.produtos_ativos || 0,
        categorias: CATEGORIAS_FIXAS.length, // Usa o número de categorias fixas
        produtos_baixo_estoque: statsData.produtos_baixo_estoque || 0,
      });
    } else {
      console.error('Failed to load stats:', await statsResponse.text());
      // Usar valores padrão se falhar
      setStats({
        total_produtos: 0,
        produtos_ativos: 0,
        categorias: CATEGORIAS_FIXAS.length,
        produtos_baixo_estoque: 0,
      });
    }
    
  } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do servidor');
    } finally {
      setLoading(false);
    }
  };

  // Limpar formulário
  const clearForm = () => {
    setFormData({
      nome: "",
      categoria: "",
      quantidade: "",
      estoque_minimo: "",
    });
  };

  // Abrir modal de adicionar
  const handleAdd = () => {
    clearForm();
    setShowAddModal(true);
  };

  // Abrir modal de editar
  const handleEdit = async (product: Produto) => {
    try {
      // Buscar dados completos do produto
      const response = await apiRequest(`produtos/${product.id}/`);
      const produtoData: BackendProduto = await response.json();
      
      // Encontrar a categoria correspondente
      const categoriaEncontrada = CATEGORIAS_FIXAS.find(cat => 
        cat.nome === product.tipo || cat.id === produtoData.categoria
      );
      
      // Preencher form apenas com os campos visíveis na tabela
      setFormData({
        nome: produtoData.nome,
        categoria: categoriaEncontrada ? categoriaEncontrada.id.toString() : "1", // Default para primeira categoria
        quantidade: produtoData.quantidade.toString(),
        estoque_minimo: produtoData.estoque_minimo.toString(),
      });
      
      setSelectedProduct(product);
      setShowEditModal(true);
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      toast.error('Erro ao carregar dados do produto');
    }
  };

  // Deletar produto
  const handleDelete = async (product: Produto) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.nome}"?`)) {
      try {
        const response = await apiRequest(`produtos/${product.id}/`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          toast.success(`Produto "${product.nome}" excluído com sucesso!`);
          // Atualizar lista de produtos
          fetchData();
        } else {
          toast.error('Erro ao excluir produto');
        }
      } catch (error) {
        console.error('Erro ao deletar:', error);
        toast.error('Erro ao excluir produto');
      }
    }
  };

  // Salvar produto (criar ou atualizar)
  const handleSave = async (isEdit: boolean) => {
    // Validações básicas
    if (!formData.nome || !formData.categoria) {
      toast.error("Preencha os campos obrigatórios!");
      return;
    }

    try {
      // Encontrar a categoria selecionada
      const categoriaSelecionada = CATEGORIAS_FIXAS.find(
        cat => cat.id.toString() === formData.categoria
      );
      
      if (!categoriaSelecionada) {
        toast.error("Categoria inválida!");
        return;
      }

      // Gerar código automático
      const codigo = `PROD-${Date.now()}-${formData.nome.substring(0, 3).toUpperCase()}`;
      
      // Preparar dados para enviar
      const produtoData = {
        codigo: codigo,
        nome: formData.nome,
        descricao: `Produto: ${formData.nome}`,
        categoria: categoriaSelecionada.id, // Usa o ID da categoria fixa
        quantidade: parseFloat(formData.quantidade) || 0,
        unidade: "UN",
        preco_custo: 0,
        preco_venda: 0,
        estoque_minimo: parseFloat(formData.estoque_minimo) || 0,
        ativo: true,
      };

      let response;
      
      if (isEdit && selectedProduct) {
        // Editar produto existente - manter valores originais dos campos não editáveis
        const existingResponse = await apiRequest(`produtos/${selectedProduct.id}/`);
        const existingData = await existingResponse.json();
        
        produtoData.codigo = existingData.codigo; // Mantém o código original
        produtoData.descricao = existingData.descricao; // Mantém a descrição original
        produtoData.unidade = existingData.unidade; // Mantém a unidade original
        produtoData.preco_custo = parseFloat(existingData.preco_custo); // Mantém preço custo
        produtoData.preco_venda = parseFloat(existingData.preco_venda); // Mantém preço venda
        
        response = await apiRequest(`produtos/${selectedProduct.id}/`, {
          method: 'PUT',
          body: JSON.stringify(produtoData),
        });
      } else {
        // Criar novo produto
        response = await apiRequest('produtos/', {
          method: 'POST',
          body: JSON.stringify(produtoData),
        });
      }

      const data = await response.json();

      if (response.ok) {
        toast.success(isEdit ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!");
        
        if (isEdit) {
          setShowEditModal(false);
        } else {
          setShowAddModal(false);
        }
        
        clearForm();
        
        // Recarregar lista de produtos
        fetchData();
      } else {
        // Mostrar erros de validação
        const errorMessages = Object.values(data).flat().join(', ');
        toast.error(errorMessages || "Erro ao salvar produto");
      }
      
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error("Erro de conexão com o servidor");
    }
  };

  // Criar colunas com callbacks
  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
  });

  // Modal de Adicionar Produto SIMPLIFICADA
  const AddProductModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-toolgear-black-100 border border-toolgear-gray-75 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-toolgear-gray-0">
              Adicionar Novo Produto
            </h2>
            <button
              onClick={() => setShowAddModal(false)}
              className="p-2 rounded-lg hover:bg-toolgear-black-75 transition-colors"
            >
              <FiX className="w-6 h-6 text-toolgear-gray-50" />
            </button>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(false); }}>
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-toolgear-gray-0 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="w-full bg-toolgear-black-125 border border-toolgear-gray-75 rounded-xl px-4 py-3 text-toolgear-gray-0 outline-none focus:border-toolgear-purple-25 transition-colors"
                placeholder="Ex: Chave de Fenda Phillips"
                required
              />
            </div>

            {/* Categoria - SELECT COM DADOS BLOQUEADOS */}
            <div>
              <label className="block text-sm font-medium text-toolgear-gray-0 mb-2">
                Categoria *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
                className="w-full bg-toolgear-black-125 border border-toolgear-gray-75 rounded-xl px-4 py-3 text-toolgear-gray-0 outline-none focus:border-toolgear-purple-25 transition-colors"
                required
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIAS_FIXAS.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
              <p className="text-xs text-toolgear-gray-50 mt-1">
                Categorias pré-definidas do sistema
              </p>
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-toolgear-gray-0 mb-2">
                Quantidade Inicial
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantidade}
                onChange={(e) =>
                  setFormData({ ...formData, quantidade: e.target.value })
                }
                className="w-full bg-toolgear-black-125 border border-toolgear-gray-75 rounded-xl px-4 py-3 text-toolgear-gray-0 outline-none focus:border-toolgear-purple-25 transition-colors"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Estoque Mínimo */}
            <div>
              <label className="block text-sm font-medium text-toolgear-gray-0 mb-2">
                Estoque Mínimo
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.estoque_minimo}
                onChange={(e) =>
                  setFormData({ ...formData, estoque_minimo: e.target.value })
                }
                className="w-full bg-toolgear-black-125 border border-toolgear-gray-75 rounded-xl px-4 py-3 text-toolgear-gray-0 outline-none focus:border-toolgear-purple-25 transition-colors"
                placeholder="10"
                min="0"
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-4 pt-4 border-t border-toolgear-gray-75">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-6 py-3 rounded-xl border border-toolgear-gray-75 text-toolgear-gray-0 hover:bg-toolgear-black-75 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-toolgear-purple-25 hover:bg-toolgear-purple-50 text-toolgear-black-125 font-semibold transition-colors flex items-center gap-2"
              >
                <FiPlus className="w-5 h-5" />
                Adicionar Produto
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Modal de Editar Produto SIMPLIFICADA
  const EditProductModal = () => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-toolgear-black-100 border border-toolgear-gray-75 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-toolgear-gray-0">
              Editar Produto
            </h2>
            <button
              onClick={() => setShowEditModal(false)}
              className="p-2 rounded-lg hover:bg-toolgear-black-75 transition-colors"
            >
              <FiX className="w-6 h-6 text-toolgear-gray-50" />
            </button>
          </div>

          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSave(true); }}>
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-toolgear-gray-0 mb-2">
                Nome do Produto *
              </label>
              <input
                type="text"
                value={formData.nome}
                onChange={(e) =>
                  setFormData({ ...formData, nome: e.target.value })
                }
                className="w-full bg-toolgear-black-125 border border-toolgear-gray-75 rounded-xl px-4 py-3 text-toolgear-gray-0 outline-none focus:border-toolgear-purple-25 transition-colors"
                required
              />
            </div>

            {/* Categoria - SELECT COM DADOS BLOQUEADOS */}
            <div>
              <label className="block text-sm font-medium text-toolgear-gray-0 mb-2">
                Categoria *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) =>
                  setFormData({ ...formData, categoria: e.target.value })
                }
                className="w-full bg-toolgear-black-125 border border-toolgear-gray-75 rounded-xl px-4 py-3 text-toolgear-gray-0 outline-none focus:border-toolgear-purple-25 transition-colors"
                required
              >
                <option value="">Selecione uma categoria</option>
                {CATEGORIAS_FIXAS.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nome}
                  </option>
                ))}
              </select>
              <p className="text-xs text-toolgear-gray-50 mt-1">
                Categorias pré-definidas do sistema
              </p>
            </div>

            {/* Quantidade */}
            <div>
              <label className="block text-sm font-medium text-toolgear-gray-0 mb-2">
                Quantidade
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantidade}
                onChange={(e) =>
                  setFormData({ ...formData, quantidade: e.target.value })
                }
                className="w-full bg-toolgear-black-125 border border-toolgear-gray-75 rounded-xl px-4 py-3 text-toolgear-gray-0 outline-none focus:border-toolgear-purple-25 transition-colors"
                min="0"
              />
            </div>

            {/* Estoque Mínimo */}
            <div>
              <label className="block text-sm font-medium text-toolgear-gray-0 mb-2">
                Estoque Mínimo
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.estoque_minimo}
                onChange={(e) =>
                  setFormData({ ...formData, estoque_minimo: e.target.value })
                }
                className="w-full bg-toolgear-black-125 border border-toolgear-gray-75 rounded-xl px-4 py-3 text-toolgear-gray-0 outline-none focus:border-toolgear-purple-25 transition-colors"
                min="0"
              />
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-4 pt-4 border-t border-toolgear-gray-75">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 rounded-xl border border-toolgear-gray-75 text-toolgear-gray-0 hover:bg-toolgear-black-75 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-toolgear-purple-25 hover:bg-toolgear-purple-50 text-toolgear-black-125 font-semibold transition-colors flex items-center gap-2"
              >
                <FiSave className="w-5 h-5" />
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-toolgear-black-75 to-toolgear-black-125 border border-toolgear-gray-75 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-toolgear-gray-0 mb-2">
                Total de Produtos
              </h3>
              <p className="text-toolgear-gray-75 mb-5 text-sm">
                Produtos cadastrados no sistema.
              </p>
              <div className="text-4xl font-bold text-toolgear-green-25">
                {stats.total_produtos}
              </div>
              <div className="text-sm text-toolgear-gray-50 mt-1">Ativos: {stats.produtos_ativos}</div>
            </div>

            <div className="bg-gradient-to-br from-toolgear-black-75 to-toolgear-black-125 border border-toolgear-gray-75 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-toolgear-gray-0 mb-2">
                Categorias
              </h3>
              <p className="text-toolgear-gray-75 mb-5 text-sm">
                Organização por categorias.
              </p>
              <div className="text-4xl font-bold text-toolgear-purple-25">
                {CATEGORIAS_FIXAS.length}
              </div>
              <div className="text-sm text-toolgear-gray-50 mt-1">
                Categorias pré-definidas
              </div>
            </div>

            <div className="bg-gradient-to-br from-toolgear-black-75 to-toolgear-black-125 border border-toolgear-gray-75 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-toolgear-gray-0 mb-2">
                Baixo Estoque
              </h3>
              <p className="text-toolgear-gray-75 mb-5 text-sm">
                Produtos com estoque crítico.
              </p>
              <div className="text-4xl font-bold text-toolgear-red-25">
                {stats.produtos_baixo_estoque}
              </div>
              <div className="text-sm text-toolgear-gray-50 mt-1">Produtos</div>
            </div>

            <div className="bg-gradient-to-br from-toolgear-black-75 to-toolgear-black-125 border border-toolgear-gray-75 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-toolgear-gray-0 mb-2">
                Novos Hoje
              </h3>
              <p className="text-toolgear-gray-75 mb-5 text-sm">
                Produtos cadastrados recentemente.
              </p>
              <div className="text-4xl font-bold text-toolgear-blue-25">0</div>
              <div className="text-sm text-toolgear-gray-50 mt-1">Hoje</div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full mt-20">
          <h2 className="text-2xl font-bold text-toolgear-gray-0 mb-6">
            Lista de Produtos ({products.length})
          </h2>

          <DataTable
            columns={columns}
            data={products}
            onAdd={handleAdd}
          />
        </div>
      </main>

      {/* Modais simplificadas */}
      {showAddModal && <AddProductModal />}
      {showEditModal && <EditProductModal />}
    </div>
  );
}