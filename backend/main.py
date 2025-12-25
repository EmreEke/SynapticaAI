import pdfplumber
import io
import os
import shutil
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import List, Annotated, Optional
import uuid

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form, Body, status
from fastapi.responses import HTMLResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from passlib.context import CryptContext
from jose import JWTError, jwt
from dotenv import load_dotenv

from services.parser import DocumentParser
from services.extractor import CVExtractor
from services.matcher import HybridMatcher
from services.ai_advisor import AIAdvisor
from database import engine, Base, get_db
import models
import schemas

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "cok_gizli_anahtar_degistir_bunu")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SynapticaAI API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

matcher_engine = HybridMatcher()
cv_extractor = CVExtractor()
ai_advisor = AIAdvisor()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def verify_password(plain_password, hashed_password):
    """Düz metin şifre ile hash'lenmiş şifreyi karşılaştırır."""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """JWT token oluşturur ve belirtilen süre sonrasında expire olacak şekilde ayarlar."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """JWT token'ı doğrular ve kullanıcı bilgilerini döndürür."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulanamadı",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

def get_pdf_text(file_content: bytes) -> str:
    """PDF dosyasının byte içeriğinden metin çıkarır."""
    try:
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            text = ""
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
            return text
    except Exception as e:
        print(f"PDF Okuma Hatası: {e}")
        return ""

