# GitHub'a Proje Ekleme Rehberi

Bu rehber, SynapticaAI projesini GitHub'a ekleme adımlarını açıklar.

## 📋 Ön Hazırlık

1. **GitHub hesabı** oluşturun (yoksa): https://github.com/signup
2. **GitHub Desktop** veya **Git** kurulu olmalı:
   - GitHub Desktop: https://desktop.github.com/ (Önerilen - Kolay kullanım)
   - Git (Terminal için): https://git-scm.com/downloads

---

## 🖥️ YÖNTEM 1: GitHub Desktop ile (ÖNERİLEN - Kolay Yöntem)

GitHub Desktop, görsel arayüzü sayesinde Git komutları bilmeden projelerinizi yönetmenizi sağlar.

### GitHub Desktop Kurulumu

1. **GitHub Desktop'ı İndirin ve Kurun**
   - https://desktop.github.com/ adresinden indirin
   - Kurulumu tamamlayın
   - GitHub hesabınızla giriş yapın

2. **GitHub Desktop'ı Açın**

### Adım 1: Projeyi GitHub Desktop'a Ekleme

#### Seçenek A: Mevcut Projeyi Eklemek

1. GitHub Desktop'ta **"File"** → **"Add Local Repository"** tıklayın
   - Veya **"File"** → **"Options"** → **"Add Repository"** → **"Add Existing Repository"**

2. **"Choose..."** butonuna tıklayın ve proje dizinini seçin:
   ```
   C:\Users\emree\OneDrive\Belgeler\Bitirme Projesi\SynapticaAI
   ```

3. **"Add Repository"** butonuna tıklayın

4. Eğer proje henüz Git repository değilse, GitHub Desktop şunu soracaktır:
   - **"Create a repository"** seçeneğini seçin
   - Repository adı: `SynapticaAI`
   - **"Initialize this repository with a README"** işaretini KALDIRIN (zaten README.md var)

#### Seçenek B: Yeni Repository Oluşturmak

1. GitHub Desktop'ta **"File"** → **"New Repository"** tıklayın

2. Formu doldurun:
   - **Name**: `SynapticaAI`
   - **Description**: (İsteğe bağlı) "AI-powered CV analysis and recruitment system"
   - **Local path**: `C:\Users\emree\OneDrive\Belgeler\Bitirme Projesi`
   - **"Initialize this repository with a README"** işaretini KALDIRIN (zaten README.md var)
   - **Git ignore**: `None` seçin (çünkü zaten `.gitignore` dosyanız var)

3. **"Create Repository"** butonuna tıklayın

### Adım 2: Dosyaları Kontrol Etme

1. GitHub Desktop'ın sol tarafında **"Changes"** sekmesine tıklayın
2. Burada eklenecek dosyaları göreceksiniz

**✅ Görmeniz Gerekenler:**
- Kod dosyaları (.py, .ts, .html, .css)
- requirements.txt, package.json
- README.md, .gitignore
- Diğer proje dosyaları

**❌ Görmemeniz Gerekenler:**
- `.env` dosyaları (hassas bilgiler)
- `venv/` klasörü
- `node_modules/` klasörü
- `uploads/` klasörü
- `__pycache__/` klasörleri
- `dist/` klasörü

**Eğer bu dosyalar görünüyorsa:**
- `.gitignore` dosyasını kontrol edin
- GitHub Desktop'ta **"Repository"** → **"Repository Settings"** → **"Ignored Files"** bölümünü kontrol edin

### Adım 3: İlk Commit Yapma

1. Sol alttaki **"Summary"** kutusuna commit mesajı yazın:
   ```
   Initial commit: SynapticaAI project
   ```

2. (İsteğe bağlı) **"Description"** kutusuna detaylı açıklama ekleyebilirsiniz

3. **"Commit to main"** butonuna tıklayın
   - Dosyalar artık yerel repository'nize commit edildi

### Adım 4: GitHub'a Yayınlama (Publish)

1. GitHub Desktop'ın üst kısmında **"Publish repository"** butonunu göreceksiniz
   - Bu buton yalnızca ilk commit'ten sonra görünür

2. **"Publish repository"** butonuna tıklayın

