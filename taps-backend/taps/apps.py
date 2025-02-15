from django.apps import AppConfig


class TapsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'taps'

    def ready(self):
        import taps.models  # noqa