def send_invitation_email(
    recipient_email: str,
    candidate_name: str,
    job_title: str,
    company_name: str = None
) -> bool:
    """Adaya mülakat daveti e-postası gönderir."""
    try:
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_username = os.getenv("SMTP_USERNAME", "")
        smtp_password = os.getenv("SMTP_PASSWORD", "")
        smtp_from_email = os.getenv("SMTP_FROM_EMAIL", smtp_username)
        
        if not smtp_username or not smtp_password:
            print("[UYARI] SMTP ayarları bulunamadı. Mail gönderilemedi.")
            print("   .env dosyasına SMTP_USERNAME ve SMTP_PASSWORD ekleyin.")
            return False
        
        subject = f"Mülakat Daveti - {job_title}"
        
        html_body = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; line-height: 1.6;">
            <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f7fa; padding: 20px;">
                <tr>
                    <td align="center">
                        <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                            
                            <tr>
                                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                                        🎉 Mülakat Daveti
                                    </h1>
                                </td>
                            </tr>
                            
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <p style="margin: 0 0 20px 0; color: #1e293b; font-size: 16px;">
                                        Sayın <strong style="color: #667eea;">{candidate_name}</strong>,
                                    </p>
                                    
                                    <p style="margin: 0 0 20px 0; color: #475569; font-size: 15px;">
                                        Başvurduğunuz <strong style="color: #1e293b;">{job_title}</strong> pozisyonu için yaptığınız başvuruyu dikkatle inceledik. 
                                        CV'niz ve yetkinlikleriniz bizim için oldukça uygun görünmektedir.
                                    </p>
                                    
                                    <p style="margin: 0 0 30px 0; color: #475569; font-size: 15px;">
                                        Bir sonraki adımda sizinle tanışmak ve daha detaylı konuşmak istiyoruz. Bu nedenle sizi mülakata davet etmekten mutluluk duyuyoruz.
                                    </p>
                                    
                                    <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-left: 4px solid #667eea; padding: 20px; border-radius: 12px; margin: 30px 0;">
                                        <table role="presentation" style="width: 100%;">
                                            <tr>
                                                <td style="padding: 5px 0;">
                                                    <strong style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Pozisyon</strong>
                                                    <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 16px; font-weight: 600;">{job_title}</p>
                                                </td>
                                            </tr>
                                            {f'''<tr>
                                                <td style="padding: 5px 0;">
                                                    <strong style="color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Şirket</strong>
                                                    <p style="margin: 5px 0 0 0; color: #1e293b; font-size: 16px; font-weight: 600;">{company_name}</p>
                                                </td>
                                            </tr>''' if company_name else ''}
                                        </table>
                                    </div>
                                    
                                    <p style="margin: 30px 0 20px 0; color: #475569; font-size: 15px;">
                                        Mülakat detayları (tarih, saat, yer) hakkında size en kısa sürede ayrıntılı bilgi verilecektir. 
                                        Lütfen takviminizi kontrol ederek uygun zamanlarınızı belirleyin.
                                    </p>
                                    
                                    <p style="margin: 0 0 30px 0; color: #475569; font-size: 15px;">
                                        Sorularınız için bizimle iletişime geçmekten çekinmeyin. Görüşmek üzere!
                                    </p>
                                    
                                    <p style="margin: 0; color: #1e293b; font-size: 15px; font-weight: 600;">
                                        İyi günler dileriz,<br>
                                        <span style="color: #667eea;">İnsan Kaynakları Ekibi</span>
                                    </p>
                                </td>
                            </tr>
                            
                            <tr>
                                <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                                    <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                                        Bu e-posta otomatik olarak <strong>SynapticaAI</strong> sistemi tarafından gönderilmiştir.<br>
                                        Lütfen bu e-postaya doğrudan yanıt vermeyin. Sorularınız için lütfen İK departmanı ile iletişime geçin.
                                    </p>
                                </td>
                            </tr>
                            
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        text_body = f"""
Mülakat Daveti

Sayın {candidate_name},

Başvurduğunuz {job_title} pozisyonu için yaptığınız başvuruyu değerlendirdik ve sizi mülakata davet etmek istiyoruz.

CV'niz ve yetkinlikleriniz bizim için uygun görünmektedir. Bir sonraki adımda sizinle tanışmak ve daha detaylı konuşmak istiyoruz.

Pozisyon: {job_title}
{('Şirket: ' + company_name) if company_name else ''}

Mülakat detayları (tarih, saat, yer) hakkında size en kısa sürede bilgi verilecektir.

İyi günler dileriz.

---
Bu e-posta otomatik olarak gönderilmiştir.
        """
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = smtp_from_email
        msg['To'] = recipient_email
        
        part1 = MIMEText(text_body, 'plain', 'utf-8')
        part2 = MIMEText(html_body, 'html', 'utf-8')
        
        msg.attach(part1)
        msg.attach(part2)
        
        if smtp_port == 465:
            import ssl
            context = ssl.create_default_context()
            with smtplib.SMTP_SSL(smtp_server, smtp_port, context=context) as server:
                server.login(smtp_username, smtp_password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(smtp_server, smtp_port) as server:
                server.starttls()
                server.login(smtp_username, smtp_password)
                server.send_message(msg)
        
        print(f"[OK] Mail basariyla gonderildi: {recipient_email}")
        return True
        
    except smtplib.SMTPAuthenticationError:
        print(f"[HATA] SMTP Kimlik Dogrulama Hatasi: Kullanici adi veya sifre hatali.")
        return False
    except smtplib.SMTPException as e:
        print(f"[HATA] SMTP Hatasi: {e}")
        return False
    except Exception as e:
        print(f"[HATA] Mail Gonderme Hatasi: {e}")
        import traceback
        traceback.print_exc()
        return False

@app.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Yeni kullanıcı kaydı oluşturur."""
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Bu kullanıcı adı zaten alınmış.")
    
    hashed_pw = pwd_context.hash(user.password)
    new_user = models.User(
        username=user.username,
        hashed_password=hashed_pw,
        company_name=user.company_name,
        role=user.role 
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Kullanıcı girişi yapar ve JWT token döndürür."""
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı adı veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires 
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user.role}

@app.get("/api/me")
def read_users_me(current_user: models.User = Depends(get_current_user)):
    """Mevcut kullanıcının bilgilerini döndürür."""
    return {"username": current_user.username, "company": current_user.company_name}