3. Açılan pencerede:
   - **Name**: `SynapticaAI` (veya istediğiniz ad)
   - **Description**: (İsteğe bağlı) Proje açıklaması
   - **"Keep this code private"** seçeneğini işaretleyin (isterseniz public de yapabilirsiniz)
   - **Organization**: (İsteğe bağlı) Bir organizasyona eklemek için

4. **"Publish Repository"** butonuna tıklayın

5. GitHub Desktop dosyalarınızı GitHub'a yükleyecek (birkaç dakika sürebilir)

6. Tamamlandığında, GitHub Desktop size başarı mesajı gösterecek

### Adım 5: GitHub'da Kontrol Etme

1. GitHub Desktop'ta **"View on GitHub"** butonuna tıklayın
   - Veya tarayıcıda şu adresi açın: `https://github.com/KULLANICI_ADI/SynapticaAI`

2. Dosyaların GitHub'da göründüğünü kontrol edin

### Sonraki Değişiklikleri Yükleme

Projede değişiklik yaptığınızda:

1. GitHub Desktop otomatik olarak değişiklikleri algılayacak
2. **"Changes"** sekmesinde değişen dosyaları göreceksiniz
3. Commit mesajı yazın
4. **"Commit to main"** butonuna tıklayın
5. Üstteki **"Push origin"** butonuna tıklayın (veya **"Push"** menüsünden)

---

## 💻 YÖNTEM 2: Terminal/Command Line ile (Gelişmiş Kullanıcılar için)

### 1. Proje Dizinine Git

```bash
cd "C:\Users\emree\OneDrive\Belgeler\Bitirme Projesi\SynapticaAI"
```

### 2. Git Repository Başlat (Eğer başlatılmamışsa)

```bash
git init
```

### 3. .gitignore Dosyasını Kontrol Et

Proje kök dizininde `.gitignore` dosyası oluşturulmuş olmalı. Bu dosya, GitHub'a eklenmemesi gereken dosyaları belirtir:

- `backend/venv/` - Virtual environment
- `backend/.env` - Gizli API anahtarları
- `backend/uploads/` - Yüklenen CV dosyaları
- `frontend/node_modules/` - Node.js paketleri
- `frontend/dist/` - Build çıktıları
- `__pycache__/` - Python cache dosyaları

### 4. Tüm Dosyaları Stage'e Ekle

```bash
git add .
```

**ÖNEMLİ**: `.gitignore` dosyası doğru çalışıyorsa, yukarıdaki hassas dosyalar eklenmeyecektir.

### 5. Eklenecek Dosyaları Kontrol Et

Hangi dosyaların ekleneceğini görmek için:

```bash
git status
```

Bu komut şunları göstermelidir:
- ✅ Kod dosyaları (.py, .ts, .html, .css)
- ✅ requirements.txt, package.json
- ✅ README.md, .gitignore
- ❌ .env dosyaları (eklenmemeli!)
- ❌ venv/, node_modules/ (eklenmemeli!)
- ❌ uploads/ klasörü (eklenmemeli!)

**Eğer .env veya diğer hassas dosyalar görünüyorsa**, `.gitignore` dosyasını kontrol edin.

### 6. İlk Commit'i Yap

```bash
git commit -m "Initial commit: SynapticaAI project"
```

### 7. GitHub'da Yeni Repository Oluştur

1. GitHub.com'a giriş yapın
2. Sağ üstteki **"+"** butonuna tıklayın
3. **"New repository"** seçin
4. Repository adını girin: `SynapticaAI` (veya istediğiniz ad)
5. Açıklama ekleyin (opsiyonel)
6. **Public** veya **Private** seçin
7. **"Add a README file"** seçeneğini İŞARETLEMEYİN (zaten var)
8. **"Create repository"** butonuna tıklayın

### 8. Local Repository'yi GitHub'a Bağla

GitHub'da repository oluşturduktan sonra, GitHub size bağlantı komutlarını gösterecek. Genellikle şöyle bir komut gösterilir:

```bash
git remote add origin https://github.com/KULLANICI_ADI/SynapticaAI.git
```

**KULLANICI_ADI** yerine kendi GitHub kullanıcı adınızı yazın.

