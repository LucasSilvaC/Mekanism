from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'categorias', views.CategoriaViewSet)
router.register(r'produtos', views.ProdutoViewSet)
router.register(r'movimentacoes', views.MovimentacaoViewSet)
router.register(r'dashboard', views.DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('auth/', include('api.auth_urls')), 
    
    path('', include(router.urls)),
]