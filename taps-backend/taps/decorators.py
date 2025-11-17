"""
GraphQL authentication decorators for the Taps application.
"""

from collections.abc import Callable
from functools import wraps
from typing import Any

from graphene.types.resolver import ResolveInfo


def login_required(func: Callable[..., Any]) -> Callable[..., Any]:
    """
    Decorator that checks if a user is authenticated before executing a GraphQL
    mutation or query resolver.

    For mutations (methods named 'mutate'):
        Returns the mutation class with success=False and an error message if the
        user is not authenticated.

    For queries (methods starting with 'resolve_'):
        Raises an exception if the user is not authenticated.

    Usage:
        For mutations:
        ```python
        class MyMutation(graphene.Mutation):
            success = graphene.Boolean()
            errors = graphene.List(graphene.String)

            @login_required
            def mutate(self, info, **kwargs):
                # mutation logic here
                return MyMutation(success=True, errors=[])
        ```

        For queries:
        ```python
        class Query(graphene.ObjectType):
            @login_required
            def resolve_my_field(self, info, **kwargs):
                # query logic here
                return result
        ```

    Args:
        func: The mutation or query resolver function to wrap

    Returns:
        Wrapped function that checks authentication before execution
    """

    @wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Any:
        # Extract info from args
        # For mutations: args = (root, info, ...) where root is usually None
        # For queries: args = (self, info, ...)
        if len(args) < 2:
            raise Exception("Invalid resolver signature")

        info = args[1]
        # Type check that the second argument is ResolveInfo as expected
        if not isinstance(info, ResolveInfo):
            raise TypeError(
                f"Expected second argument to be ResolveInfo, got {type(info).__name__}"
            )
        user = info.context.user
        error_message = "Authentication required."

        if not user.is_authenticated:
            # For mutations, return error response
            if func.__name__ == "mutate":
                # Get the mutation class from the function's qualified name
                # func.__qualname__ is like 'ClassName.method_name'
                if "." in func.__qualname__:
                    class_name = func.__qualname__.rsplit(".", 1)[0]
                    # Try to get the class from the function's globals
                    if class_name in func.__globals__:
                        mutation_class = func.__globals__[class_name]
                        return mutation_class(success=False, errors=[error_message])

            # For queries, raise an exception
            if func.__name__.startswith("resolve_"):
                raise Exception(error_message)

            # For other methods, raise a generic exception
            raise Exception(error_message)

        # User is authenticated, proceed with the original function
        return func(*args, **kwargs)

    return wrapper
