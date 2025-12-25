# SMTP (E-Posta) Kurulum Rehberi

SynapticaAI, mülakat daveti e-postaları göndermek için SMTP kullanır. Bu rehberde farklı e-posta sağlayıcıları için kurulum adımları bulunmaktadır.

## 📋 Genel Kurulum

1. Backend dizininde `.env` dosyası oluşturun (veya mevcut olanı düzenleyin)
2. Aşağıdaki SMTP ayarlarını ekleyin:

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
```

3. Backend'i yeniden başlatın

---

## 🔵 Gmail Kurulumu

### Adım 1: 2 Adımlı Doğrulamayı Açın
1. Google Hesabınıza giriş yapın
2. [Güvenlik](https://myaccount.google.com/security) sayfasına gidin
3. "2 Adımlı Doğrulama"yı açın

### Adım 2: Uygulama Şifresi Oluşturun
1. [Uygulama Şifreleri](https://myaccount.google.com/apppasswords) sayfasına gidin
2. "Uygulama seçin" → "E-posta" seçin
3. "Cihaz seçin" → "Diğer (Özel ad)" → "SynapticaAI" yazın
4. "Oluştur" butonuna tıklayın
5. **16 haneli şifreyi kopyalayın** (boşluksuz)

### Adım 3: .env Dosyasını Düzenleyin

```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx  # 16 haneli uygulama şifresi (boşluksuz)
SMTP_FROM_EMAIL=your_email@gmail.com
```

**ÖNEMLİ:** Normal Gmail şifrenizi değil, **Uygulama Şifresi**ni kullanın!

---

## 📧 Outlook/Hotmail Kurulumu

```env
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USERNAME=your_email@outlook.com
SMTP_PASSWORD=your_password
SMTP_FROM_EMAIL=your_email@outlook.com
```

**Not:** Outlook için normal şifrenizi kullanabilirsiniz.

---

## 🟡 Yandex Mail Kurulumu

```env
SMTP_SERVER=smtp.yandex.com
SMTP_PORT=465
SMTP_USERNAME=your_email@yandex.com
SMTP_PASSWORD=your_password
SMTP_FROM_EMAIL=your_email@yandex.com
```

**Not:** Yandex Mail için normal şifrenizi kullanabilirsiniz.

---

## 🟢 Diğer E-posta Sağlayıcıları

### Yahoo Mail
```env
SMTP_SERVER=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USERNAME=your_email@yahoo.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@yahoo.com
```

### Zoho Mail
```env
SMTP_SERVER=smtp.zoho.com
SMTP_PORT=587
SMTP_USERNAME=your_email@zoho.com
SMTP_PASSWORD=your_password
SMTP_FROM_EMAIL=your_email@zoho.com
```

---

## ✅ Test Etme

Mail gönderme özelliğini test etmek için:

1. Frontend'de bir aday seçin
2. "Mülakat Daveti" butonuna tıklayın
3. E-posta adresini girin
4. "Davet Gönder" butonuna tıklayın

**Başarılı:** "Mülakat daveti e-postası başarıyla gönderildi" mesajı görünür.

**Hata:** "E-posta gönderilemedi" mesajı görünürse:
- Backend konsolunda hata mesajlarını kontrol edin
- SMTP ayarlarını doğrulayın
- Firewall/güvenlik duvarı ayarlarını kontrol edin

---

## 🔒 Güvenlik Notları

1. **.env dosyasını asla Git'e commit etmeyin!**
2. Uygulama şifrelerini güvenli tutun
3. Production ortamında güçlü şifreler kullanın
4. SMTP şifrelerini düzenli olarak değiştirin

---

## 🐛 Sorun Giderme

### "SMTP Kimlik Doğrulama Hatası"
- Gmail kullanıyorsanız: Uygulama şifresi kullandığınızdan emin olun
- Şifrenin doğru olduğundan emin olun
- 2 Adımlı Doğrulama'nın açık olduğundan emin olun

### "Bağlantı Hatası"
- SMTP_SERVER adresini kontrol edin
- SMTP_PORT'un doğru olduğundan emin olun
- Firewall ayarlarını kontrol edin
- İnternet bağlantınızı kontrol edin

### "Mail Gönderilemedi"
- Backend konsolunda hata mesajlarını kontrol edin
- .env dosyasının doğru konumda olduğundan emin olun
- Backend'i yeniden başlatın

---

## 📞 Destek

Sorun yaşıyorsanız:
1. Backend konsolundaki hata mesajlarını kontrol edin
2. .env dosyasındaki ayarları doğrulayın
3. E-posta sağlayıcınızın SMTP dokümantasyonunu inceleyin

