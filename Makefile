postgres: 
	docker run --name mysecret -p 5432:5432 -e POSTGRES_USER=doadmin -e POSTGRES_PASSWORD=asdfasdf -d postgres:16.2-alpine

createDB:
	docker exec -it mysecret createdb --username=doadmin --owner=doadmin secretdb

dropDB:
	docker exec -it mysecret dropdb --username=doadmin secretdb