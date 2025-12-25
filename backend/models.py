from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey, Boolean, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    """Kullanıcı modeli, sisteme giriş yapacak şirket hesaplarını temsil eder."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    company_name = Column(String)
    role = Column(String, default="recruiter")
    
    jobs = relationship("JobAd", back_populates="owner")
    cvs = relationship("CV", back_populates="owner")

class CV(Base):
    """CV modeli, yüklenen aday CV'lerini ve analiz sonuçlarını temsil eder."""
    __tablename__ = "cvs"

    id = Column(Integer, primary_key=True, index=True)
    
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    
    raw_text = Column(Text, nullable=True)
    skills = Column(JSON, default=[])
    
    email = Column(String, default="Belirtilmemiş")
    
    match_score = Column(Float, default=0.0)
    
    status = Column(String, default="Analyzed")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    job_id = Column(Integer, ForeignKey("job_ads.id"), nullable=True)
    job = relationship("JobAd", back_populates="applications")

    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="cvs")

class JobAd(Base):
    """İş ilanı modeli, açılan pozisyonları ve gereksinimlerini temsil eder."""
    __tablename__ = "job_ads"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default={})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    applications = relationship("CV", back_populates="job")

    user_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="jobs")
