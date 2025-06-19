from django.urls import path
from . import views
from .views import list_class_individuals

urlpatterns = [
    path("sparql/search/", views.list_term_mentions, name="list_term_mentions"),
]