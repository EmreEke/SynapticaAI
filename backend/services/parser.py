import os
from pdfminer.high_level import extract_text
from pdfminer.layout import LAParams
import docx
import re

class DocumentParser:
    """PDF ve DOCX dosyalarından metin çıkarma işlemlerini yönetir."""

    @staticmethod
    def parse_file(file_path: str) -> str:
        """Dosya yolundaki PDF veya DOCX dosyasından metin çıkarır ve temizler."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Dosya bulunamadı: {file_path}")

        _, file_extension = os.path.splitext(file_path)
        file_extension = file_extension.lower()

        text = ""
        if file_extension == '.pdf':
            text = DocumentParser._parse_pdf(file_path)
        elif file_extension == '.docx':
            text = DocumentParser._parse_docx(file_path)
        else:
            raise ValueError(f"Desteklenmeyen format: {file_extension}. Sadece PDF ve DOCX.")
        
        return DocumentParser._clean_text(text)

    @staticmethod
    def _parse_pdf(file_path: str) -> str:
        """PDF dosyasından metin çıkarır."""
        try:
            laparams = LAParams(line_margin=0.5, word_margin=0.1)
            text = extract_text(file_path, laparams=laparams)
            return text
        except Exception as e:
            return f"PDF okuma hatası: {str(e)}"

    @staticmethod
    def _parse_docx(file_path: str) -> str:
        """DOCX dosyasından metin çıkarır."""
        try:
            doc = docx.Document(file_path)
            full_text = []
            for para in doc.paragraphs:
                full_text.append(para.text)
            return '\n'.join(full_text)
        except Exception as e:
            return f"DOCX okuma hatası: {str(e)}"

    @staticmethod
    def _clean_text(text: str) -> str:
        """Metin içindeki gereksiz karakterleri ve yapışmış kelimeleri temizler."""
        if not text: return ""
        
        text = re.sub(r'\s+', ' ', text)
        text = text.replace('\x00', '')
        
        return text.strip()

if __name__ == "__main__":
    test_path = r"C:\Users\emree\OneDrive\Belgeler\Bitirme Projesi\SynapticaAI\backend\Emre Eke CV.pdf"
    
    try:
        sonuc = DocumentParser.parse_file(test_path)
        print("-" * 30)
        print("TEMİZLENMİŞ METİN (İlk 500 Karakter):")
        print(sonuc[:500]) 
        print("-" * 30)
        
        if "PythonDeveloper" in sonuc or "pythondeveloper" in sonuc:
            print("[HATA] Kelimeler hala yapışık!")
        elif "Python Developer" in sonuc or "Python" in sonuc:
            print("[OK] Kelimeler ayrılmış görünüyor.")
            
    except Exception as e:
        print(f"[HATA] {e}")
