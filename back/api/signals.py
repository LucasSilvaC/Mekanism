from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Produto, Movimentacao


@receiver(post_save, sender=Produto)
def verificar_estoque_baixo(sender, instance, created, **kwargs):
    """Verifica se o estoque está baixo após salvar um produto"""
    if instance.estoque_baixo and instance.quantidade > 0:
        # Enviar notificação de estoque baixo
        subject = f"Alerta de Estoque Baixo - {instance.nome}"
        message = f"""
        Prezado(a) administrador(a),
        
        O produto abaixo atingiu o estoque mínimo:
        
        Produto: {instance.nome}
        Código: {instance.codigo}
        Quantidade atual: {instance.quantidade}
        Estoque mínimo: {instance.estoque_minimo}
        Categoria: {instance.categoria.nome}
        
        Por favor, realize um novo pedido ou ajuste o estoque mínimo.
        
        Atenciosamente,
        Sistema de Estoque
        """
        
        try:
            # Enviar email para os administradores
            admin_emails = User.objects.filter(is_staff=True).values_list('email', flat=True)
            if admin_emails:
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    list(admin_emails),
                    fail_silently=True,
                )
        except Exception:
            # Se não conseguir enviar email, apenas loga o erro
            pass


@receiver(post_save, sender=Movimentacao)
def log_movimentacao(sender, instance, created, **kwargs):
    """Registra log de movimentações"""
    if created:
        # Aqui você poderia adicionar lógica de logging adicional
        # Por exemplo, enviar notificações para usuários específicos
        pass