### 9. Dosyaları GitHub'a Gönder

```bash
git branch -M main
git push -u origin main
```

Bu komutlar:
- Ana branch'i `main` olarak adlandırır
- Dosyaları GitHub'a yükler

### 10. GitHub'da Kontrol Et

Tarayıcınızda repository sayfasını açın ve dosyaların yüklendiğini kontrol edin:
`https://github.com/KULLANICI_ADI/SynapticaAI`

## ✅ Doğrulama Kontrol Listesi

GitHub'a yüklenmeden önce şunların `.gitignore`'da olduğundan emin olun:

- [ ] `backend/.env` - API anahtarları ve şifreler
- [ ] `backend/venv/` - Virtual environment
- [ ] `backend/uploads/` - Yüklenen CV dosyaları
- [ ] `backend/__pycache__/` - Python cache
- [ ] `backend/*.pdf`, `backend/*.docx` - Test CV dosyaları
- [ ] `frontend/node_modules/` - Node.js paketleri
- [ ] `frontend/dist/` - Build çıktıları

## 🔒 Güvenlik Kontrolü

Eğer yanlışlıkla hassas bir dosyayı commit ettyseniz:

### 1. Son Commit'i Geri Al (Henüz push edilmediyse)

```bash
git reset --soft HEAD~1
```

### 2. .env Dosyasını .gitignore'a Ekle

`.gitignore` dosyasında şu satırın olduğundan emin olun:
```
backend/.env
*.env
```

### 3. Cache'i Temizle ve Yeniden Commit Et

```bash
git rm --cached backend/.env
git add .
git commit -m "Remove sensitive files"
```

### 4. Eğer Zaten Push Edildiyse

Eğer hassas dosyalar zaten GitHub'a yüklendiyse:

1. GitHub'da `.env` dosyasını silin (web arayüzünden)
2. `.gitignore` dosyasını güncelleyin
3. Repository'yi yeniden klonlayın
4. `.env` dosyasını tekrar oluşturun

**ÖNEMLİ**: Eğer API anahtarları veya şifreler GitHub'a yüklendiyse, onları değiştirin!

## 📝 İleri Seviye: Git Komutları

### Değişiklikleri GitHub'a Gönderme

```bash
git add .
git commit -m "Değişiklik açıklaması"
git push
```

### Son Durumu Kontrol Etme

```bash
git status
```

### Commit Geçmişini Görüntüleme

```bash
git log
```

## 🆘 Sorun Giderme

### "Permission denied" Hatası

SSH anahtarlarınızı yapılandırmanız gerekebilir veya HTTPS ile devam edin.

### ".env dosyası hala görünüyor"

```bash
git rm --cached backend/.env
git commit -m "Remove .env from tracking"
git push
```

### "node_modules eklenmek isteniyor"

`.gitignore` dosyasında şu satırın olduğundan emin olun:
```
frontend/node_modules/
```

---

## 📊 Yöntem Karşılaştırması

| Özellik | GitHub Desktop | Terminal/CLI |
|---------|---------------|--------------|
| **Kolaylık** | ⭐⭐⭐⭐⭐ Çok Kolay | ⭐⭐⭐ Orta |
| **Hız** | ⭐⭐⭐⭐ Hızlı | ⭐⭐⭐⭐⭐ Çok Hızlı |
| **Görsel Arayüz** | ✅ Var | ❌ Yok |
| **Değişiklik Önizleme** | ✅ Var | ⚠️ Komutlarla |
| **Başlangıç** | ⭐⭐⭐⭐⭐ Çok Kolay | ⭐⭐ Zor |
| **Önerilen** | ✅ Yeni Başlayanlar | ✅ İleri Seviye |

**Öneri**: Yeni başlayanlar için **GitHub Desktop** kullanmanızı öneririz.

---

## 📚 Yararlı Kaynaklar

- [GitHub Desktop Dokümantasyonu](https://docs.github.com/en/desktop)
- [Git Resmi Dokümantasyonu](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [.gitignore Örnekleri](https://github.com/github/gitignore)
- [GitHub Desktop İndirme](https://desktop.github.com/)

