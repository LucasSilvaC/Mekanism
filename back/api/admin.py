from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Categoria, Produto, Movimentacao


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'is_staff', 'created_at')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'created_at')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)
    
    fieldsets = UserAdmin.fieldsets + (
        ('Informações Adicionais', {'fields': ('telefone',)}),
    )


@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'descricao', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('nome', 'descricao')
    ordering = ('nome',)


@admin.register(Produto)
class ProdutoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nome', 'categoria', 'quantidade', 'unidade', 'estoque_minimo', 'ativo', 'created_at')
    list_filter = ('categoria', 'unidade', 'ativo', 'created_at')
    search_fields = ('codigo', 'nome', 'descricao')
    ordering = ('nome',)
    list_editable = ('ativo',)
    
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('codigo', 'nome', 'descricao', 'categoria')
        }),
        ('Estoque', {
            'fields': ('quantidade', 'unidade', 'estoque_minimo')
        }),
        ('Preços', {
            'fields': ('preco_custo', 'preco_venda')
        }),
        ('Status', {
            'fields': ('ativo',)
        }),
    )
@admin.register(Movimentacao)
class MovimentacaoAdmin(admin.ModelAdmin):
    list_display = ('produto', 'tipo', 'quantidade', 'usuario', 'created_at')
    list_filter = ('tipo', 'created_at', 'produto__categoria')
    search_fields = ('produto__nome', 'observacao', 'usuario__email')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
    
    fieldsets = (
        ('Informações da Movimentação', {
            'fields': ('produto', 'tipo', 'quantidade', 'observacao')
        }),
        ('Informações do Sistema', {
            'fields': ('usuario', 'created_at')
        }),
    )