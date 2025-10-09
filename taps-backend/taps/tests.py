import json

from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import Client, TestCase
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from taps.models import Beer, Brewery, Tag


class RegisterUserTestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_register_user_success(self):
        mutation = """
            mutation {
                registerUser(
                    email: "test@example.com",
                    password: "securePassword123!",
                    firstName: "John",
                    lastName: "Doe"
                ) {
                    success
                    errors
                    user {
                        id
                        email
                        firstName
                        lastName
                    }
                }
            }
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": mutation}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["registerUser"]

        self.assertTrue(data["success"])
        self.assertEqual(data["errors"], [])
        self.assertEqual(data["user"]["email"], "test@example.com")
        self.assertEqual(data["user"]["firstName"], "John")
        self.assertEqual(data["user"]["lastName"], "Doe")

        self.assertTrue(User.objects.filter(email="test@example.com").exists())

    def test_register_user_duplicate_email(self):
        User.objects.create_user(
            username="test@example.com",
            email="test@example.com",
            password="password123",
        )

        mutation = """
            mutation {
                registerUser(
                    email: "test@example.com",
                    password: "securePassword123!",
                    firstName: "John",
                    lastName: "Doe"
                ) {
                    success
                    errors
                    user {
                        id
                    }
                }
            }
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": mutation}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["registerUser"]

        self.assertFalse(data["success"])
        self.assertIn(
            "Unable to register with the provided email address.", data["errors"]
        )
        self.assertIsNone(data["user"])

    def test_register_user_weak_password(self):
        mutation = """
            mutation {
                registerUser(
                    email: "test@example.com",
                    password: "123",
                    firstName: "John",
                    lastName: "Doe"
                ) {
                    success
                    errors
                    user {
                        id
                    }
                }
            }
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": mutation}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["registerUser"]

        self.assertFalse(data["success"])
        self.assertTrue(len(data["errors"]) > 0)
        self.assertIsNone(data["user"])


class LoginUserTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        User.objects.create_user(
            username="test@example.com",
            email="test@example.com",
            password="securePassword123!",
        )

    def test_login_user_success(self):
        mutation = """
            mutation {
                loginUser(email: "test@example.com", password: "securePassword123!") {
                    success
                    errors
                    user {
                        email
                    }
                }
            }
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": mutation}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["loginUser"]

        self.assertTrue(data["success"])
        self.assertEqual(data["errors"], [])
        self.assertEqual(data["user"]["email"], "test@example.com")

    def test_login_user_invalid_credentials(self):
        mutation = """
            mutation {
                loginUser(email: "test@example.com", password: "wrongpassword") {
                    success
                    errors
                    user {
                        id
                    }
                }
            }
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": mutation}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["loginUser"]

        self.assertFalse(data["success"])
        self.assertIn("Invalid email or password.", data["errors"])
        self.assertIsNone(data["user"])

    def test_login_user_nonexistent_email(self):
        mutation = """
            mutation {
                loginUser(email: "nonexistent@example.com", password: "password123") {
                    success
                    errors
                    user {
                        id
                    }
                }
            }
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": mutation}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["loginUser"]

        self.assertFalse(data["success"])
        self.assertIn("Invalid email or password.", data["errors"])
        self.assertIsNone(data["user"])


class LogoutUserTestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_logout_user(self):
        mutation = """
            mutation {
                logoutUser {
                    success
                }
            }
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": mutation}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["logoutUser"]

        self.assertTrue(data["success"])


class CurrentUserTestCase(TestCase):
    def setUp(self):
        self.client = Client()

    def test_current_user_authenticated(self):
        user = User.objects.create_user(
            username="test@example.com",
            email="test@example.com",
            password="securePassword123!",
        )
        self.client.force_login(user)

        query = """
            query {
                currentUser {
                    id
                    email
                }
            }
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": query}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["currentUser"]

        self.assertEqual(data["email"], "test@example.com")

    def test_current_user_unauthenticated(self):
        query = """
            query {
                currentUser {
                    id
                }
            }
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": query}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["currentUser"]

        self.assertIsNone(data)


class RequestPasswordResetTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username="test@example.com",
            email="test@example.com",
            password="oldPassword123!",
        )

    def test_request_password_reset_success(self):
        mutation = """
            mutation {
                requestPasswordReset(email: "test@example.com") {
                    success
                    message
                }
            }
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": mutation}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["requestPasswordReset"]

        self.assertTrue(data["success"])
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["test@example.com"])
        self.assertIn("Password Reset Request", mail.outbox[0].subject)

    def test_request_password_reset_nonexistent_email(self):
        mutation = """
            mutation {
                requestPasswordReset(email: "nonexistent@example.com") {
                    success
                    message
                }
            }
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": mutation}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["requestPasswordReset"]

        self.assertTrue(data["success"])
        self.assertEqual(len(mail.outbox), 0)


class ResetPasswordTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username="test@example.com",
            email="test@example.com",
            password="oldPassword123!",
        )

    def test_reset_password_success(self):
        token = default_token_generator.make_token(self.user)
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))

        mutation = f"""
            mutation {{
                resetPassword(
                    uid: "{uid}",
                    token: "{token}",
                    newPassword: "newSecurePassword123!"
                ) {{
                    success
                    errors
                }}
            }}
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": mutation}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["resetPassword"]

        self.assertTrue(data["success"])
        self.assertEqual(data["errors"], [])

        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("newSecurePassword123!"))

    def test_reset_password_invalid_token(self):
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))

        mutation = f"""
            mutation {{
                resetPassword(
                    uid: "{uid}",
                    token: "invalid-token",
                    newPassword: "newSecurePassword123!"
                ) {{
                    success
                    errors
                }}
            }}
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": mutation}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["resetPassword"]

        self.assertFalse(data["success"])
        self.assertIn("Invalid or expired password reset link.", data["errors"])

    def test_reset_password_weak_password(self):
        token = default_token_generator.make_token(self.user)
        uid = urlsafe_base64_encode(force_bytes(self.user.pk))

        mutation = f"""
            mutation {{
                resetPassword(
                    uid: "{uid}",
                    token: "{token}",
                    newPassword: "123"
                ) {{
                    success
                    errors
                }}
            }}
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": mutation}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["resetPassword"]

        self.assertFalse(data["success"])
        self.assertTrue(len(data["errors"]) > 0)


