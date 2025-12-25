import spacy
import os
import re
import json

class CVExtractor:
    """CV metinlerinden yetenek, e-posta ve isim bilgilerini çıkarır."""
    
    def __init__(self):
        """SpaCy modelini ve yetenek kurallarını yükler."""
        print("[INFO] CVExtractor baslatiliyor...")
        
        try:
            if spacy.util.is_package("tr_core_news_tr"):
                self.nlp = spacy.load("tr_core_news_tr")
            else:
                self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            print("[UYARI] Model bulunamadi, bos model yukleniyor.")
            self.nlp = spacy.blank("en")

        if "entity_ruler" not in self.nlp.pipe_names:
            if "ner" in self.nlp.pipe_names:
                ruler = self.nlp.add_pipe("entity_ruler", before="ner")
            else:
                ruler = self.nlp.add_pipe("entity_ruler")
        else:
            ruler = self.nlp.get_pipe("entity_ruler")

        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(current_dir)
        skills_path = os.path.join(backend_dir, "data", "skills.json")

        try:
            if os.path.exists(skills_path):
                with open(skills_path, "r", encoding="utf-8") as f:
                    patterns = json.load(f)
                ruler.add_patterns(patterns)
                print(f"[OK] Skills basariyla yuklendi! Toplam kural: {len(patterns)}")
            else:
                print(f"[HATA] Dosya bulunamadi: {skills_path}")
        except Exception as e:
            print(f"[HATA] JSON okuma hatasi: {e}")

    def clean_filename(self, filename: str) -> str:
        """Dosya adından gereksiz kelimeleri temizler ve formatlar."""
        name = os.path.splitext(filename)[0]
        
        junk_words = [
            r'^CV_', r'_CV$', r'^Resume_', r'_Resume$', 
            r'_Perfect', r'_Fuzzy', r'_Irr', r'_Irrelevant', 
            r'kopya', r'copy', r'\d{4}'
        ]
        
        for pattern in junk_words:
            name = re.sub(pattern, '', name, flags=re.IGNORECASE)
        
        name = name.replace('_', ' ').replace('-', ' ')
        name = " ".join(name.split())
        return name.title()

    def is_valid_name(self, name: str) -> bool:
        """Bulunan metnin geçerli bir isim olup olmadığını kontrol eder."""
        name_lower = name.lower()
        
        if len(name) < 4 or len(name) > 30:
            return False
            
        if re.search(r'\d', name):
            return False
            
        forbidden_keywords = [
            "mahallesi", "mah.", "sokak", "cadde", "apartman", "no:", "daire",
            "education", "eğitim", "experience", "deneyim", "skills", "yetenekler",
            "resume", "curriculum", "vitae", "özgeçmiş", "summary", "profile", "contact",
            "university", "üniversitesi", "fakültesi", "lisesi", "school",
            "manager", "developer", "engineer", "mühendis", "uzman", "senior", "junior",
            "level", "seviye", "ileri", "orta", "başlangıç",
            "phone", "email", "mail", "tel", "adres", "github", "linkedin"
        ]
        
        for word in forbidden_keywords:
            if word in name_lower:
                return False
                
        return True

    def extract_data(self, text: str, filename: str = ""):
        """CV metninden isim, yetenek ve e-posta bilgilerini çıkarır."""
        header_text = "\n".join(text.split('\n')[:20])
        
        doc = self.nlp(header_text)
        
        full_doc = self.nlp(text)
        skills = []
        for ent in full_doc.ents:
            if ent.label_ == "SKILL":
                if ent.ent_id_:
                    skills.append(ent.ent_id_)
                else:
                    skills.append(ent.text.upper())
        unique_skills = list(set(skills))
        
        emails = [ent.text for ent in full_doc.ents if ent.label_ == "EMAIL"]
        if not emails:
            email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
            emails = re.findall(email_pattern, text)

        extracted_name = None
        
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                if self.is_valid_name(ent.text):
                    if " " in ent.text.strip():
                        extracted_name = ent.text.strip().title()
                        break
        
        if not extracted_name:
            lines = header_text.split('\n')
            for line in lines[:10]:
                line = line.strip()
                if re.match(r'^[A-Za-zÇğıİöşüÇĞIİÖŞÜ ]+$', line) and 1 < len(line.split()) <= 3:
                     if self.is_valid_name(line):
                         extracted_name = line.title()
                         break

        if not extracted_name and filename:
            extracted_name = self.clean_filename(filename)

        return {
            "name": extracted_name if extracted_name else "Bilinmeyen Aday",
            "skills": unique_skills,
            "emails": emails
        }
