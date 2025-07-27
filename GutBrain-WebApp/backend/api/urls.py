from django.urls import path
from .views import list_everything, list_property_term, list_property_objects, list_class_individuals, list_all_individuals, paper_details, list_details, list_authors, list_classes_with_individuals, list_publications_per_year

urlpatterns = [
    path("list_everything/",    list_everything),
    path("list_property_term/",    list_property_term),
    path("list_property_objects/", list_property_objects),
    path("list_class_individuals/", list_class_individuals),
    path("list_all_individuals/",   list_all_individuals),
    path("list_classes_with_inds/", list_classes_with_individuals),
    path("list_publications_per_year/", list_publications_per_year),
    path("paper_details/", paper_details),
    path("list_details/", list_details),
    path("list_authors/",  list_authors),
]