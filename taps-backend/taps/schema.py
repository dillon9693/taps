import logging

import graphene
from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import IntegrityError
from django.db.models import Count
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from graphene_django import DjangoObjectType

from taps.models import Beer, Brewery, SavedBeer, Tag, TagVote

logger = logging.getLogger(__name__)


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
    tags_with_votes = graphene.List(lambda: TagVoteType)
    is_saved = graphene.Boolean()

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

    def resolve_tags_with_votes(self, info):
        tag_votes = []

        tags_for_beer = self.tags.all()

        tag_votes_for_beer_by_user = (
            TagVote.objects.filter(
                user=info.context.user, tag__in=tags_for_beer, beer=self
            ).all()
            if info.context.user.is_authenticated
            else {}
        )

        user_vote_by_tag_id = {
            vote.tag.id: vote.upvote for vote in tag_votes_for_beer_by_user
        }

        for tag in tags_for_beer:
            upvote_count = TagVote.objects.filter(
                tag=tag, beer=self, upvote=True
            ).count()
            downvote_count = TagVote.objects.filter(
                tag=tag, beer=self, upvote=False
            ).count()

            current_user_vote = user_vote_by_tag_id.get(tag.id, None)

            tag_votes.append(
                TagVoteType(
                    tag_id=str(tag.id),
                    tag_name=tag.name,
                    upvote_count=upvote_count,
                    downvote_count=downvote_count,
                    current_user_vote=current_user_vote,
                )
            )
        return tag_votes

    # TODO eventually look into a more efficient way to do this b/c right now it's
    # likely sending 1 query per returned beer
    def resolve_is_saved(self, info):
        user = info.context.user
        if not user.is_authenticated:
            return False

        saved_beer = SavedBeer.objects.filter(beer=self, user=user).first()
        if saved_beer is None:
            return False

        return True


class TagVoteType(graphene.ObjectType):
    tag_id = graphene.String()
    tag_name = graphene.String()
    upvote_count = graphene.Int()
    downvote_count = graphene.Int()
    current_user_vote = graphene.Boolean()


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
        fields = ("id", "email", "first_name", "last_name", "date_joined")


class Query(graphene.ObjectType):
    all_beers = graphene.List(
        BeerType,
        style=graphene.String(required=False),
        min_abv=graphene.Float(required=False),
        max_abv=graphene.Float(required=False),
        search=graphene.String(required=False),
    )
    featured_beers = graphene.List(BeerType, count=graphene.Int(required=False))
    saved_beers = graphene.List(BeerType, count=graphene.Int(required=False))
    beer_by_id = graphene.Field(BeerType, id=graphene.ID(required=True))

    all_breweries = graphene.List(
        BreweryType,
        location=graphene.String(required=False),
        search=graphene.String(required=False),
    )
    brewery_by_id = graphene.Field(BreweryType, id=graphene.ID(required=True))

    top_tags = graphene.List(TagType, count=graphene.Int(required=False))
    new_tags_for_beer = graphene.List(
        TagType,
        beer_id=graphene.ID(required=True),
        count=graphene.Int(required=False),
        search=graphene.String(required=False),
    )

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

    def resolve_saved_beers(self, info, count=10):
        user = info.context.user
        if not user.is_authenticated:
            raise Exception("Authenticated required.")

        saved_beers = (
            SavedBeer.objects.filter(user=user)
            .prefetch_related("beer")
            .order_by("-created_at")[:count]
        )

        return [saved_beer.beer for saved_beer in saved_beers]

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

    def resolve_new_tags_for_beer(self, info, beer_id, count=10, search=None):
        qs = Tag.objects.exclude(beers__id=beer_id)

        if search:
            qs = qs.filter(name__icontains=search)

        return qs.order_by("name")[:count]

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

        # Check for duplicate email
        email_exists = User.objects.filter(email=email).exists()

        # Always validate password to maintain consistent timing
        password_valid = True
        try:
            validate_password(password)
        except ValidationError:
            password_valid = False
            errors = [
                "Password does not meet security requirements. "
                "Please choose a stronger password."
            ]

        # Return error after both checks to prevent timing-based user enumeration
        if email_exists:
            errors = ["Unable to register with the provided email address."]
            return RegisterUser(success=False, errors=errors, user=None)

        if not password_valid:
            return RegisterUser(success=False, errors=errors, user=None)

        try:
            user = User.objects.create_user(
                username=email,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
            )
        except ValueError as e:
            logger.warning(f"User registration validation error: {str(e)}")
            errors.append("Invalid input provided. Please check your information.")
            return RegisterUser(success=False, errors=errors, user=None)
        except Exception as e:
            logger.error(f"User registration failed: {str(e)}", exc_info=True)
            errors.append("Unable to create account. Please try again.")
            return RegisterUser(success=False, errors=errors, user=None)

        # For social auth, allauth will use its own backend
        # For email/password, we explicitly use ModelBackend
        login(
            info.context,
            user,
            backend="django.contrib.auth.backends.ModelBackend",
        )
        return RegisterUser(success=True, errors=[], user=user)


