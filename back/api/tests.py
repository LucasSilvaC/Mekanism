from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Categoria, Produto, Movimentacao

User = get_user_model()


class CategoriaModelTest(TestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(
            nome="Eletrônicos",
            descricao="Produtos eletrônicos"
        )
    
    def test_categoria_creation(self):
        self.assertEqual(self.categoria.nome, "Eletrônicos")
        self.assertEqual(self.categoria.descricao, "Produtos eletrônicos")
    
    def test_categoria_str_representation(self):
        self.assertEqual(str(self.categoria), "Eletrônicos")


class ProdutoModelTest(TestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(nome="Eletrônicos")
        self.produto = Produto.objects.create(
            codigo="ELE001",
            nome="Smartphone",
            categoria=self.categoria,
            quantidade=10,
            unidade="UN",
            preco_custo=1000.00,
            preco_venda=1500.00,
            estoque_minimo=5
        )
    
    def test_produto_creation(self):
        self.assertEqual(self.produto.codigo, "ELE001")
        self.assertEqual(self.produto.nome, "Smartphone")
        self.assertEqual(self.produto.quantidade, 10)
        self.assertEqual(self.produto.unidade, "UN")
        self.assertEqual(self.produto.estoque_minimo, 5)
    
    def test_produto_str_representation(self):
        expected = f"{self.produto.codigo} - {self.produto.nome}"
        self.assertEqual(str(self.produto), expected)
    
    def test_estoque_baixo_property(self):
        self.assertFalse(self.produto.estoque_baixo)
        
        # Criar produto com estoque baixo
        produto_baixo = Produto.objects.create(
            codigo="ELE002",
            nome="Tablet",
            categoria=self.categoria,
            quantidade=3,
            unidade="UN",
            estoque_minimo=5
        )
        self.assertTrue(produto_baixo.estoque_baixo)


class MovimentacaoModelTest(TestCase):
    def setUp(self):
        self.categoria = Categoria.objects.create(nome="Eletrônicos")
        self.produto = Produto.objects.create(
            codigo="ELE001",
            nome="Smartphone",
            categoria=self.categoria,
            quantidade=10,
            unidade="UN"
        )
        self.usuario = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_movimentacao_creation(self):
        movimentacao = Movimentacao.objects.create(
            produto=self.produto,
            tipo='ENTRADA',
            quantidade=5,
            usuario=self.usuario
        )
        self.assertEqual(movimentacao.produto, self.produto)
        self.assertEqual(movimentacao.tipo, 'ENTRADA')
        self.assertEqual(movimentacao.quantidade, 5)
        self.assertEqual(movimentacao.usuario, self.usuario)
    
    def test_movimentacao_str_representation(self):
        movimentacao = Movimentacao.objects.create(
            produto=self.produto,
            tipo='SAIDA',
            quantidade=2,
            usuario=self.usuario
        )
        expected = f"{self.produto.nome} - {movimentacao.tipo} - {movimentacao.quantidade}"
        self.assertEqual(str(movimentacao), expected)
    
    def test_movimentacao_atualiza_estoque_entrada(self):
        quantidade_inicial = self.produto.quantidade
        Movimentacao.objects.create(
            produto=self.produto,
            tipo='ENTRADA',
            quantidade=5,
            usuario=self.usuario
        )
        self.produto.refresh_from_db()
        self.assertEqual(self.produto.quantidade, quantidade_inicial + 5)
    
    def test_movimentacao_atualiza_estoque_saida(self):
        quantidade_inicial = self.produto.quantidade
        Movimentacao.objects.create(
            produto=self.produto,
            tipo='SAIDA',
            quantidade=3,
            usuario=self.usuario
        )
        self.produto.refresh_from_db()
        self.assertEqual(self.produto.quantidade, quantidade_inicial - 3)
    
    def test_movimentacao_atualiza_estoque_ajuste(self):
        Movimentacao.objects.create(
            produto=self.produto,
            tipo='AJUSTE',
            quantidade=20,
            usuario=self.usuario
        )
        self.produto.refresh_from_db()
        self.assertEqual(self.produto.quantidade, 20)


class CategoriaAPITest(APITestCase):
    def setUp(self):
        self.usuario = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.usuario)
    
    def test_list_categorias(self):
        Categoria.objects.create(nome="Eletrônicos")
        Categoria.objects.create(nome="Móveis")
        
        response = self.client.get('/estoque/categorias/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)
    
    def test_create_categoria(self):
        data = {
            'nome': 'Categoria Teste',
            'descricao': 'Descrição da categoria teste'
        }
        response = self.client.post('/estoque/categorias/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Categoria.objects.count(), 1)
        self.assertEqual(Categoria.objects.get().nome, 'Categoria Teste')


class ProdutoAPITest(APITestCase):
    def setUp(self):
        self.usuario = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.usuario)
        self.categoria = Categoria.objects.create(nome="Eletrônicos")
    
    def test_list_produtos(self):
        Produto.objects.create(
            codigo="ELE001",
            nome="Smartphone",
            categoria=self.categoria,
            quantidade=10,
            unidade="UN"
        )
        
        response = self.client.get('/estoque/produtos/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_produto(self):
        data = {
            'codigo': 'PROD001',
            'nome': 'Produto Teste',
            'categoria': self.categoria.id,
            'quantidade': 10,
            'unidade': 'UN',
            'estoque_minimo': 5
        }
        response = self.client.post('/estoque/produtos/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Produto.objects.count(), 1)
        self.assertEqual(Produto.objects.get().nome, 'Produto Teste')
    
    def test_ajustar_estoque(self):
        produto = Produto.objects.create(
            codigo="ELE001",
            nome="Smartphone",
            categoria=self.categoria,
            quantidade=10,
            unidade="UN"
        )
        
        data = {'quantidade': 20}
        response = self.client.post(f'/estoque/produtos/{produto.id}/ajustar_estoque/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        produto.refresh_from_db()
        self.assertEqual(produto.quantidade, 20)


class MovimentacaoAPITest(APITestCase):
    def setUp(self):
        self.usuario = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.usuario)
        self.categoria = Categoria.objects.create(nome="Eletrônicos")
        self.produto = Produto.objects.create(
            codigo="ELE001",
            nome="Smartphone",
            categoria=self.categoria,
            quantidade=10,
            unidade="UN"
        )
    
    def test_list_movimentacoes(self):
        Movimentacao.objects.create(
            produto=self.produto,
            tipo='ENTRADA',
            quantidade=5,
            usuario=self.usuario
        )
        
        response = self.client.get('/estoque/movimentacoes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
    
    def test_create_movimentacao(self):
        data = {
            'produto': self.produto.id,
            'tipo': 'ENTRADA',
            'quantidade': 5,
            'observacao': 'Teste de entrada'
        }
        response = self.client.post('/estoque/movimentacoes/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Movimentacao.objects.count(), 1)
        
        # Verificar se o estoque foi atualizado
        self.produto.refresh_from_db()
        self.assertEqual(self.produto.quantidade, 15)