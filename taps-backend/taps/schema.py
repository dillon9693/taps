import graphene
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db.models import Count
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from graphene_django import DjangoObjectType

from taps.models import Beer, Brewery, Tag


class BreweryType(DjangoObjectType):
    beer_count = graphene.Int()

    class Meta:
        model = Brewery
        fields = (
            "id",
            "name",
            "location",
            "description",
            "year_founded",
            "website",
            "beers",
        )

    def resolve_beer_count(self, info):
        return self.beers.count()


class BeerType(DjangoObjectType):
    style_display = graphene.String()

    class Meta:
        model = Beer
        fields = (
            "id",
            "name",
            "brewery",
            "style",
            "abv",
            "ibu",
            "description",
            "average_rating",
            "image_url",
            "tags",
            "created_at",
            "updated_at",
        )

    def resolve_style_display(self, info):
        return self.get_style_display()


class TagType(DjangoObjectType):
    beer_count = graphene.Int()

    class Meta:
        model = Tag
        fields = ("id", "name", "beers")

    def resolve_beer_count(self, info):
        return self.beers.count()


class UserType(DjangoObjectType):
    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "date_joined")


class Query(graphene.ObjectType):
    all_beers = graphene.List(
        BeerType,
        style=graphene.String(required=False),
        min_abv=graphene.Float(required=False),
        max_abv=graphene.Float(required=False),
        search=graphene.String(required=False),
    )
    featured_beers = graphene.List(BeerType, count=graphene.Int(required=False))
    beer_by_id = graphene.Field(BeerType, id=graphene.ID(required=True))

    all_breweries = graphene.List(
        BreweryType,
        location=graphene.String(required=False),
        search=graphene.String(required=False),
    )
    brewery_by_id = graphene.Field(BreweryType, id=graphene.ID(required=True))

    top_tags = graphene.List(TagType, count=graphene.Int(required=False))

    current_user = graphene.Field(UserType)

    def resolve_all_beers(
        self, info, style=None, min_abv=None, max_abv=None, search=None
    ):
        qs = Beer.objects.select_related("brewery").prefetch_related("tags")

        if style:
            qs = qs.filter(style=style)
        if min_abv is not None:
            qs = qs.filter(abv__gte=min_abv)
        if max_abv is not None:
            qs = qs.filter(abv__lte=max_abv)
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(
                description__icontains=search
            )

        return qs.order_by("-created_at")

    def resolve_featured_beers(self, info, count=6):
        return (
            Beer.objects.select_related("brewery")
            .prefetch_related("tags")
            .filter(average_rating__isnull=False)
            .order_by("-average_rating")[:count]
        )

    def resolve_beer_by_id(self, info, id):
        try:
            return (
                Beer.objects.select_related("brewery")
                .prefetch_related("tags")
                .get(id=id)
            )
        except Beer.DoesNotExist:
            return None

    def resolve_all_breweries(self, info, location=None, search=None):
        qs = Brewery.objects.prefetch_related("beers")

        if location:
            qs = qs.filter(location__icontains=location)
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(
                description__icontains=search
            )

        return qs.order_by("name")

    def resolve_brewery_by_id(self, info, id):
        try:
            return Brewery.objects.prefetch_related("beers").get(id=id)
        except Brewery.DoesNotExist:
            return None

    def resolve_top_tags(self, info, count=10):
        return (
            Tag.objects.prefetch_related("beers")
            .annotate(beer_count=Count("beers"))
            .order_by("-beer_count", "name")[:count]
        )

    def resolve_current_user(self, info):
        user = info.context.user
        if user.is_authenticated:
            return user
        return None


class RegisterUser(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)
        first_name = graphene.String(required=True)
        last_name = graphene.String(required=True)

    user = graphene.Field(UserType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, email, password, first_name, last_name):
        errors = []

        if User.objects.filter(email=email).exists():
            errors.append("A user with this email already exists")
            return RegisterUser(success=False, errors=errors, user=None)

        try:
            validate_password(password)
        except ValidationError as e:
            errors.extend(e.messages)
            return RegisterUser(success=False, errors=errors, user=None)

        try:
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )
            login(
                info.context,
                user,
                backend="django.contrib.auth.backends.ModelBackend",
            )
            return RegisterUser(success=True, errors=[], user=user)
        except Exception as e:
            errors.append(str(e))
            return RegisterUser(success=False, errors=errors, user=None)


class LoginUser(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    user = graphene.Field(UserType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, email, password):
        errors = []

        try:
            user = User.objects.get(email=email)
            username = user.username
        except User.DoesNotExist:
            errors.append("Invalid email or password")
            return LoginUser(success=False, errors=errors, user=None)

        user = authenticate(info.context, username=username, password=password)

        if user is not None:
            login(
                info.context,
                user,
                backend="django.contrib.auth.backends.ModelBackend",
            )
            return LoginUser(success=True, errors=[], user=user)
        else:
            errors.append("Invalid email or password")
            return LoginUser(success=False, errors=errors, user=None)


class LogoutUser(graphene.Mutation):
    success = graphene.Boolean()

    def mutate(self, info):
        logout(info.context)
        return LogoutUser(success=True)


class RequestPasswordReset(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, email):
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            reset_url = f"http://localhost:3000/reset-password?uid={uid}&token={token}"

            send_mail(
                subject="Password Reset Request",
                message=f"Click the link below to reset your password:\n\n{reset_url}",
                from_email="noreply@taps.com",
                recipient_list=[user.email],
                fail_silently=False,
            )

            return RequestPasswordReset(
                success=True,
                message="Password reset email sent",
            )
        except User.DoesNotExist:
            return RequestPasswordReset(
                success=True,
                message="If the email exists, a password reset email has been sent",
            )
        except Exception:
            return RequestPasswordReset(
                success=True,
                message="If the email exists, a password reset email has been sent",
            )


class ResetPassword(graphene.Mutation):
    class Arguments:
        uid = graphene.String(required=True)
        token = graphene.String(required=True)
        new_password = graphene.String(required=True)

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, uid, token, new_password):
        errors = []

        try:
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            errors.append("Invalid reset link")
            return ResetPassword(success=False, errors=errors)

        if not default_token_generator.check_token(user, token):
            errors.append("Invalid or expired reset token")
            return ResetPassword(success=False, errors=errors)

        try:
            validate_password(new_password, user=user)
        except ValidationError as e:
            errors.extend(e.messages)
            return ResetPassword(success=False, errors=errors)

        user.set_password(new_password)
        user.save()
        return ResetPassword(success=True, errors=[])


class Mutation(graphene.ObjectType):
    register_user = RegisterUser.Field()
    login_user = LoginUser.Field()
    logout_user = LogoutUser.Field()
    request_password_reset = RequestPasswordReset.Field()
    reset_password = ResetPassword.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
