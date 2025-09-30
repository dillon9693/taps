import json

from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import Client, TestCase
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


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
                        username
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
        self.assertEqual(data["user"]["username"], "test@example.com")
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
            "Unable to register with the provided email address", data["errors"]
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
        self.assertIn("Invalid email or password", data["errors"])
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
        self.assertIn("Invalid email or password", data["errors"])
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
                    username
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
        self.assertEqual(data["username"], "test@example.com")

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
        self.assertIn("Invalid or expired password reset link", data["errors"])

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
