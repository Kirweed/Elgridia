from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Player, LocationSpot, Enemy, Location


class EnemySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enemy
        fields = ['name', 'level', 'image']


class SubLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name']


class SubLocationSpotSerializer(serializers.ModelSerializer):
    location_name = SubLocationSerializer(many=False)

    class Meta:
        model = LocationSpot
        fields = ['location_name', 'x', 'y']


class LocationSpotsSerializer(serializers.ModelSerializer):
    enemy = EnemySerializer(many=False)
    door = SubLocationSpotSerializer(many=False)

    class Meta:
        model = LocationSpot
        fields = ['x', 'y', 'enemy', 'door', 'door_direction', 'collision']


class LocationSerializer(serializers.ModelSerializer):
    location_spot = LocationSpotsSerializer(many=True)

    class Meta:
        model = Location
        fields = ['id', 'name', 'location_spot']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', ]


class PlayerSerializer(serializers.ModelSerializer):
    user = UserSerializer(many=False)

    class Meta:
        model = Player
        fields = ['level', 'experience', 'x', 'y', 'location', 'user', 'gold', 'premium_gold']
