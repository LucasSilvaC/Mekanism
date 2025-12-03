from django.apps import AppConfig


class EstoqueConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
    verbose_name = 'Sistema de gestão de ferramentas'
    
    def ready(self):
        import api.signals