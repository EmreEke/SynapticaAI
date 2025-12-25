# SynapticaAI - Yapay Zeka Destekli CV Analiz ve İşe Alım Sistemi

SynapticaAI, iş ilanları ve CV'leri yapay zeka teknolojisi kullanarak analiz eden, eşleştirme yapan ve aday değerlendirmesi yapan modern bir işe alım yönetim sistemidir.

## 🚀 Özellikler

- **CV Analizi**: PDF ve DOCX formatındaki CV'leri otomatik analiz eder
- **Yapay Zeka Destekli Değerlendirme**: Google Gemini AI ile detaylı aday analizi
- **Akıllı Eşleştirme**: Yetenek bazlı ve anlamsal benzerlik skorları ile CV-iş ilanı eşleştirme
- **Dashboard & İstatistikler**: Detaylı grafikler ve raporlar
- **Not Yönetimi**: Aday özelinde not ekleme ve düzenleme
- **CV Görüntüleme**: Zoom, indirme, yazdırma özellikleri
- **Mülakat Daveti**: E-posta ile otomatik davet gönderme
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu modern arayüz
- **Dark Mode**: Açık/koyu tema desteği

## 🛠️ Teknolojiler

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - İlişkisel veritabanı
- **SQLAlchemy** - ORM
- **SpaCy** - Doğal dil işleme
- **scikit-learn** - Makine öğrenmesi
- **Google Gemini AI** - Yapay zeka analizi
- **JWT** - Kimlik doğrulama

### Frontend
- **Angular 17** - Modern web framework
- **PrimeNG** - UI component library
- **Chart.js** - Grafik görselleştirme
- **RxJS** - Reactive programming
- **TypeScript** - Type-safe JavaScript

## 📋 Gereksinimler

### Backend
- Python 3.10+
- PostgreSQL 12+

### Frontend
- Node.js 18+
- npm veya yarn

## 🔧 Kurulum

### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/kullanici_adi/SynapticaAI.git
cd SynapticaAI
```

### 2. Backend Kurulumu

```bash
# Backend dizinine gidin
cd backend

# Virtual environment oluşturun
python -m venv venv

# Virtual environment'ı aktifleştirin
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Bağımlılıkları yükleyin
pip install -r requirements.txt

# SpaCy modelini indirin (Türkçe veya İngilizce)
python -m spacy download tr_core_news_tr
# veya
python -m spacy download en_core_web_sm

# .env dosyası oluşturun
cp .env.example .env  # Eğer varsa
# veya manuel olarak oluşturun

# .env dosyasını düzenleyin ve gerekli değişkenleri ekleyin:
# SECRET_KEY=your_secret_key_here
# GEMINI_API_KEY=your_gemini_api_key_here
# DATABASE_URL=postgresql://user:password@localhost/synaptica
# SMTP_SERVER=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USERNAME=your_email@gmail.com
# SMTP_PASSWORD=your_app_password
# SMTP_FROM_EMAIL=your_email@gmail.com

# Veritabanını oluşturun (PostgreSQL'de)
createdb synaptica

# Sunucuyu başlatın
uvicorn main:app --reload
```

### 3. Frontend Kurulumu

```bash
# Frontend dizinine gidin
cd frontend

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm start
```

Frontend http://localhost:4200 adresinde çalışacaktır.

## 📝 Yapılandırma

### Backend .env Dosyası

Backend dizininde `.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# JWT Secret Key
SECRET_KEY=your_secret_key_here

# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Database URL
DATABASE_URL=postgresql://user:password@localhost/synaptica

# SMTP Ayarları (E-posta göndermek için)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
```

**ÖNEMLİ**: `.env` dosyası asla GitHub'a eklenmemelidir! Bu dosya hassas bilgiler içerir.

Detaylı SMTP kurulumu için [SMTP_SETUP.md](backend/SMTP_SETUP.md) dosyasına bakın.

## 🎯 Kullanım

1. **İş İlanı Oluşturma**: Jobs sayfasından yeni iş ilanı oluşturun ve gerekli yetenekleri belirtin
2. **CV Yükleme**: Candidates sayfasından CV'leri yükleyin
3. **Analiz**: Sistem otomatik olarak CV'leri analiz eder ve eşleşme skorları verir
4. **Değerlendirme**: AI destekli detaylı analizleri inceleyin
5. **Mülakat Daveti**: Uygun adayları mülakata davet edin

## 📁 Proje Yapısı

```
SynapticaAI/
├── backend/
│   ├── services/        # İş mantığı servisleri
│   ├── main.py          # FastAPI ana dosyası
│   ├── models.py        # SQLAlchemy modelleri
│   ├── schemas.py       # Pydantic şemaları
│   ├── database.py      # Veritabanı bağlantısı
│   └── requirements.txt # Python bağımlılıkları
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # Angular bileşenleri
│   │   │   ├── pages/       # Sayfa bileşenleri
│   │   │   ├── services/    # Angular servisleri
│   │   │   └── models/      # TypeScript modelleri
│   │   └── styles.css       # Global stiller
│   ├── package.json         # Node.js bağımlılıkları
│   └── requirements.txt     # Frontend bağımlılık referansı
│
└── README.md
```

## 🔒 Güvenlik

- `.env` dosyası asla version control'e eklenmemelidir
- `SECRET_KEY` güçlü ve rastgele olmalıdır
- API anahtarları güvenli bir şekilde saklanmalıdır
- Production ortamında HTTPS kullanılmalıdır

## 📄 Lisans

Bu proje eğitim amaçlıdır.

## 👤 Geliştirici

[Adınız]

## 🙏 Teşekkürler

- FastAPI
- Angular
- PrimeNG
- Google Gemini AI
- SpaCy

