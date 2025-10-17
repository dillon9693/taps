# Taps

Beer discovery app.

## Deployment

This application can be deployed to production using AWS and Vercel. For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Local development

You can run the application locally in two ways: using Docker Compose for a production-like environment, or running the frontend and backend separately for development.

### Using Docker Compose (Production-like Environment)

This method uses Docker Compose to run the entire application stack (frontend, backend, and database) in a production-like environment.

#### Installing Docker and Docker Compose

1. **Install Docker Desktop**:

   - For macOS: Download and install from [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
   - For Windows: Download and install from [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
   - For Linux: Follow the instructions for your distribution on [Docker Engine](https://docs.docker.com/engine/install/)

2. **Verify Docker installation**:

   ```bash
   docker --version
   ```

3. **Install Docker Compose** (if not included with Docker Desktop):

   - For macOS and Windows: Docker Compose is included with Docker Desktop
   - For Linux:
     ```bash
     sudo apt-get update
     sudo apt-get install docker-compose-plugin
     ```

4. **Verify Docker Compose installation**:
   ```bash
   docker compose version
   ```

#### Running the Application

1. Make sure Docker Desktop is running
2. Run the following command from the project root:

```bash
docker compose up
```

3. Access the application:

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/graphql
   - Admin interface: http://localhost:8000/admin

4. To create sample data:

```bash
docker compose exec backend poetry run python manage.py add_sample_data
```

5. To create a superuser:

```bash
docker compose exec backend poetry run python manage.py createsuperuser
```

### Running Frontend and Backend Separately (Development)

#### Front-End

The front-end uses React and [Apollo](https://www.apollographql.com/docs/react) (as a GraphQL client). It uses [Mantine](https://mantine.dev/) as the component library and design system.

All commands below need to be run from the `client` folder.

To run front-end:

```bash
cd client
npm install
npm start
```

#### Back-end

The back-end is built using Python and [Django](https://www.djangoproject.com/). The GraphQL queries are defined using [graphene](https://graphene-python.org/).

The back-end uses [Poetry](https://python-poetry.org/) to manage Python versioning and environment. Any commands that run Python should be prefixed with `poetry run`.

All commands below need to be run from the `taps-backend` folder.

To run back-end:

```bash
cd taps-backend
poetry config virtualenvs.in-project true
poetry install
poetry run ./manage.py migrate
poetry run ./manage.py runserver 8000
```

To create sample data:

```bash
poetry run python manage.py add_sample_data
```

Note: this doesn't delete any existing data

To create a new super user in Django admin portal:

```bash
poetry run python manage.py createsuperuser
```

### Verifying the Application

To verify that the application is working correctly:

1. Access the frontend at http://localhost:3000
2. You should see the Taps beer discovery app homepage
3. Navigate to the search page to see a list of beers
4. Click on a beer to see its details
5. Access the GraphQL playground at http://localhost:8000/graphql to test API queries
6. Access the admin interface at http://localhost:8000/admin (login with your superuser credentials)
