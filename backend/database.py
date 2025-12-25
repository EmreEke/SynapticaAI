from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

SQLALCHEMY_DATABASE_URL = "postgresql://postgres:0000@localhost/synaptica"

try:
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    connection = engine.connect()
    print("[OK] Veritabani baglantisi basarili!")
    connection.close()
except Exception as e:
    print(f"[HATA] Veritabani baglanti hatasi: {e}")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Her istekte veritabanı oturumu oluşturur ve işlem bitince kapatır."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    print("Veritabanı bağlantısı test ediliyor...")
