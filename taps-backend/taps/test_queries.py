import json

from django.contrib.auth.models import User
from django.test import Client, TestCase

from taps.models import Beer, Brewery, SavedBeer


class SavedBeersResolverTestCase(TestCase):
    """Test the savedBeers query resolver."""

    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username="test@example.com",
            email="test@example.com",
            password="testPassword123!",
        )

        # Create a brewery
        self.brewery = Brewery.objects.create(
            name="Test Brewery", city="Test City", state_province="Test State"
        )

        # Create multiple beers
        self.beer1 = Beer.objects.create(
            name="Test Beer 1",
            brewery=self.brewery,
            style="IPA",
            abv=5.5,
            description="Test description 1",
        )
        self.beer2 = Beer.objects.create(
            name="Test Beer 2",
            brewery=self.brewery,
            style="STOUT",
            abv=6.0,
            description="Test description 2",
        )
        self.beer3 = Beer.objects.create(
            name="Test Beer 3",
            brewery=self.brewery,
            style="LAGER",
            abv=4.5,
            description="Test description 3",
        )

    def execute_saved_beers_query(self, count=None):
        """
        Helper method to execute savedBeers query.

        Args:
            count: Optional count parameter to limit results

        Returns:
            The full JSON response from the GraphQL endpoint
        """
        count_param = f"(count: {count})" if count is not None else ""
        query = f"""
            query {{
                savedBeers{count_param} {{
                    id
                    name
                    brewery {{
                        name
                    }}
                }}
            }}
        """

        response = self.client.post(
            "/graphql",
            data=json.dumps({"query": query}),
            content_type="application/json",
        )
        return response.json()

    def test_saved_beers_authenticated_user_with_saved_beers(self):
        """Test that authenticated user can retrieve their saved beers."""
        self.client.force_login(self.user)

        # Save some beers for the user
        SavedBeer.objects.create(user=self.user, beer=self.beer1)
        SavedBeer.objects.create(user=self.user, beer=self.beer2)

        result = self.execute_saved_beers_query()
        data = result["data"]["savedBeers"]

        self.assertEqual(len(data), 2)
        beer_names = [beer["name"] for beer in data]
        self.assertIn("Test Beer 1", beer_names)
        self.assertIn("Test Beer 2", beer_names)

    def test_saved_beers_authenticated_user_with_no_saved_beers(self):
        """Test that authenticated user with no saved beers gets empty list."""
        self.client.force_login(self.user)

        result = self.execute_saved_beers_query()
        data = result["data"]["savedBeers"]

        self.assertEqual(len(data), 0)

    def test_saved_beers_unauthenticated_user(self):
        """Test that unauthenticated user receives authentication error."""
        result = self.execute_saved_beers_query()

        # When @login_required decorator is applied to a query, it raises an exception
        self.assertIn("errors", result)
        self.assertIn("Authentication required.", str(result["errors"]))

    def test_saved_beers_respects_count_parameter(self):
        """Test that count parameter limits the number of returned beers."""
        self.client.force_login(self.user)

        # Save all three beers
        SavedBeer.objects.create(user=self.user, beer=self.beer1)
        SavedBeer.objects.create(user=self.user, beer=self.beer2)
        SavedBeer.objects.create(user=self.user, beer=self.beer3)

        result = self.execute_saved_beers_query(count=2)
        data = result["data"]["savedBeers"]

        self.assertEqual(len(data), 2)

    def test_saved_beers_ordered_by_created_at_desc(self):
        """Test that saved beers are returned in reverse chronological order."""
        self.client.force_login(self.user)

        # Save beers in specific order
        SavedBeer.objects.create(user=self.user, beer=self.beer1)
        SavedBeer.objects.create(user=self.user, beer=self.beer2)
        SavedBeer.objects.create(user=self.user, beer=self.beer3)

        result = self.execute_saved_beers_query()
        data = result["data"]["savedBeers"]

        # Most recently saved should be first
        self.assertEqual(data[0]["name"], "Test Beer 3")
        self.assertEqual(data[1]["name"], "Test Beer 2")
        self.assertEqual(data[2]["name"], "Test Beer 1")

    def test_saved_beers_isolated_by_user(self):
        """Test that users only see their own saved beers."""
        self.client.force_login(self.user)

        # Create another user and save beers for them
        other_user = User.objects.create_user(
            username="other@example.com",
            email="other@example.com",
            password="otherPassword123!",
        )

        # Save beers for both users
        SavedBeer.objects.create(user=self.user, beer=self.beer1)
        SavedBeer.objects.create(user=other_user, beer=self.beer2)
        SavedBeer.objects.create(user=other_user, beer=self.beer3)

        result = self.execute_saved_beers_query()
        data = result["data"]["savedBeers"]

        # Should only see beer1 (saved by current user)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["name"], "Test Beer 1")
