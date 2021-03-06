# Generated by Django 3.1.6 on 2021-04-06 01:51

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('engine', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='locationspot',
            name='door',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='engine.locationspot'),
        ),
        migrations.AlterField(
            model_name='locationspot',
            name='enemy',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='engine.enemy'),
        ),
        migrations.AlterField(
            model_name='locationspot',
            name='location_name',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='location_spot', to='engine.location'),
        ),
    ]
