from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class RegisterForm(UserCreationForm):
    email = forms.EmailField(
        label="",
        widget=forms.EmailInput(attrs={'placeholder': 'E-mail'})
    )
    password1 = forms.CharField(
        label="",
        strip=False,
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password', 'placeholder': 'Hasło'}),
        help_text='',
    )
    password2 = forms.CharField(
        label="",
        widget=forms.PasswordInput(attrs={'autocomplete': 'new-password', 'placeholder': 'Powtórz swoje hasło!'}),
        strip=False,
        help_text='',
    )

    class Meta:
        model = User
        fields = ["username", "email", "password1", "password2"]
        help_texts = {'username': None, 'email': None}
        widgets = {
            'username': forms.TextInput(attrs={'placeholder': 'Username'}),
        }
        labels = {
            'username': '',
        }