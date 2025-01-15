## 1. **Start the Docker Container**

`documentation/rundbDocker/`

Run the following command to start the container in detached mode:

```bash
docker-compose up -d
```

### What Happens Here?

- Pulls the `postgres:latest` image (if not already available).
- Starts a container named `postgres_container`.
- Maps port `5432` from the container to your host machine.
- Uses `postgres_data` for persistent storage.

---

## 2. **Verify the Running Container**

Use this command to ensure the container is running:

```bash
docker ps
```

### Example Output:

```
CONTAINER ID   IMAGE             COMMAND                  STATUS          PORTS                    NAMES
abcd1234       postgres:latest   "docker-entrypoint.s…"   Up 2 minutes    0.0.0.0:5432->5432/tcp   postgres_container
```

---

## 3. **Access `psql` from Inside the Container**

## Directly Run `psql`

If you don’t want to enter the shell, run this command directly:

```bash
$ docker exec -it postgres_container psql -U demouser -d demodb
```

## 4. run postgres commands

```postgres
\l

\c demodb

\dt ->  List database tables
```

---

## 4. **Stop and Remove the Container**

To stop the running container and clean up resources, use:

```bash
docker-compose down
```

---

## 5.To create a backup after creating table

From your host terminal (not inside the container):

```bash
docker cp postgres_container:/tmp/backup.sql ./backup.sql
```
