postgres: 
	docker run --name dashboard -p 5432:5432 -e POSTGRES_USER=doadmin -e POSTGRES_PASSWORD=asdfasdf -d postgres:16.2-alpine

createDB:
	docker exec -it dashboard createdb --username=doadmin --owner=doadmin dashdb

dropDB:
	docker exec -it dashboard dropdb --username=doadmin dashdb