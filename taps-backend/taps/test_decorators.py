import graphene
from django.contrib.auth.models import AnonymousUser, User
from django.test import TestCase
from unittest.mock import Mock

from taps.decorators import login_required


# Test mutation classes for decorator testing (must be at module level)
class TestMutationForDecorator(graphene.Mutation):
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    result = graphene.String()

    @login_required
    def mutate(self, info):
        return TestMutationForDecorator(success=True, errors=[], result="Success")


class TestMutationWithArgs(graphene.Mutation):
    success = graphene.Boolean()
    errors = graphene.List(graphene.String)
    arg1_value = graphene.String()
    arg2_value = graphene.Int()

    @login_required
    def mutate(self, info, arg1, arg2=42):
        return TestMutationWithArgs(
            success=True, errors=[], arg1_value=arg1, arg2_value=arg2
        )


# Create a mock query resolver
class MockQuery:
    @login_required
    def resolve_test_field(self, info):
        return "test_result"


class LoginRequiredDecoratorTestCase(TestCase):
    """Test the @login_required decorator for mutations and queries."""

    def setUp(self):
        self.user = User.objects.create_user(
            username="test@example.com",
            email="test@example.com",
            password="testPassword123!",
        )

    def test_decorator_on_mutation_with_authenticated_user(self):
        """Test that decorator allows authenticated users to execute mutations."""

        # Create mock info with authenticated user
        mock_info = init_mock_info(self.user)

        # Create mutation instance and call mutate
        mutation_instance = TestMutationForDecorator()
        result = mutation_instance.mutate(mock_info)

        self.assertTrue(result.success)
        self.assertEqual(result.errors, [])
        self.assertEqual(result.result, "Success")

    def test_decorator_on_mutation_with_unauthenticated_user(self):
        """Test that decorator returns error for unauthenticated users on mutations."""

        # Create mock info with anonymous user
        mock_info = init_mock_info(AnonymousUser())

        # Create mutation instance and call mutate
        mutation_instance = TestMutationForDecorator()
        result = mutation_instance.mutate(mock_info)

        self.assertFalse(result.success)
        self.assertEqual(result.errors, ["Authentication required."])

    def test_decorator_on_query_with_authenticated_user(self):
        """Test that decorator allows authenticated users to execute queries."""

        # Create mock info with authenticated user
        mock_info = init_mock_info(self.user)

        # Call the resolver
        query_instance = MockQuery()
        result = query_instance.resolve_test_field(mock_info)

        self.assertEqual(result, "test_result")

    def test_decorator_on_query_with_unauthenticated_user(self):
        """Test that decorator raises exception for unauthenticated users on queries."""

        # Create mock info with anonymous user
        mock_info = init_mock_info(AnonymousUser())

        # Call the resolver and expect exception
        query_instance = MockQuery()
        with self.assertRaises(Exception) as context:
            query_instance.resolve_test_field(mock_info)

        self.assertEqual(str(context.exception), "Authentication required.")

    def test_decorator_preserves_function_arguments(self):
        """Test that decorator properly passes through arguments to wrapped function."""

        # Create mock info with authenticated user
        mock_info = init_mock_info(self.user)

        # Create mutation instance and call with arguments
        mutation_instance = TestMutationWithArgs()
        result = mutation_instance.mutate(mock_info, arg1="test", arg2=100)

        self.assertTrue(result.success)
        self.assertEqual(result.arg1_value, "test")
        self.assertEqual(result.arg2_value, 100)


def init_mock_info(user):
    """
    Initializes a mock object representing the `info` parameter in GraphQL resolvers.
    """
    mock_info = Mock()
    mock_info.context.user = user
    return mock_info