@app.post("/api/job-ads", response_model=schemas.JobAdOut)
def create_job_ad(
    job_ad: schemas.JobAdCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Yeni iş ilanı oluşturur."""
    db_job_ad = models.JobAd(
        title=job_ad.title,
        description=job_ad.description,
        required_skills=job_ad.required_skills,
        user_id=current_user.id 
    )

    db.add(db_job_ad)
    db.commit()
    db.refresh(db_job_ad)
    return db_job_ad

@app.get("/api/job-ads", response_model=List[schemas.JobAdOut])
def read_job_ads(
    skip: int = 0, 
    limit: int = 100, 
    active_only: bool = False,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """İş ilanlarını listeler, sayfalama ve filtreleme desteği ile."""
    query = db.query(models.JobAd)
    if current_user.role != "admin":
        query = query.filter(models.JobAd.user_id == current_user.id)

    if active_only:
        query = query.filter(models.JobAd.is_active == True)
        
    jobs = query.order_by(models.JobAd.id.desc()).offset(skip).limit(limit).all()
    return jobs

@app.put("/api/job-ads/{job_id}", response_model=schemas.JobAdOut)
def update_job_ad(
    job_id: int, 
    job_update: schemas.JobAdCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Mevcut iş ilanını günceller."""
    job = db.query(models.JobAd).filter(models.JobAd.id == job_id, models.JobAd.user_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="İlan bulunamadı.")

    job.title = job_update.title
    job.description = job_update.description
    job.required_skills = job_update.required_skills
    job.is_active = job_update.is_active
    
    db.commit()
    db.refresh(job)
    return job

@app.post("/api/analyze-cv")
async def analyze_cv(
    file: UploadFile = File(...), 
    job_id: int = Form(...),
    candidate_name: str = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """CV dosyasını yükler, analiz eder ve veritabanına kaydeder."""
    try:
        content = await file.read()
        
        text = get_pdf_text(content)
        
        if not text:
            raise HTTPException(status_code=400, detail="PDF içeriği okunamadı.")

        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        await file.seek(0) 
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        data = cv_extractor.extract_data(text, file.filename)
        
        new_cv = models.CV(
            filename=candidate_name,
            raw_text=text,
            job_id=job_id,
            email=data['emails'][0] if data['emails'] else "Belirtilmemiş",
            user_id=current_user.id,
            file_path=file_path,
            skills=data['skills']
        )
        
        db.add(new_cv)
        db.commit()
        db.refresh(new_cv)

        job = db.query(models.JobAd).filter(models.JobAd.id == job_id).first()
        job_description = job.description if job else ""
        job_required_skills = job.required_skills if job else {}

        match_result = matcher_engine.match(
            cv_text=new_cv.raw_text,
            cv_skills=data['skills'],
            job_description=job_description,
            job_skills_weights=job_required_skills
        )
        
        new_cv.match_score = match_result['total_score']
        db.commit()

        return {
            "status": "success",
            "filename": new_cv.filename,
            "score": new_cv.match_score,
            "cv_id": new_cv.id
        }

    except Exception as e:
        print(f"[HATA] Sunucu hatasi: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Sunucu Hatası: {str(e)}")
    
@app.get("/api/cvs")
def read_cvs(
    skip: int = 0, 
    limit: int = 100, 
    job_id: int = None,
    search_query: str = None,
    notes_query: str = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """CV'leri listeler, isim araması, not filtresi ve sayfalama desteği ile."""
    query = db.query(models.CV)

    if current_user.role != "admin":
        query = query.filter(models.CV.user_id == current_user.id)

    if job_id:
        query = query.filter(models.CV.job_id == job_id)
    
    if search_query:
        search_query = search_query.strip()
        if search_query:
            query = query.filter(models.CV.filename.ilike(f"%{search_query}%"))
    
    if notes_query and notes_query.strip() == 'has_notes':
        query = query.filter(models.CV.notes.isnot(None)).filter(models.CV.notes != '')
    
    total_count = query.count()
    
    cvs = query.offset(skip).limit(limit).all()
    
    return {
        "items": cvs,
        "total_count": total_count
    }

@app.get("/api/cv-details/{cv_id}")
def get_cv_details(
    cv_id: int, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    """CV detaylarını ve eşleşme analizini döndürür."""
    cv = db.query(models.CV).filter(models.CV.id == cv_id).first()
    
    if not cv:
        raise HTTPException(status_code=404, detail="CV bulunamadı.")
    
    if current_user.role != "admin" and cv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Yetkisiz işlem.")
    
    job = db.query(models.JobAd).filter(models.JobAd.id == cv.job_id).first()
    
    job_description = job.description if job else ""
    job_required_skills = job.required_skills if job else {}
    
    match_result = matcher_engine.match(
        cv_text=cv.raw_text,
        cv_skills=cv.skills,
        job_description=job_description,
        job_skills_weights=job_required_skills
    )

    return {
        "cv": { 
            "id": cv.id, 
            "filename": cv.filename, 
            "email": cv.email if cv.email else "-", 
            "status": cv.status,
            "notes": cv.notes if cv.notes else None
        },
        "job": { "title": job.title if job else "Silinmiş İlan" },
        "analysis": match_result
    }

@app.put("/api/cvs/{cv_id}/status")
def update_cv_status(
    cv_id: int, 
    status_update: schemas.CVStatusUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Adayın statüsünü günceller, eğer 'Invited' ise e-posta gönderir."""
    cv = db.query(models.CV).filter(models.CV.id == cv_id).first()
    
    if not cv:
        raise HTTPException(status_code=404, detail="CV bulunamadı")
    
    if current_user.role != "admin" and cv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok.")

    job = db.query(models.JobAd).filter(models.JobAd.id == cv.job_id).first() if cv.job_id else None
    job_title = job.title if job else "Pozisyon"
    
    print(f"[INFO] Status guncelleniyor: ID={cv_id}, Yeni Status={status_update.status}")
    cv.status = status_update.status
    
    email_sent = False
    email_message = ""
    
    if status_update.status == "Invited" and status_update.email:
        recipient_email = status_update.email.strip()
        
        import re
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if re.match(email_pattern, recipient_email):
            candidate_name = cv.filename
            company_name = current_user.company_name if current_user.company_name else None
            
            email_sent = send_invitation_email(
                recipient_email=recipient_email,
                candidate_name=candidate_name,
                job_title=job_title,
                company_name=company_name
            )
            
            if email_sent:
                email_message = "Mülakat daveti e-postası başarıyla gönderildi."
            else:
                email_message = "Statü güncellendi ancak e-posta gönderilemedi. SMTP ayarlarını kontrol edin."
        else:
            email_message = "Geçersiz e-posta adresi formatı."
    
    try:
        db.commit()
        db.refresh(cv)
        
        response = {
            "message": "Statü başarıyla güncellendi",
            "id": cv.id,
            "new_status": cv.status
        }
        
        if status_update.status == "Invited":
            response["email_sent"] = email_sent
            response["email_message"] = email_message
        
        return response
        
    except Exception as e:
        db.rollback()
        print(f"[HATA] Status guncelleme hatasi: {e}")
        raise HTTPException(status_code=500, detail="Veritabanı güncelleme hatası")

@app.put("/api/cvs/{cv_id}/notes")
def update_cv_notes(
    cv_id: int,
    notes_update: schemas.CVNotesUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Aday notlarını günceller."""
    cv = db.query(models.CV).filter(models.CV.id == cv_id).first()
    
    if not cv:
        raise HTTPException(status_code=404, detail="CV bulunamadı")
    
    if current_user.role != "admin" and cv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok.")
    
    cv.notes = notes_update.notes
    db.commit()
    db.refresh(cv)
    
    return {"message": "Notlar başarıyla güncellendi", "notes": cv.notes}

@app.get("/api/cvs/{cv_id}/download")
def download_cv(
    cv_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """CV dosyasını indirmek için endpoint."""
    from fastapi.responses import FileResponse
    
    cv = db.query(models.CV).filter(models.CV.id == cv_id).first()
    
    if not cv:
        raise HTTPException(status_code=404, detail="CV bulunamadı")
    
    if current_user.role != "admin" and cv.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok.")
    
    if not os.path.exists(cv.file_path):
        raise HTTPException(status_code=404, detail="Dosya bulunamadı")
    
    return FileResponse(
        path=cv.file_path,
        filename=cv.filename,
        media_type='application/pdf' if cv.file_path.endswith('.pdf') else 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    )

@app.get("/api/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Dashboard için istatistikleri, grafik verilerini ve son aktiviteleri döndürür."""
    total_jobs = db.query(models.JobAd).count()
    active_candidates = db.query(models.CV).count()
    
    interviews = db.query(models.CV).filter(models.CV.status == "Interview").count()
    hired = db.query(models.CV).filter(models.CV.status == "Hired").count()
    invited = db.query(models.CV).filter(models.CV.status == "Invited").count()

    status_counts = db.query(models.CV.status, func.count(models.CV.id)).group_by(models.CV.status).all()
    
    pie_labels = [s[0] for s in status_counts]
    pie_data = [s[1] for s in status_counts]

    job_apps = db.query(models.JobAd.title, func.count(models.CV.id))\
                 .join(models.CV, models.JobAd.id == models.CV.job_id)\
                 .group_by(models.JobAd.title)\
                 .order_by(func.count(models.CV.id).desc())\
                 .limit(5)\
                 .all()

    bar_labels = [j[0] for j in job_apps]
    bar_data_vals = [j[1] for j in job_apps]

    monthly_data = []
    monthly_labels = []
    
    current_date = datetime.now()
    for i in range(5, -1, -1):
        target_month = current_date.month - i
        target_year = current_date.year
        
        while target_month <= 0:
            target_month += 12
            target_year -= 1
        
        month_start = datetime(target_year, target_month, 1, 0, 0, 0)
        
        if target_month == 12:
            month_end = datetime(target_year + 1, 1, 1, 0, 0, 0)
        else:
            month_end = datetime(target_year, target_month + 1, 1, 0, 0, 0)
        
        count = db.query(models.CV).filter(
            models.CV.created_at >= month_start,
            models.CV.created_at < month_end
        ).count()
        
        monthly_labels.append(month_start.strftime("%b %Y"))
        monthly_data.append(count)

    recent_data = db.query(models.CV, models.JobAd.title)\
                    .outerjoin(models.JobAd, models.CV.job_id == models.JobAd.id)\
                    .order_by(models.CV.created_at.desc())\
                    .limit(5)\
                    .all()
    
    recent_activities = [
        {
            "candidate": cv.filename,
            "job": job_title if job_title else "Silinmiş İlan",
            "status": cv.status,
            "date": cv.created_at
        } 
        for cv, job_title in recent_data
    ]

    return {
        "stats": {
            "totalJobs": total_jobs,
            "activeCandidates": active_candidates,
            "invited": invited,
            "interviews": interviews,
            "hired": hired
        },
        "charts": {
            "pie": { "labels": pie_labels, "data": pie_data },
            "bar": { "labels": bar_labels, "data": bar_data_vals },
            "line": { "labels": monthly_labels, "data": monthly_data }
        },
        "recent_activities": recent_activities
    }

@app.delete("/api/cvs/{cv_id}")
def delete_cv(
    cv_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """CV'yi veritabanından ve dosya sisteminden siler."""
    query = db.query(models.CV).filter(models.CV.id == cv_id)
    if current_user.role != "admin":
        query = query.filter(models.CV.user_id == current_user.id)

    cv = query.first()

    if not cv:
        raise HTTPException(status_code=404, detail="CV bulunamadı.")

    try:
        if cv.file_path and os.path.exists(cv.file_path):
            os.remove(cv.file_path)
    except Exception as e:
        print(f"[UYARI] Dosya silinirken hata: {e}")

    db.delete(cv)
    db.commit()

    return {"status": "success", "message": "CV başarıyla silindi."}

@app.post("/api/ai-commentary/{cv_id}")
def get_ai_commentary(
    cv_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """AI kullanarak aday CV'si hakkında detaylı yorum üretir."""
    cv = db.query(models.CV).filter(models.CV.id == cv_id).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV bulunamadı")
    
    if current_user.role != "admin" and cv.user_id != current_user.id:
         raise HTTPException(status_code=403, detail="Bu işlemi yapmaya yetkiniz yok.")

    job = db.query(models.JobAd).filter(models.JobAd.id == cv.job_id).first()
    job_desc = job.description if job else ""

    analysis = ai_advisor.analyze_candidate(cv.raw_text, job_desc)
    return analysis

@app.get("/")
def read_root():
    """API root endpoint'i, servis durumunu döndürür."""
    return {
        "message": "SynapticaAI API Çalışıyor! (v2.0)",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
def health_check():
    """Backend sağlık kontrolü endpoint'i."""
    return {
        "status": "online",
        "timestamp": datetime.now().isoformat()
    }
