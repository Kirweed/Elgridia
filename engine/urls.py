from django.urls import path, include
from engine.views import mainPageRender, gameWindowRender, ranksPageRender, aboutPageRender, \
    galleryPageRender, changelogPageRender, UserViewSet, PlayerViewSet, LocationSpotViewSet, LocationViewSet
from rest_framework import routers

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'players', PlayerViewSet)
router.register(r'locationspots', LocationSpotViewSet)
router.register(r'locations', LocationViewSet)

urlpatterns = [
    path('rest/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('index/', mainPageRender, name="main_page"),
    path('game/', gameWindowRender, name="game"),
    path('ranks/', ranksPageRender, name="ranks_page"),
    path('about/', aboutPageRender, name="about_page"),
    path('gallery/', galleryPageRender, name="gallery_page"),
    path('changelog/', changelogPageRender, name="changelog_page")
]