class LoginUser(graphene.Mutation):
    class Arguments:
        email = graphene.String(required=True)
        password = graphene.String(required=True)

    user = graphene.Field(UserType)
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, email, password):
        errors = []

        # Authenticate using email as username (prevents timing attacks)
        user = authenticate(info.context, username=email, password=password)

        if user is not None:
            login(
                info.context,
                user,
                backend="django.contrib.auth.backends.ModelBackend",
            )
            return LoginUser(success=True, errors=[], user=user)
        else:
            errors.append("Invalid email or password.")
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

            frontend_url = settings.FRONTEND_URL
            reset_url = f"{frontend_url}/reset-password?uid={uid}&token={token}"

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
        except Exception as e:
            logger.error(f"Password reset request failed: {str(e)}", exc_info=True)
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
        except Exception:
            errors.append("Invalid or expired password reset link.")
            return ResetPassword(success=False, errors=errors)

        if not default_token_generator.check_token(user, token):
            errors.append("Invalid or expired password reset link.")
            return ResetPassword(success=False, errors=errors)

        try:
            validate_password(new_password, user=user)
        except ValidationError:
            errors.append(
                "Password does not meet security requirements. "
                "Please choose a stronger password."
            )
            return ResetPassword(success=False, errors=errors)

        user.set_password(new_password)
        user.save()
        return ResetPassword(success=True, errors=[])


class TagVoteMutation(graphene.Mutation):
    class Arguments:
        tag_id = graphene.ID(required=True)
        beer_id = graphene.ID(required=True)
        upvote = graphene.Boolean(required=True)

    success = graphene.Boolean()
    new_upvote_count = graphene.Int()
    new_downvote_count = graphene.Int()
    errors = graphene.List(graphene.String)

    def mutate(self, info, tag_id, beer_id, upvote):
        user = info.context.user
        if not user.is_authenticated:
            return TagVoteMutation(success=False, errors=["Authentication required."])

        logger.debug(
            f"TagVoteMutation called by user {user.id} for tag {tag_id} on beer "
            f"{beer_id} with upvote={upvote}"
        )

        try:
            tag = Tag.objects.get(id=tag_id)
            beer = Beer.objects.prefetch_related("tags").get(id=beer_id)
        except Tag.DoesNotExist:
            return TagVoteMutation(success=False, errors=["Tag not found."])
        except Beer.DoesNotExist:
            return TagVoteMutation(success=False, errors=["Beer not found."])

        if tag not in beer.tags.all():
            return TagVoteMutation(
                success=False, errors=["Tag is not associated with the specified beer."]
            )

        try:
            TagVote.objects.update_or_create(
                tag=tag,
                beer=beer,
                user=user,
                defaults={"upvote": upvote},
            )

            new_upvote_count = TagVote.vote_count(beer, tag, True)
            new_downvote_count = TagVote.vote_count(beer, tag, False)

            return TagVoteMutation(
                success=True,
                new_upvote_count=new_upvote_count,
                new_downvote_count=new_downvote_count,
                errors=[],
            )
        except Exception as e:
            logger.error(f"Tag vote failed: {str(e)}", exc_info=True)
            return TagVoteMutation(success=False, errors=["Unable to record vote."])


class UpdateAccountDetailsMutation(graphene.Mutation):
    class Arguments:
        first_name = graphene.String(required=True)
        last_name = graphene.String(required=True)

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, first_name, last_name):
        user = info.context.user
        if not user.is_authenticated:
            return UpdateAccountDetailsMutation(
                success=False, errors=["Authentication required."]
            )

        try:
            user.first_name = first_name
            user.last_name = last_name
            user.save()
            return UpdateAccountDetailsMutation(success=True, errors=[])
        except Exception as e:
            logger.error(f"Account update failed: {str(e)}", exc_info=True)
            return UpdateAccountDetailsMutation(
                success=False, errors=["Unable to save account updates."]
            )


