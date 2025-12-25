from pydantic import BaseModel
from typing import List, Dict

class JobAdCreate(BaseModel):
    """İş ilanı oluşturma şeması."""
    title: str
    description: str
    required_skills: Dict[str, int]
    is_active: bool = True

class JobAdOut(JobAdCreate):
    """İş ilanı çıktı şeması, API yanıtlarında kullanılır."""
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    """Kullanıcı oluşturma şeması."""
    username: str
    password: str
    company_name: str
    role: str = "recruiter"

class UserOut(BaseModel):
    """Kullanıcı çıktı şeması, API yanıtlarında kullanılır."""
    id: int
    username: str
    company_name: str
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    """JWT token yanıt şeması."""
    access_token: str
    token_type: str
    role: str

class CVStatusUpdate(BaseModel):
    """CV statü güncelleme şeması."""
    status: str
    email: str = None

class CVNotesUpdate(BaseModel):
    """CV notları güncelleme şeması."""
    notes: str = None
