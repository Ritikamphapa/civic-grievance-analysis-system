"""
NLP utilities for the Civic Grievance Analysis System.

- Category classification: TF-IDF + Multinomial Naive Bayes, trained at
  startup on a small labelled seed dataset of common civic complaint types.
- Sentiment analysis: TextBlob polarity score, mapped to
  Positive / Neutral / Negative (used as an urgency/tone signal).

This keeps the service self-contained (no external NLP API calls, no
large pretrained model download), which matters for a fast, free-tier
Cloud Run deployment.
"""

from textblob import TextBlob
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

# ---------------------------------------------------------------------------
# Seed training data. In a production system this would be replaced with
# real historical complaint data (the more examples, the better the model).
# ---------------------------------------------------------------------------
TRAINING_DATA = [
    ("There is no water supply in our area for the last three days", "Water Supply"),
    ("The water pipeline is leaking and wasting a lot of water", "Water Supply"),
    ("Drinking water is contaminated and smells bad", "Water Supply"),
    ("Water tank has not been cleaned in months", "Water Supply"),
    ("Low water pressure in the mornings every day", "Water Supply"),
    ("Power cut in our locality since morning with no update", "Electricity"),
    ("Streetlights have not been working for two weeks", "Electricity"),
    ("Frequent voltage fluctuation is damaging home appliances", "Electricity"),
    ("Electricity meter is showing incorrect readings", "Electricity"),
    ("Transformer near the market is making a loud noise and sparking", "Electricity"),
    ("The road in front of our house is full of potholes", "Roads & Infrastructure"),
    ("Streetlight pole fell down and is blocking traffic", "Roads & Infrastructure"),
    ("Footpath is broken and dangerous for pedestrians", "Roads & Infrastructure"),
    ("Construction debris left on the road for weeks", "Roads & Infrastructure"),
    ("No proper drainage system causing waterlogging after rain", "Roads & Infrastructure"),
    ("Garbage has not been collected from our street for a week", "Sanitation & Garbage"),
    ("Public toilet near the park is extremely dirty and unusable", "Sanitation & Garbage"),
    ("Overflowing dustbins are attracting stray animals", "Sanitation & Garbage"),
    ("Sewage water is flowing openly on the street", "Sanitation & Garbage"),
    ("Foul smell from the garbage dump near residential area", "Sanitation & Garbage"),
    ("Stray dogs in the area are becoming aggressive towards children", "Public Safety"),
    ("Street is not safe at night due to lack of lighting and patrol", "Public Safety"),
    ("Illegal parking is causing traffic congestion and accidents", "Public Safety"),
    ("Open manhole on the main road is a serious safety hazard", "Public Safety"),
    ("Fire safety equipment in the building is not maintained", "Public Safety"),
    ("Thank you for resolving the water issue quickly, much appreciated", "Other"),
    ("General query about the office working hours", "Other"),
    ("Requesting information about property tax payment process", "Other"),
    ("Appreciate the new park built in our locality", "Other"),
    ("Asking for a duplicate copy of birth certificate", "Other"),
]

CATEGORIES = sorted(set(label for _, label in TRAINING_DATA))


def _build_classifier() -> Pipeline:
    texts = [t for t, _ in TRAINING_DATA]
    labels = [l for _, l in TRAINING_DATA]
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(stop_words="english", ngram_range=(1, 2))),
        ("clf", MultinomialNB()),
    ])
    pipeline.fit(texts, labels)
    return pipeline


# Trained once at import time (i.e. once per running container/process).
_classifier = _build_classifier()


def classify_complaint(text: str) -> dict:
    """Return predicted category and the model's confidence for it."""
    if not text or not text.strip():
        return {"category": "Other", "confidence": 0.0}

    predicted = _classifier.predict([text])[0]
    probabilities = _classifier.predict_proba([text])[0]
    confidence = float(max(probabilities))
    return {"category": predicted, "confidence": round(confidence, 3)}


def analyze_sentiment(text: str) -> dict:
    """Return polarity score (-1 to 1) and a human-readable label."""
    if not text or not text.strip():
        return {"polarity": 0.0, "label": "Neutral"}

    polarity = TextBlob(text).sentiment.polarity
    if polarity > 0.1:
        label = "Positive"
    elif polarity < -0.1:
        label = "Negative"
    else:
        label = "Neutral"
    return {"polarity": round(polarity, 3), "label": label}


def analyze_complaint(text: str) -> dict:
    """Convenience helper combining classification + sentiment."""
    return {
        **classify_complaint(text),
        **{f"sentiment_{k}": v for k, v in analyze_sentiment(text).items()},
    }
