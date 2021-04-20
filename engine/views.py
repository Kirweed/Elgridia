from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from .forms import RegisterForm
from .models import Player, Location, LocationSpot
from django.utils.crypto import get_random_string
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User
from rest_framework import viewsets
from rest_framework import permissions
from .serializers import UserSerializer, PlayerSerializer, LocationSpotsSerializer, LocationSerializer

# Create your views here.


class UserViewSet(viewsets.ModelViewSet):

    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticated]


class LocationSpotViewSet(viewsets.ModelViewSet):
    queryset = LocationSpot.objects.all()
    serializer_class = LocationSpotsSerializer


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer


def mainPageRender(request):

    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            if user.player.active == '0':
                login(request, user)
                request.session['username'] = username
                return redirect(gameWindowRender)
            else:
                message = 'Twoje konto nie jest aktywne.' \
                          ' By się zalogować, aktywuj je, klikając w link aktywacyjny.\n\r ' \
                          'Nie dostałeś linku aktywacyjnego <a href ="#">kliknij</a>'
                return render(request, 'index.html', {'message': message})
        else:
            message = 'Błędne hasło lub nazwa użytkownika!'
            return render(request, 'index.html', {'message': message})
    else:
        return render(request, 'index.html')


def ranksPageRender(request):

    sorted_players = Player.objects.only('user', 'experience', 'level').order_by('-experience')

    return render(request, 'ranks.html', {'sorted_players': sorted_players})


def aboutPageRender(request):
    return render(request, 'about.html')


def galleryPageRender(request):
    return render(request, 'gallery.html')


def changelogPageRender(request):
    return render(request, 'changelog.html')


@login_required(redirect_field_name='main_Page')
def gameWindowRender(request):
    username = request.session.get('username')
    player = User.objects.get(username=username).player
    return render(request, 'newgame.html', {'id': player.id})


def register(request):
    if request.method == "POST":
        form = RegisterForm(request.POST)
        if form.is_valid():
            form.save()
            username = request.POST['username']
            email = request.POST['email']
            user = User.objects.get(username=username)

            try:
                start_location = Location.objects.get(id=1)
                active = get_random_string(length=30)
                active_link = 'http://127.0.0.1:8000/success_account_activation/' + active
                Player.objects.create(user=user, level=1, experience=0, x=7, y=7,
                                      location=start_location, active=active, gold=100, premium_gold=0)
                message = 'witaj ' + username + \
                          '\n\r Już tylko parę kroków dzieli Cię od wejścia do świata Królestwa Elgrid. ' \
                          'Kliknij w link aktywacyjny poniżej, ' \
                          'by dokończyć rejestrację konta. \n\r ' \
                          'Jeśli to nie Ty rejstrowałeś się ' \
                          'w Elgridii, po prostu zignoruj ten link. ' \
                          '\n\r Link aktywacyjny: ' + active_link
                send_mail(
                    'Potwierdź swoją rejstrację w Elgridii!',
                    message,
                    'michal.plichta612@gmail.com',
                    [email],
                    fail_silently=False
                )
            except Exception:
                user.delete()

            return redirect(success_register)
    else:
        form = RegisterForm()

    return render(request, "register.html", {"form": form})


def success_register(request):
    return render(request, 'success_register.html')


def success_account_activation(request, code):
    try:
        player = Player.objects.get(active=code)
        player.active = '0'
        player.save()
        username = player.user.username
    except ObjectDoesNotExist:
        return redirect(mainPageRender)

    return render(request, 'success_account_activation.html', {'username': username})
