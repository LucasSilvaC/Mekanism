from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Categoria, Produto, Movimentacao

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']
        read_only_fields = ['id', 'is_staff']


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'descricao', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class ProdutoSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    estoque_baixo = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Produto
        fields = [
            'id', 'codigo', 'nome', 'descricao', 'categoria', 'categoria_nome',
            'quantidade', 'unidade', 'preco_custo', 'preco_venda', 
            'estoque_minimo', 'ativo', 'estoque_baixo', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'estoque_baixo']
    
    def validate_quantidade(self, value):
        if value < 0:
            raise serializers.ValidationError("A quantidade não pode ser negativa.")
        return value
    
    def validate_estoque_minimo(self, value):
        if value < 0:
            raise serializers.ValidationError("O estoque mínimo não pode ser negativo.")
        return value


class ProdutoListSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    estoque_baixo = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Produto
        fields = [
            'id', 'codigo', 'nome', 'categoria_nome', 'quantidade', 
            'unidade', 'estoque_minimo', 'estoque_baixo'
        ]


class MovimentacaoSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    usuario_nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    
    class Meta:
        model = Movimentacao
        fields = [
            'id', 'produto', 'produto_nome', 'tipo', 'quantidade', 
            'observacao', 'usuario', 'usuario_nome', 'created_at'
        ]
        read_only_fields = ['created_at', 'usuario']
    
    def validate_quantidade(self, value):
        if value <= 0:
            raise serializers.ValidationError("A quantidade deve ser maior que zero.")
        return value
    
    def create(self, validated_data):
        # Define o usuário automaticamente se não for fornecido
        if 'usuario' not in validated_data:
            validated_data['usuario'] = self.context['request'].user
        return super().create(validated_data)


class MovimentacaoListSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    usuario_nome = serializers.CharField(source='usuario.get_full_name', read_only=True)
    
    class Meta:
        model = Movimentacao
        fields = [
            'id', 'produto_nome', 'tipo', 'quantidade', 
            'usuario_nome', 'created_at'
        ]