class NewTagsForBeerTestCase(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username="test@example.com",
            email="test@example.com",
            password="securePassword123!",
        )
        self.client.force_login(self.user)

        # Create a brewery
        self.brewery = Brewery.objects.create(
            name="Test Brewery", location="Test City"
        )

        # Create a beer
        self.beer = Beer.objects.create(
            name="Test Beer",
            brewery=self.brewery,
            style="IPA",
            abv=5.5,
            description="Test description",
        )

        # Create tags
        self.tag1 = Tag.objects.create(name="hoppy")
        self.tag2 = Tag.objects.create(name="bitter")
        self.tag3 = Tag.objects.create(name="citrus")
        self.tag4 = Tag.objects.create(name="fruity")
        self.tag5 = Tag.objects.create(name="tropical")

        # Add some tags to the beer
        self.beer.tags.add(self.tag1)

    def test_new_tags_for_beer_without_search(self):
        query = f"""
            query {{
                newTagsForBeer(beerId: "{self.beer.id}") {{
                    id
                    name
                }}
            }}
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": query}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["newTagsForBeer"]

        # Should return all tags except the one already added (tag1/hoppy)
        self.assertEqual(len(data), 4)
        tag_names = [tag["name"] for tag in data]
        self.assertNotIn("hoppy", tag_names)
        self.assertIn("bitter", tag_names)
        self.assertIn("citrus", tag_names)
        self.assertIn("fruity", tag_names)
        self.assertIn("tropical", tag_names)

    def test_new_tags_for_beer_with_search(self):
        query = f"""
            query {{
                newTagsForBeer(beerId: "{self.beer.id}", search: "fr") {{
                    id
                    name
                }}
            }}
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": query}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["newTagsForBeer"]

        # Should only return tags matching "fr" (fruity)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["name"], "fruity")

    def test_new_tags_for_beer_with_search_case_insensitive(self):
        query = f"""
            query {{
                newTagsForBeer(beerId: "{self.beer.id}", search: "CIT") {{
                    id
                    name
                }}
            }}
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": query}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["newTagsForBeer"]

        # Should return citrus (case insensitive match)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["name"], "citrus")

    def test_new_tags_for_beer_with_search_no_matches(self):
        query = f"""
            query {{
                newTagsForBeer(beerId: "{self.beer.id}", search: "zzz") {{
                    id
                    name
                }}
            }}
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": query}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["newTagsForBeer"]

        # Should return empty list
        self.assertEqual(len(data), 0)

    def test_new_tags_for_beer_with_long_search_term(self):
        # Create a search term longer than 50 characters
        long_search = "a" * 60

        query = f"""
            query {{
                newTagsForBeer(beerId: "{self.beer.id}", search: "{long_search}") {{
                    id
                    name
                }}
            }}
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": query}),
            content_type="application/json",
        )
        result = response.json()

        # Should not raise an error, just return empty results
        data = result["data"]["newTagsForBeer"]
        self.assertEqual(len(data), 0)

    def test_new_tags_for_beer_excludes_already_added_tags(self):
        # Add another tag to the beer
        self.beer.tags.add(self.tag2)

        query = f"""
            query {{
                newTagsForBeer(beerId: "{self.beer.id}") {{
                    id
                    name
                }}
            }}
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": query}),
            content_type="application/json",
        )
        result = response.json()
        data = result["data"]["newTagsForBeer"]

        # Should return all tags except hoppy and bitter
        self.assertEqual(len(data), 3)
        tag_names = [tag["name"] for tag in data]
        self.assertNotIn("hoppy", tag_names)
        self.assertNotIn("bitter", tag_names)
