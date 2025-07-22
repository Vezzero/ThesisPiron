from django.contrib import admin
from django.urls import path, include
from api.views import list_term_mentions, list_property_term, list_property_objects, list_class_individuals, list_all_individuals, paper_details, list_details, list_authors, list_classes_with_individuals, list_publications_per_year
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/list_term_mentions/",    list_term_mentions),
    path("api/list_property_term/",    list_property_term),
    path("api/list_property_objects/", list_property_objects),
    path("api/list_class_individuals/", list_class_individuals),
    path("api/list_all_individuals/",   list_all_individuals),
    path("api/list_classes_with_inds/", list_classes_with_individuals),
    path("api/list_publications_per_year/", list_publications_per_year),
    path("api/paper_details/", paper_details),
    path("api/list_details/", list_details),
    path("api/list_authors/",  list_authors),
    path("api/", include("api.urls")),
]


