from django.contrib import admin
from .models import Player, Location, LocationSpot, Enemy

# Register your models here.

admin.site.register(Player)
admin.site.register(Location)
admin.site.register(LocationSpot)
admin.site.register(Enemy)