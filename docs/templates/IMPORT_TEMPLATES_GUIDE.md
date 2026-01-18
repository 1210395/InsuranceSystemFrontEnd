# Data Import Templates Guide

This document describes the optimal format for each import file type.

---

## 1. Medicine Prices (اسعار الادوية.xlsx)

### Columns:
| Column | Arabic | Type | Required | Description |
|--------|--------|------|----------|-------------|
| A | Drug Name | Text | Yes | Medicine name in English |
| B | Composition | Text | No | Active ingredients |
| C | Price | Number | Yes | Price in NIS |

### Example Data:
```
Drug Name          | Composition              | Price
-------------------|--------------------------|-------
Paracetamol 500mg  | Paracetamol 500mg       | 15
Amoxicillin 250mg  | Amoxicillin 250mg       | 25
Omeprazole 20mg    | Omeprazole 20mg         | 35
```

---

## 2. Medicine Data with Coverage (ملف الادوية.xlsx)

### Columns:
| Column | Arabic | Type | Required | Description |
|--------|--------|------|----------|-------------|
| A | Name | Text | Yes | Medicine name |
| B | Generic | Text | No | Generic/scientific name |
| C | Type | Text | No | Tablet, Syrup, Injection, etc. |
| D | MED_UNIT | Text | No | mg, ml, etc. |
| E | COVERAGE_STATUS | Text | Yes | مغطى / يحتاج الى موافقة / غير مغطى |

### Coverage Status Values:
- `مغطى` or `مغطاة` = COVERED (auto-approved)
- `يحتاج الى موافقة` or `تحتاج الى موافقة` = REQUIRES_APPROVAL
- Any other value = NOT_COVERED

### Example Data:
```
Name              | Generic          | Type    | MED_UNIT | COVERAGE_STATUS
------------------|------------------|---------|----------|------------------
Panadol Extra     | Paracetamol      | Tablet  | 500mg    | مغطى
Augmentin         | Amoxicillin      | Tablet  | 625mg    | مغطى
Nexium            | Esomeprazole     | Capsule | 40mg     | يحتاج الى موافقة
Botox             | Botulinum Toxin  | Injection| 100IU   | غير مغطى
```

---

## 3. Lab Tests (فحوصات طبية.xlsx)

### Columns:
| Column | Arabic | Type | Required | Description |
|--------|--------|------|----------|-------------|
| A | TEST_FORMAL_NAME | Text | Yes | Test name |
| B | PRICE | Number | No | Test price |
| C | COVERAGE_STATUS | Text | Yes | مغطى / يحتاج الى موافقة / غير مغطى |

### Example Data:
```
TEST_FORMAL_NAME      | PRICE | COVERAGE_STATUS
----------------------|-------|------------------
CBC (Complete Blood)  | 50    | مغطى
Lipid Profile         | 80    | مغطى
Thyroid Panel (TSH)   | 100   | مغطى
Vitamin D             | 120   | يحتاج الى موافقة
Genetic Testing       | 500   | غير مغطى
```

---

## 4. Radiology (ملف الاشعة.xlsx)

### Columns:
| Column | Arabic | Type | Required | Description |
|--------|--------|------|----------|-------------|
| A | RAY_NAME | Text | Yes | Radiology test name |
| B | PRICE | Number | No | Test price |
| C | COVERAGE_STATUS | Text | Yes | مغطى / يحتاج الى موافقة / غير مغطى |

### Example Data:
```
RAY_NAME              | PRICE | COVERAGE_STATUS
----------------------|-------|------------------
Chest X-Ray           | 80    | مغطى
Ultrasound Abdomen    | 150   | مغطى
CT Scan Head          | 400   | يحتاج الى موافقة
MRI Brain             | 800   | يحتاج الى موافقة
PET Scan              | 2000  | غير مغطى
```

---

## 5. Medical Diagnoses (تشخيصات طبية.xlsx)

### Columns:
| Column | Arabic | Type | Required | Description |
|--------|--------|------|----------|-------------|
| A | English name | Text | Yes | Diagnosis in English |
| B | Arabic name | Text | No | Diagnosis in Arabic |

