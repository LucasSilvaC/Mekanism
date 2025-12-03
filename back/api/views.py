from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, F
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.contrib.auth import get_user_model
from .models import Categoria, Produto, Movimentacao
from .serializers import (
    CategoriaSerializer, ProdutoSerializer, ProdutoListSerializer,
    MovimentacaoSerializer, MovimentacaoListSerializer, UserSerializer
)

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    email = request.data.get('email')
    password = request.data.get('password')
    username = request.data.get('username')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    if not email or not password or not username:
        return Response(
            {'error': 'Email, senha e usuário são obrigatórios'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Este email já está em uso'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Este usuário já está em uso'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )
    
    serializer = UserSerializer(user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    user = request.user
    data = request.data
    
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.email = data.get('email', user.email)
    user.username = data.get('username', user.username)
    user.telefone = data.get('telefone', user.telefone)
    
    user.save()
    
    serializer = UserSerializer(user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_user_password(request):
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response(
            {'error': 'Senha atual e nova senha são obrigatórias'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not request.user.check_password(old_password):
        return Response(
            {'error': 'Senha atual incorreta'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    request.user.set_password(new_password)
    request.user.save()
    
    return Response({'message': 'Senha alterada com sucesso'})

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['nome']
    search_fields = ['nome', 'descricao']
    ordering_fields = ['nome', 'created_at']
    ordering = ['nome']


class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['categoria', 'unidade', 'ativo']
    search_fields = ['codigo', 'nome', 'descricao']
    ordering_fields = ['nome', 'quantidade', 'preco_venda', 'created_at']
    ordering = ['nome']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProdutoListSerializer
        return ProdutoSerializer
    
    def get_queryset(self):
        queryset = Produto.objects.all()
        
        estoque_baixo = self.request.query_params.get('estoque_baixo', None)
        if estoque_baixo is not None:
            queryset = queryset.filter(quantidade__lte=F('estoque_minimo'))
        
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(codigo__icontains=search) |
                Q(nome__icontains=search) |
                Q(descricao__icontains=search)
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def baixo_estoque(self, request):
        produtos = self.get_queryset().filter(quantidade__lte=F('estoque_minimo'))
        serializer = self.get_serializer(produtos, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def ajustar_estoque(self, request, pk=None):
        produto = self.get_object()
        quantidade = request.data.get('quantidade')
        
        if quantidade is None:
            return Response(
                {'error': 'Quantidade é obrigatória'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            quantidade = float(quantidade)
        except ValueError:
            return Response(
                {'error': 'Quantidade deve ser um número válido'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if quantidade < 0:
            return Response(
                {'error': 'Quantidade não pode ser negativa'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        movimentacao = Movimentacao.objects.create(
            produto=produto,
            tipo='AJUSTE',
            quantidade=quantidade,
            observacao=f'Ajuste de estoque realizado por {request.user.get_full_name()}',
            usuario=request.user
        )
        
        produto.quantidade = quantidade
        produto.save()
        
        serializer = ProdutoSerializer(produto)
        return Response(serializer.data)


class MovimentacaoViewSet(viewsets.ModelViewSet):
    queryset = Movimentacao.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['tipo', 'produto']
    search_fields = ['produto__nome', 'observacao']
    ordering_fields = ['created_at', 'quantidade']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return MovimentacaoListSerializer
        return MovimentacaoSerializer
    
    def get_queryset(self):
        queryset = Movimentacao.objects.all()
        
        # Filtrar por período
        data_inicio = self.request.query_params.get('data_inicio', None)
        data_fim = self.request.query_params.get('data_fim', None)
        
        if data_inicio:
            queryset = queryset.filter(created_at__date__gte=data_inicio)
        if data_fim:
            queryset = queryset.filter(created_at__date__lte=data_fim)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    
    def list(self, request):
        total_produtos = Produto.objects.count()
        produtos_ativos = Produto.objects.filter(ativo=True).count()
        categorias = Categoria.objects.count()
        movimentacoes_hoje = Movimentacao.objects.filter(
            created_at__date=timezone.now().date()
        ).count()
        produtos_baixo_estoque = Produto.objects.filter(
            quantidade__lte=F('estoque_minimo')
        ).count()
        
        from django.db.models import Count, Sum
        produtos_mais_movimentados = Movimentacao.objects.filter(
            created_at__gte=timezone.now() - timezone.timedelta(days=30)
        ).values('produto__nome').annotate(
            total_movimentado=Sum('quantidade')
        ).order_by('-total_movimentado')[:5]
        
        return Response({
            'total_produtos': total_produtos,
            'produtos_ativos': produtos_ativos,
            'categorias': categorias,
            'movimentacoes_hoje': movimentacoes_hoje,
            'produtos_baixo_estoque': produtos_baixo_estoque,
            'produtos_mais_movimentados': list(produtos_mais_movimentados)
        })
    
# NO FINAL do seu arquivo api/views.py, adicione:



@api_view(['POST'])
@permission_classes([AllowAny])
def custom_login(request):
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Autentica usando email
    user = authenticate(username=email, password=password)
    
    if user:
        # Gera tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        })
    
    return Response(
        {'error': 'Credenciais inválidas'},
        status=status.HTTP_401_UNAUTHORIZED
    )