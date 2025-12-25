import spacy
from typing import List, Dict

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False
    print("[UYARI] scikit-learn bulunamadi. Anlamsal analiz devre disi.")

try:
    from thefuzz import process, fuzz
    FUZZY_AVAILABLE = True
except ImportError:
    FUZZY_AVAILABLE = False
    print("[UYARI] thefuzz bulunamadi. Sadece tam eslesme yapilacak.")

class HybridMatcher:
    """CV ve iş ilanı eşleştirme işlemlerini yönetir, yetenek ve anlamsal benzerlik skorları hesaplar."""
    
    def __init__(self):
        """SpaCy modelini yükler."""
        print("[INFO] HybridMatcher baslatiliyor...")
        try:
            if spacy.util.is_package("tr_core_news_tr"):
                self.nlp = spacy.load("tr_core_news_tr")
            else:
                self.nlp = spacy.load("en_core_web_sm")
        except:
            self.nlp = spacy.blank("en")

    def calculate_semantic_score(self, cv_text: str, job_description: str) -> float:
        """CV metni ve iş ilanı açıklaması arasındaki anlamsal benzerlik skorunu hesaplar."""
        if not SKLEARN_AVAILABLE or not cv_text or not job_description:
            return 0.0
        
        if len(cv_text) < 50 or len(job_description) < 50:
            return 0.0

        try:
            vectorizer = TfidfVectorizer() 
            tfidf_matrix = vectorizer.fit_transform([cv_text, job_description])
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity * 100)
        except Exception as e:
            print(f"[HATA] Cosine similarity hatasi: {e}")
            return 0.0

    def match(self, cv_text: str, cv_skills: List[str], job_description: str, job_skills_weights: Dict[str, int]) -> dict:
        """CV ve iş ilanı arasında hibrit eşleştirme yapar, toplam skor hesaplar."""
        print("\n[INFO] Matching engine basladi...")
        
        try:
            matched_skills = []
            missing_skills = []
            earned_score = 0
            
            try:
                total_possible_score = sum(int(v) for v in job_skills_weights.values())
            except:
                total_possible_score = 0
            
            cv_skills_list = [skill.upper() for skill in cv_skills] if cv_skills else []

            if total_possible_score > 0:
                for job_skill, weight in job_skills_weights.items():
                    job_skill_upper = job_skill.upper()
                    weight = int(weight)
                    
                    if job_skill_upper in cv_skills_list:
                        matched_skills.append(job_skill)
                        earned_score += weight
                        continue 
                    
                    if FUZZY_AVAILABLE:
                        best_match = process.extractOne(job_skill_upper, cv_skills_list, scorer=fuzz.token_sort_ratio)
                        if best_match:
                            match_text, score = best_match
                            if score >= 80:
                                matched_skills.append(f"{job_skill} ({match_text})")
                                earned_score += weight
                            else:
                                missing_skills.append(job_skill)
                        else:
                            missing_skills.append(job_skill)
                    else:
                        missing_skills.append(job_skill)
                
                skill_score = (earned_score / total_possible_score) * 100
            else:
                skill_score = 0.0

            semantic_score = self.calculate_semantic_score(cv_text, job_description)
            
            final_score = (skill_score * 0.7) + (semantic_score * 0.3)

            return {
                "total_score": float(round(final_score, 1)),
                "skill_score": float(round(skill_score, 1)),
                "semantic_score": float(round(semantic_score, 1)),
                "matched_skills": matched_skills,
                "missing_skills": missing_skills
            }

        except Exception as e:
            print(f"[HATA] Matcher kritik hata: {e}")
            import traceback
            traceback.print_exc()
            return {
                "total_score": 0.0,
                "skill_score": 0.0,
                "semantic_score": 0.0,
                "matched_skills": [],
                "missing_skills": []
            }
