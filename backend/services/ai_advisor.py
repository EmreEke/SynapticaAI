import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class AIAdvisor:
    """Google Gemini AI kullanarak CV analizi ve aday değerlendirmesi yapar."""
    
    def __init__(self):
        """Gemini API anahtarını yükler ve modeli hazırlar."""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("[UYARI] GEMINI_API_KEY bulunamadi!")
            return
            
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def analyze_candidate(self, cv_text: str, job_description: str = ""):
        """CV metnini ve iş ilanını analiz ederek detaylı yorum üretir."""
        try:
            prompt = f"""
            Sen deneyimli bir Teknik İşe Alım Uzmanısın (Technical Recruiter).
            Aşağıdaki CV metnini analiz et ve sonucu SADECE saf bir JSON formatında ver.
            Başka hiçbir metin, markdown (```json ... ```) veya açıklama ekleme.

            Eğer İş İlanı verilmişse, adayın ilana uygunluğunu temel al.
            İş İlanı yoksa, genel profili değerlendir.

            İŞ İLANI:
            {job_description if job_description else "Belirtilmemiş (Genel değerlendirme yap)"}

            CV METNİ:
            {cv_text[:8000]} 

            İSTENEN JSON FORMATI:
            {{
                "summary": "Adayın deneyimini 2 cümle ile özetle.",
                "level_estimation": "Junior / Mid / Senior / Lead",
                "strengths": ["Güçlü olduğu 3 teknik veya soft özellik"],
                "weaknesses": ["Geliştirmesi gereken veya eksik görünen 2 nokta"],
                "cultural_fit": "CV dilinden anlaşılan kişilik özellikleri",
                "recommendation": "Mülakata çağrılmalı mı? (Evet / Belki / Hayır) ve sebebi."
            }}
            """

            response = self.model.generate_content(prompt)
            
            clean_text = response.text.replace("```json", "").replace("```", "").strip()
            
            return json.loads(clean_text)

        except Exception as e:
            print(f"[HATA] AI analiz hatasi: {e}")
            return {
                "summary": "Yapay zeka analizi şu an yapılamıyor.",
                "level_estimation": "Bilinmiyor",
                "strengths": [],
                "weaknesses": [],
                "cultural_fit": "-",
                "recommendation": "Manuel inceleme önerilir."
            }
