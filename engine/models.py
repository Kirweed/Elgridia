from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class Enemy(models.Model):
    name = models.CharField(blank=False, max_length=32, unique=True)
    level = models.PositiveSmallIntegerField(default=1, blank=False)
    experience = models.PositiveBigIntegerField(default=0, blank=False)
    hit_points = models.PositiveBigIntegerField(default=1, blank=False)
    damage = models.PositiveBigIntegerField(default=0, blank=False)
    image = models.ImageField(upload_to="enemies", blank=False)

    def __str__(self):
        return self.name + " (" + str(self.level) + ")"


class Location(models.Model):
    name = models.CharField(blank=False, max_length=32, unique=True)

    def __str__(self):
        return self.name


class LocationSpot(models.Model):

    UP = 1
    LEFT = 2
    DOWN = 3
    RIGHT = 4

    DOOR_DIRECTION_CHOICES = [
        (UP, 'up'),
        (LEFT, 'left'),
        (DOWN, 'down'),
        (RIGHT, 'right'),
    ]

    location_name = models.ForeignKey(Location, on_delete=models.CASCADE, default=1,
                                      related_name='location_spot')
    x = models.PositiveSmallIntegerField(blank=False, default=1)
    y = models.PositiveSmallIntegerField(blank=False, default=1)
    enemy = models.ForeignKey(Enemy, on_delete=models.CASCADE, null=True, blank=True)
    door = models.ForeignKey(to='LocationSpot', on_delete=models.CASCADE, null=True, blank=True)
    door_direction = models.PositiveSmallIntegerField(null=True, choices=DOOR_DIRECTION_CHOICES)

    def __str__(self):
        return self.location_name.name + ' (' + str(self.x) + ', ' + str(self.y) + ')'


class Player(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    level = models.PositiveSmallIntegerField(default=1, blank=False)
    experience = models.PositiveBigIntegerField(default=0, blank=False)
    x = models.PositiveSmallIntegerField(blank=False, default=1)
    y = models.PositiveSmallIntegerField(blank=False, default=1)
    location = models.ForeignKey(Location, on_delete=models.SET_DEFAULT, default=1)
    active = models.CharField(blank=False, default='0', max_length=31)
    gold = models.PositiveBigIntegerField(blank=False, default=0)
    premium_gold = models.PositiveIntegerField(blank=False, default=0)

    def __str__(self):
        return self.user.username + " (" + str(self.level) + ")"
