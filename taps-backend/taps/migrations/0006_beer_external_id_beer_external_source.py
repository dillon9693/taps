from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("taps", "0005_remove_brewery_location"),
    ]

    operations = [
        migrations.AddField(
            model_name="beer",
            name="external_id",
            field=models.CharField(blank=True, max_length=50, default=""),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="beer",
            name="external_source",
            field=models.CharField(
                blank=True,
                choices=[("KAGGLE_CRAFT_CANS", "Kaggle Craft Cans")],
                max_length=50,
                default="",
            ),
            preserve_default=False,
        ),
    ]
