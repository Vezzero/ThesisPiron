from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api-auth/', include('rest_framework.urls')),
    path("app/gutbrain/api/", include("api.urls")),  # This should handle all API routes
    re_path(r'^app/gutbrainkb(/.*)?$', TemplateView.as_view(template_name="index.html")),  # This serves the SPA
]