class SaveBeerMutation(graphene.Mutation):
    class Arguments:
        beer_id = graphene.ID(required=True)

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, beer_id):
        user = info.context.user
        if not user.is_authenticated:
            return SaveBeerMutation(success=False, errors=["Authentication required."])

        try:
            beer = Beer.objects.get(id=beer_id)
        except Beer.DoesNotExist:
            return SaveBeerMutation(success=False, errors=["Beer does not exist."])

        try:
            SavedBeer.objects.create(beer=beer, user=user)
        except IntegrityError as e:
            logger.error(
                f"Integrity error when saving beer for user: {str(e)}", exc_info=True
            )
            return SaveBeerMutation(
                success=False, errors=["Beer has already been saved."]
            )
        except Exception as e:
            logger.error(f"Saving of beer failed: {str(e)}", exc_info=True)
            return SaveBeerMutation(success=False, errors=["Unable to save beer."])

        logger.debug(
            f"Successfully saved beer {beer_id} for user {user.id}",
        )

        return SaveBeerMutation(success=True, errors=[])


class UnsaveBeerMutation(graphene.Mutation):
    class Arguments:
        beer_id = graphene.ID(required=True)

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, beer_id):
        user = info.context.user
        if not user.is_authenticated:
            return UnsaveBeerMutation(
                success=False, errors=["Authentication required."]
            )

        try:
            beer = Beer.objects.get(id=beer_id)
        except Beer.DoesNotExist:
            return UnsaveBeerMutation(success=False, errors=["Beer does not exist."])

        try:
            saved_beer = SavedBeer.objects.get(beer=beer, user=user)
        except SavedBeer.DoesNotExist:
            return UnsaveBeerMutation(
                success=False, errors=["Beer has not yet been saved."]
            )

        try:
            saved_beer.delete()
        except Exception as e:
            logger.error(f"Unsaving of beer failed: {str(e)}", exc_info=True)
            return UnsaveBeerMutation(success=False, errors=["Unable to unsave beer."])

        logger.debug(
            f"Successfully unsaved beer {beer_id} for user {user.id}",
        )

        return UnsaveBeerMutation(success=True, errors=[])


class AddTagsForBeerMutation(graphene.Mutation):
    class Arguments:
        beer_id = graphene.ID(required=True)
        tag_ids = graphene.List(graphene.ID, required=True)

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    def mutate(self, info, beer_id, tag_ids):
        user = info.context.user
        if not user.is_authenticated:
            return AddTagsForBeerMutation(
                success=False, errors=["Authentication required."]
            )

        try:
            beer = Beer.objects.get(id=beer_id)
        except Beer.DoesNotExist:
            return AddTagsForBeerMutation(
                success=False, errors=["Beer does not exist."]
            )

        if len(tag_ids) == 0:
            return AddTagsForBeerMutation(
                success=False, errors=["Must specify at least one tag ID."]
            )

        tags = Tag.objects.filter(id__in=tag_ids).all()

        if len(tags) != len(tag_ids):
            return AddTagsForBeerMutation(
                success=False, errors=["Invalid tag IDs specified."]
            )

        try:
            beer.tags.add(*tags)
        except Exception as e:
            logger.error(f"Adding tag to beer failed: {str(e)}", exc_info=True)
            return AddTagsForBeerMutation(
                success=False, errors=["Unable to add tag to beer."]
            )

        return AddTagsForBeerMutation(success=True, errors=[])


class Mutation(graphene.ObjectType):
    register_user = RegisterUser.Field()
    login_user = LoginUser.Field()
    logout_user = LogoutUser.Field()
    request_password_reset = RequestPasswordReset.Field()
    reset_password = ResetPassword.Field()
    tag_vote = TagVoteMutation.Field()
    update_account_details = UpdateAccountDetailsMutation.Field()
    save_beer = SaveBeerMutation.Field()
    unsave_beer = UnsaveBeerMutation.Field()
    add_tags_for_beer = AddTagsForBeerMutation.Field()


schema = graphene.Schema(query=Query, mutation=Mutation)