### Example Data:
```
English name              | Arabic name
--------------------------|------------------
Hypertension              | ارتفاع ضغط الدم
Diabetes Mellitus Type 2  | السكري النوع الثاني
Asthma                    | الربو
Migraine                  | الصداع النصفي
Gastritis                 | التهاب المعدة
```

---

## 6. Medical Center Data (بيانات مركز طبي.xlsx)

### Sheet 1: Job Titles (المسميات الوظيفية)
| Column | Arabic | Type | Required | Description |
|--------|--------|------|----------|-------------|
| A | المسمى الوظيفي | Text | Yes | Job title |

### Sheet 2: Specializations (التخصصات)
| Column | Arabic | Type | Required | Description |
|--------|--------|------|----------|-------------|
| A | التخصص | Text | Yes | Medical specialization |

### Example Data - Job Titles:
```
المسمى الوظيفي
--------------
طبيب عام
طبيب أخصائي
ممرض
فني مختبر
صيدلي
```

### Example Data - Specializations:
```
التخصص
--------------
طب عام
طب باطني
جراحة عامة
طب أطفال
طب نسائية وتوليد
```

---

## 7. Doctor Procedures (اتفاقية طبيب.docx)

### Document Structure:
The Word document should contain **3 tables** for different procedure categories:

### Table 1: General/Cardiology Procedures
| الاجراء (Procedure) | التكلفة (Cost) |
|---------------------|----------------|
| Echo cardio diagram | 200 |
| ECG normal | 30 |
| Stress test | 175 |
| Minor surgery | 150-500 |

### Table 2: Surgery Procedures
| التكلفة (Cost) | العملية (Operation) |
|----------------|---------------------|
| 500 | SKIN BIOPSY |
| 575 | LIPOMA EXCISION |
| 600 | INGROWING TOE NAIL |

### Table 3: ENT Procedures
| السعر / شيقل (Price) | الاجراء (Procedure) |
|----------------------|---------------------|
| 150 | Nasal cautery |
| 80 | Ear irrigation |
| 200 | Laryngoscopy |

### Notes:
- Price ranges (e.g., "150-500") are supported
- First row of each table is treated as header
- Categories are determined by table position (0=GENERAL, 1=SURGERY, 2=ENT)

---

## 8. Insurance Policy (بوليصة تامين.docx)

### Document Structure:
The policy document should contain:

1. **Annual Limits Section:**
   - السقف المالي السنوي للمنتفع: [amount] دينار

2. **Consultation Fees:**
   - الكشفيات الاخصائي [amount] العام [amount]

3. **Coverage Percentages Table:**
| نوع التغطية (Coverage Type) | نسبة التغطية (Coverage %) |
|-----------------------------|---------------------------|
| تغطية الأدوية غير المزمنة | 60% |
| تغطية الصور الشعاعية | 100% |
| تغطية الولادة الطبيعية | 250 دينار |

4. **Visit Limits Table:**
| نوع الزيارة | الحد الأقصى |
|-------------|-------------|
| زيارات عادية | 12 زيارة في السنة |
| زيارات الحامل | 16 زيارة في السنة |

5. **Exclusions Section:**
   - لا يشمل ولا يغطي التأمين:
   - [List of exclusions]

---

## Important Notes

1. **File Encoding:** Use UTF-8 encoding for proper Arabic text support
2. **Date Format:** Use YYYY-MM-DD format if dates are included
3. **Numbers:** Use numeric values without currency symbols
4. **Empty Cells:** Empty cells are allowed for optional columns
5. **Duplicate Handling:** Existing records will be updated, not duplicated

## Coverage Status Quick Reference

| Arabic Value | English Enum | Claim Behavior |
|--------------|--------------|----------------|
| مغطى / مغطاة | COVERED | Auto-approved |
| يحتاج الى موافقة / تحتاج الى موافقة | REQUIRES_APPROVAL | Needs admin review |
| غير مغطى / غير مغطاة | NOT_COVERED | Rejected |
