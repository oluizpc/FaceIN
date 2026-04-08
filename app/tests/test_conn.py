import psycopg2

conn = psycopg2.connect(
    dbname="face_in",
    user="luizpaullo",
    password="123456",
    host="localhost",
    port="5432"
)

print("Conectou!")