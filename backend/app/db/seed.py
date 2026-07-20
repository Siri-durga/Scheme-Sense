from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import AsyncSessionLocal
from app.models.user import User, UserProfile
from app.models.scheme import Department, Scheme, EligibilityRule
from app.core.security import get_password_hash
from datetime import date
import uuid


DEPARTMENTS = [
    {"name": "Ministry of Education", "ministry": "Ministry of Education"},
    {"name": "Ministry of Agriculture", "ministry": "Ministry of Agriculture & Farmers Welfare"},
    {"name": "Ministry of Women & Child Development", "ministry": "Ministry of Women & Child Development"},
    {"name": "Ministry of Social Justice", "ministry": "Ministry of Social Justice & Empowerment"},
    {"name": "Ministry of Finance", "ministry": "Ministry of Finance"},
    {"name": "Ministry of Health", "ministry": "Ministry of Health & Family Welfare"},
    {"name": "Ministry of Skill Development", "ministry": "Ministry of Skill Development & Entrepreneurship"},
    {"name": "Government of Andhra Pradesh", "ministry": "State Government"},
]

SCHEMES_DATA = [
    {
        "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        "name_te": "పీఎం-కిసాన్ (ప్రధానమంత్రి కిసాన్ సమ్మాన్ నిధి)",
        "dept_name": "Ministry of Agriculture",
        "description": "Direct income support of ₹6,000 per year to small and marginal farmers in three equal installments of ₹2,000 each.",
        "description_te": "చిన్న మరియు సన్నకారు రైతులకు సంవత్సరానికి ₹6,000 ప్రత్యక్ష ఆదాయ మద్దతు మూడు సమాన వాయిదాలలో అందించబడుతుంది.",
        "objective": "Supplement the financial needs of farmers in procuring various inputs to ensure proper crop health and appropriate yields.",
        "status": "active",
        "official_url": "https://pmkisan.gov.in",
        "benefit_value_inr": 6000,
        "benefits": {"summary": "₹6,000/year direct bank transfer", "type": "Financial Assistance", "amount": "₹2,000 per installment (3 installments/year)"},
        "benefits_te": {"summary": "సంవత్సరానికి ₹6,000 నేరుగా బ్యాంకు ఖాతాకు", "type": "ఆర్థిక సహాయం"},
        "required_docs": ["Aadhaar Card", "Land ownership documents", "Bank account details", "Mobile number"],
        "required_docs_te": ["ఆధార్ కార్డ్", "భూమి యాజమాన్య పత్రాలు", "బ్యాంకు ఖాతా వివరాలు"],
        "app_start_date": date(2024, 1, 1),
        "app_end_date": date(2025, 12, 31),
        "category_tags": ["farmer", "agriculture", "income support"],
        "rules": [
            {"field_name": "is_farmer", "operator": "bool_true", "value": "true", "rule_type": "mandatory", "weight": 30, "label": "✓ Registered farmer"},
            {"field_name": "income_annual", "operator": "lte", "value": "200000", "rule_type": "mandatory", "weight": 20, "label": "✓ Annual income below ₹2 lakh"},
        ],
    },
    {
        "name": "National Scholarship Portal - Post-Matric Scholarship (SC Students)",
        "name_te": "జాతీయ స్కాలర్‌షిప్ పోర్టల్ - పోస్ట్ మెట్రిక్ స్కాలర్‌షిప్ (SC విద్యార్థులు)",
        "dept_name": "Ministry of Social Justice",
        "description": "Post-matric scholarship for students belonging to Scheduled Castes to enable them to pursue higher education.",
        "description_te": "షెడ్యూల్డ్ కులాలకు చెందిన విద్యార్థులకు ఉన్నత విద్యను కొనసాగించడానికి పోస్ట్ మెట్రిక్ స్కాలర్‌షిప్.",
        "objective": "Enable SC students to pursue higher education and strengthen their financial position.",
        "status": "active",
        "official_url": "https://scholarships.gov.in",
        "benefit_value_inr": 60000,
        "benefits": {"summary": "Tuition fee + maintenance allowance up to ₹60,000/year", "type": "Scholarship"},
        "benefits_te": {"summary": "ట్యూషన్ రుసుము + నిర్వహణ అలవెన్స్ సంవత్సరానికి ₹60,000 వరకు"},
        "required_docs": ["Aadhaar Card", "Caste Certificate", "Income Certificate", "Previous year marksheet", "Bank account details", "Bonafide certificate"],
        "required_docs_te": ["ఆధార్ కార్డ్", "కుల ధృవీకరణ పత్రం", "ఆదాయ ధృవీకరణ పత్రం", "మార్కుల పత్రం"],
        "app_start_date": date(2024, 7, 1),
        "app_end_date": date(2025, 3, 31),
        "category_tags": ["scholarship", "student", "SC", "education"],
        "rules": [
            {"field_name": "is_student", "operator": "bool_true", "value": "true", "rule_type": "mandatory", "weight": 25, "label": "✓ Currently a student"},
            {"field_name": "category", "operator": "eq", "value": "SC", "rule_type": "mandatory", "weight": 30, "label": "✓ Scheduled Caste category"},
            {"field_name": "income_annual", "operator": "lte", "value": "250000", "rule_type": "mandatory", "weight": 20, "label": "✓ Family income below ₹2.5 lakh"},
        ],
    },
    {
        "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
        "name_te": "ప్రధానమంత్రి మాతృ వందన యోజన",
        "dept_name": "Ministry of Women & Child Development",
        "description": "Maternity benefit programme providing ₹5,000 in three installments to pregnant women and lactating mothers for the first living child.",
        "description_te": "గర్భిణీ స్త్రీలకు మరియు పాలిచ్చే తల్లులకు మొదటి జీవించి ఉన్న బిడ్డ కోసం ₹5,000 మూడు వాయిదాలలో అందించే మాతృత్వ ప్రయోజన పథకం.",
        "objective": "Improve the health and nutrition status of pregnant and lactating mothers.",
        "status": "active",
        "official_url": "https://pmmvy.wcd.gov.in",
        "benefit_value_inr": 5000,
        "benefits": {"summary": "₹5,000 in 3 installments for first child", "type": "Financial Assistance"},
        "benefits_te": {"summary": "మొదటి బిడ్డ కోసం 3 వాయిదాలలో ₹5,000"},
        "required_docs": ["Aadhaar Card", "MCP Card (Mother and Child Protection)", "Bank account details", "Proof of pregnancy"],
        "required_docs_te": ["ఆధార్ కార్డ్", "MCP కార్డ్", "బ్యాంకు ఖాతా వివరాలు"],
        "app_start_date": date(2024, 1, 1),
        "app_end_date": date(2025, 12, 31),
        "category_tags": ["women", "maternity", "mother", "pregnancy"],
        "rules": [
            {"field_name": "gender", "operator": "eq", "value": "female", "rule_type": "mandatory", "weight": 30, "label": "✓ Female applicant"},
            {"field_name": "income_annual", "operator": "lte", "value": "800000", "rule_type": "bonus", "weight": 10, "label": "✓ Income eligible"},
        ],
    },
    {
        "name": "Sukanya Samriddhi Yojana",
        "name_te": "సుకన్య సమృద్ధి యోజన",
        "dept_name": "Ministry of Finance",
        "description": "A small savings scheme for girl child providing attractive interest rate and income tax benefits to secure the future of girl children.",
        "description_te": "బాలికల భవిష్యత్తును సురక్షితం చేయడానికి ఆకర్షణీయమైన వడ్డీ రేటు మరియు ఆదాయ పన్ను ప్రయోజనాలు అందించే చిన్న పొదుపు పథకం.",
        "objective": "Secure the future of the girl child in terms of education and marriage expenses.",
        "status": "active",
        "official_url": "https://www.india.gov.in/sukanya-samriddhi-yojana",
        "benefit_value_inr": 150000,
        "benefits": {"summary": "8.2% interest rate + tax benefits (up to ₹1.5L deduction)", "type": "Savings Scheme"},
        "benefits_te": {"summary": "8.2% వడ్డీ రేటు + పన్ను ప్రయోజనాలు"},
        "required_docs": ["Birth certificate of girl child", "Guardian's Aadhaar", "Address proof", "Initial deposit (min ₹250)"],
        "required_docs_te": ["బాలిక జన్మ ధృవీకరణ పత్రం", "సంరక్షకుడి ఆధార్"],
        "app_start_date": date(2024, 1, 1),
        "app_end_date": date(2030, 12, 31),
        "category_tags": ["girl child", "savings", "education", "women"],
        "rules": [
            {"field_name": "gender", "operator": "eq", "value": "female", "rule_type": "mandatory", "weight": 30, "label": "✓ Female applicant"},
            {"field_name": "age", "operator": "lte", "value": "10", "rule_type": "mandatory", "weight": 30, "label": "✓ Age below 10 years"},
        ],
    },
    {
        "name": "PM Fasal Bima Yojana (PMFBY)",
        "name_te": "ప్రధానమంత్రి ఫసల్ బీమా యోజన",
        "dept_name": "Ministry of Agriculture",
        "description": "Crop insurance scheme providing comprehensive risk coverage against crop loss due to non-preventable natural risks at very low premium.",
        "description_te": "చాలా తక్కువ ప్రీమియంతో సహజ విపత్తుల వల్ల పంట నష్టానికి వ్యతిరేకంగా సమగ్ర రిస్క్ కవరేజీ అందించే పంట బీమా పథకం.",
        "objective": "Support production in agriculture sector, stabilize income of farmers.",
        "status": "active",
        "official_url": "https://pmfby.gov.in",
        "benefit_value_inr": 50000,
        "benefits": {"summary": "Crop loss compensation. Premium: 2% for Kharif, 1.5% for Rabi crops", "type": "Insurance"},
        "benefits_te": {"summary": "పంట నష్ట పరిహారం. ప్రీమియం: ఖరీఫ్ కు 2%, రబీ పంటలకు 1.5%"},
        "required_docs": ["Aadhaar Card", "Land records", "Bank account", "Sowing certificate"],
        "required_docs_te": ["ఆధార్ కార్డ్", "భూమి రికార్డులు", "బ్యాంకు ఖాతా"],
        "app_start_date": date(2024, 6, 1),
        "app_end_date": date(2025, 12, 31),
        "category_tags": ["farmer", "crop insurance", "agriculture"],
        "rules": [
            {"field_name": "is_farmer", "operator": "bool_true", "value": "true", "rule_type": "mandatory", "weight": 40, "label": "✓ Registered farmer"},
        ],
    },
    {
        "name": "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
        "name_te": "ప్రధానమంత్రి ఆవాస్ యోజన - గ్రామీణ",
        "dept_name": "Ministry of Finance",
        "description": "Housing for all rural poor. Financial assistance of ₹1.20 lakh in plains and ₹1.30 lakh in hilly areas for construction of houses.",
        "description_te": "గ్రామీణ పేదలందరికీ నివాసం. మైదాన ప్రాంతాలలో ₹1.20 లక్షలు మరియు కొండ ప్రాంతాలలో ₹1.30 లక్షల ఆర్థిక సహాయం.",
        "objective": "Ensure that rural homeless and those living in dilapidated houses can construct pucca houses.",
        "status": "active",
        "official_url": "https://pmayg.nic.in",
        "benefit_value_inr": 120000,
        "benefits": {"summary": "₹1.20 lakh for house construction + MGNREGS wages", "type": "Housing Subsidy"},
        "benefits_te": {"summary": "గృహ నిర్మాణానికి ₹1.20 లక్షలు"},
        "required_docs": ["Aadhaar Card", "BPL Certificate", "Land documents", "Bank account", "Caste certificate"],
        "required_docs_te": ["ఆధార్ కార్డ్", "బీపీఎల్ సర్టిఫికేట్", "భూమి పత్రాలు"],
        "app_start_date": date(2024, 1, 1),
        "app_end_date": date(2026, 3, 31),
        "category_tags": ["housing", "BPL", "rural", "construction"],
        "rules": [
            {"field_name": "is_bpl", "operator": "bool_true", "value": "true", "rule_type": "mandatory", "weight": 30, "label": "✓ Below poverty line"},
            {"field_name": "income_annual", "operator": "lte", "value": "100000", "rule_type": "mandatory", "weight": 20, "label": "✓ Annual income below ₹1 lakh"},
        ],
    },
    {
        "name": "Ayushman Bharat - PM Jan Arogya Yojana (PMJAY)",
        "name_te": "ఆయుష్మాన్ భారత్ - పీఎం జన్ ఆరోగ్య యోజన",
        "dept_name": "Ministry of Health",
        "description": "World's largest government-funded health insurance scheme providing health cover of ₹5 lakh per family per year for secondary and tertiary care hospitalization.",
        "description_te": "ద్వితీయ మరియు తృతీయ సంరక్షణ ఆసుపత్రి చేరికకు కుటుంబానికి సంవత్సరానికి ₹5 లక్షల ఆరోగ్య కవర్ అందించే ప్రపంచంలోనే అతిపెద్ద ప్రభుత్వ నిధుల ఆరోగ్య బీమా పథకం.",
        "objective": "Provide health cover to poor, deprived rural families and urban workers with occupational categories.",
        "status": "active",
        "official_url": "https://pmjay.gov.in",
        "benefit_value_inr": 500000,
        "benefits": {"summary": "₹5 lakh/year health insurance for entire family", "type": "Health Insurance"},
        "benefits_te": {"summary": "కుటుంబానికి సంవత్సరానికి ₹5 లక్షల ఆరోగ్య బీమా"},
        "required_docs": ["Aadhaar Card", "Ration Card", "Income certificate"],
        "required_docs_te": ["ఆధార్ కార్డ్", "రేషన్ కార్డ్", "ఆదాయ ధృవీకరణ పత్రం"],
        "app_start_date": date(2024, 1, 1),
        "app_end_date": date(2026, 12, 31),
        "category_tags": ["health", "insurance", "BPL", "medical"],
        "rules": [
            {"field_name": "income_annual", "operator": "lte", "value": "500000", "rule_type": "mandatory", "weight": 25, "label": "✓ Annual income below ₹5 lakh"},
        ],
    },
    {
        "name": "PM Vishwakarma Scheme",
        "name_te": "పీఎం విశ్వకర్మ పథకం",
        "dept_name": "Ministry of Skill Development",
        "description": "Support for traditional artisans and craftspeople with collateral-free credit up to ₹3 lakh, skill upgradation, and digital payments incentive.",
        "description_te": "సాంప్రదాయ కళాకారులు మరియు చేతివృత్తుల వారికి ₹3 లక్షల వరకు కొలేటరల్-రహిత క్రెడిట్, నైపుణ్య అభివృద్ధి మరియు డిజిటల్ చెల్లింపుల ప్రోత్సాహం.",
        "objective": "Enhance the quality of products/services of artisans and integrate them into domestic and global value chains.",
        "status": "active",
        "official_url": "https://pmvishwakarma.gov.in",
        "benefit_value_inr": 300000,
        "benefits": {"summary": "₹1L (year 1) + ₹2L (year 2) loan @ 5% interest + ₹15,000 toolkit", "type": "Credit + Skill"},
        "benefits_te": {"summary": "₹3 లక్షల వరకు రుణం 5% వడ్డీతో + ₹15,000 టూల్‌కిట్"},
        "required_docs": ["Aadhaar Card", "Proof of traditional craft/trade", "Bank account"],
        "required_docs_te": ["ఆధార్ కార్డ్", "సాంప్రదాయ వృత్తి రుజువు", "బ్యాంకు ఖాతా"],
        "app_start_date": date(2024, 1, 1),
        "app_end_date": date(2028, 3, 31),
        "category_tags": ["artisan", "craftsman", "skill", "loan"],
        "rules": [
            {"field_name": "occupation", "operator": "in", "value": "artisan,craftsman,carpenter,blacksmith,potter,weaver,tailor,barber,cobbler,mason", "rule_type": "mandatory", "weight": 30, "label": "✓ Traditional artisan occupation"},
            {"field_name": "income_annual", "operator": "lte", "value": "300000", "rule_type": "bonus", "weight": 10, "label": "✓ Income below ₹3 lakh"},
        ],
    },
    {
        "name": "Central Sector Interest Subsidy (CSIS) - Education Loan",
        "name_te": "కేంద్ర రంగ వడ్డీ సబ్సిడీ - విద్యా రుణం",
        "dept_name": "Ministry of Education",
        "description": "Full interest subsidy on education loans up to ₹7.5 lakh during the moratorium period for students from economically weaker sections.",
        "description_te": "ఆర్థికంగా బలహీన వర్గాల విద్యార్థులకు మారటోరియం కాలంలో ₹7.5 లక్షల వరకు విద్యా రుణాలపై పూర్తి వడ్డీ సబ్సిడీ.",
        "objective": "Provide relief to students from EWS on interest payments during their studies.",
        "status": "active",
        "official_url": "https://www.vidyalakshmi.co.in",
        "benefit_value_inr": 75000,
        "benefits": {"summary": "Full interest subsidy on education loan up to ₹7.5L during study period", "type": "Interest Subsidy"},
        "benefits_te": {"summary": "చదువు కాలంలో ₹7.5 లక్షల వరకు రుణంపై పూర్తి వడ్డీ సబ్సిడీ"},
        "required_docs": ["Aadhaar Card", "Income certificate (< ₹4.5L)", "Admission letter", "Fee structure", "Bank loan sanction letter"],
        "required_docs_te": ["ఆధార్ కార్డ్", "ఆదాయ ధృవీకరణ పత్రం", "ప్రవేశ పత్రం"],
        "app_start_date": date(2024, 6, 1),
        "app_end_date": date(2025, 11, 30),
        "category_tags": ["scholarship", "student", "education loan", "interest subsidy"],
        "rules": [
            {"field_name": "is_student", "operator": "bool_true", "value": "true", "rule_type": "mandatory", "weight": 30, "label": "✓ Currently a student"},
            {"field_name": "income_annual", "operator": "lte", "value": "450000", "rule_type": "mandatory", "weight": 25, "label": "✓ Family income below ₹4.5 lakh"},
        ],
    },
    {
        "name": "Stand-Up India Scheme",
        "name_te": "స్టాండ్-అప్ ఇండియా పథకం",
        "dept_name": "Ministry of Finance",
        "description": "Bank loans between ₹10 lakh to ₹1 crore for SC/ST and women entrepreneurs to set up greenfield enterprises.",
        "description_te": "SC/ST మరియు మహిళా పారిశ్రామికులకు గ్రీన్‌ఫీల్డ్ ఎంటర్‌ప్రైజ్‌లను స్థాపించడానికి ₹10 లక్షల నుండి ₹1 కోటి వరకు బ్యాంకు రుణాలు.",
        "objective": "Facilitate bank loans to SC/ST and women borrowers for setting up new enterprises.",
        "status": "active",
        "official_url": "https://www.standupmitra.in",
        "benefit_value_inr": 1000000,
        "benefits": {"summary": "Loan ₹10L to ₹1 Cr @ composite rate, 7-year repayment", "type": "Business Loan"},
        "benefits_te": {"summary": "₹10 లక్షల నుండి ₹1 కోటి వరకు రుణం"},
        "required_docs": ["Aadhaar Card", "Caste Certificate (SC/ST)", "Business plan", "Bank account"],
        "required_docs_te": ["ఆధార్ కార్డ్", "కుల ధృవీకరణ పత్రం", "వ్యాపార ప్రణాళిక"],
        "app_start_date": date(2024, 1, 1),
        "app_end_date": date(2025, 12, 31),
        "category_tags": ["entrepreneur", "business", "loan", "women", "SC", "ST"],
        "rules": [
            {"field_name": "age", "operator": "gte", "value": "18", "rule_type": "mandatory", "weight": 10, "label": "✓ Age 18 or above"},
            {"field_name": "gender", "operator": "in", "value": "female,Female", "rule_type": "bonus", "weight": 20, "label": "✓ Women entrepreneur"},
            {"field_name": "category", "operator": "in", "value": "SC,ST", "rule_type": "bonus", "weight": 20, "label": "✓ SC/ST category"},
            {"field_name": "occupation", "operator": "eq", "value": "entrepreneur", "rule_type": "bonus", "weight": 10, "label": "✓ Entrepreneur"},
        ],
    },
    {
        "name": "YSR Rythu Bharosa (Andhra Pradesh)",
        "name_te": "వైఎస్ఆర్ రైతు భరోసా (ఆంధ్రప్రదేశ్)",
        "dept_name": "Government of Andhra Pradesh",
        "description": "Financial assistance of ₹13,500 per year to farmer families of Andhra Pradesh for purchase of inputs. Exclusive AP state scheme.",
        "description_te": "ఇన్‌పుట్‌లు కొనుగోలు చేయడానికి ఆంధ్రప్రదేశ్ రైతు కుటుంబాలకు సంవత్సరానికి ₹13,500 ఆర్థిక సహాయం.",
        "objective": "Provide investment support to farmers for procurement of agricultural inputs.",
        "status": "active",
        "official_url": "https://apfarmer.ap.gov.in",
        "benefit_value_inr": 13500,
        "state_specific": "Andhra Pradesh",
        "benefits": {"summary": "₹13,500/year for AP farmers (₹7,500 from state + ₹6,000 from PM-KISAN)", "type": "Financial Assistance"},
        "benefits_te": {"summary": "AP రైతులకు సంవత్సరానికి ₹13,500"},
        "required_docs": ["Aadhaar Card", "AP Ration card / AP residence proof", "Land records", "Bank account"],
        "required_docs_te": ["ఆధార్ కార్డ్", "AP నివాస రుజువు", "భూమి రికార్డులు"],
        "app_start_date": date(2024, 1, 1),
        "app_end_date": date(2025, 12, 31),
        "category_tags": ["farmer", "andhra pradesh", "state scheme", "agriculture"],
        "rules": [
            {"field_name": "is_farmer", "operator": "bool_true", "value": "true", "rule_type": "mandatory", "weight": 30, "label": "✓ Registered farmer"},
            {"field_name": "state", "operator": "eq", "value": "Andhra Pradesh", "rule_type": "mandatory", "weight": 30, "label": "✓ Resident of Andhra Pradesh"},
        ],
    },
    {
        "name": "Post-Matric Scholarship for OBC Students",
        "name_te": "OBC విద్యార్థులకు పోస్ట్ మెట్రిక్ స్కాలర్‌షిప్",
        "dept_name": "Ministry of Social Justice",
        "description": "Scholarship for OBC students pursuing post-matriculation studies including professional and technical courses.",
        "description_te": "వృత్తి మరియు సాంకేతిక కోర్సులతో సహా పోస్ట్-మెట్రిక్యులేషన్ చదువులు చదివే OBC విద్యార్థులకు స్కాలర్‌షిప్.",
        "objective": "Provide financial assistance to OBC students studying at post-matric or post-secondary stage.",
        "status": "active",
        "official_url": "https://scholarships.gov.in",
        "benefit_value_inr": 30000,
        "benefits": {"summary": "Maintenance allowance + course fee reimbursement up to ₹30,000/year", "type": "Scholarship"},
        "benefits_te": {"summary": "నిర్వహణ అలవెన్స్ + కోర్సు రుసుము తిరిగి చెల్లింపు"},
        "required_docs": ["Aadhaar Card", "OBC Certificate", "Income Certificate (< ₹1L)", "Previous marksheet"],
        "required_docs_te": ["ఆధార్ కార్డ్", "OBC సర్టిఫికేట్", "ఆదాయ ధృవీకరణ పత్రం"],
        "app_start_date": date(2024, 7, 1),
        "app_end_date": date(2025, 3, 31),
        "category_tags": ["scholarship", "student", "OBC", "education"],
        "rules": [
            {"field_name": "is_student", "operator": "bool_true", "value": "true", "rule_type": "mandatory", "weight": 25, "label": "✓ Currently a student"},
            {"field_name": "category", "operator": "eq", "value": "OBC", "rule_type": "mandatory", "weight": 30, "label": "✓ OBC category"},
            {"field_name": "income_annual", "operator": "lte", "value": "100000", "rule_type": "mandatory", "weight": 20, "label": "✓ Family income below ₹1 lakh"},
        ],
    },
]


async def seed_database():
    async with AsyncSessionLocal() as db:
        # Check if already seeded
        result = await db.execute(select(User).where(User.email == "admin@schemesense.ai"))
        if result.scalar_one_or_none():
            return

        print("🌱 Seeding database...")

        # Create admin user
        admin = User(
            email="admin@schemesense.ai",
            password_hash=get_password_hash("Admin@123"),
            full_name="SchemeSense Admin",
            role="admin",
        )
        db.add(admin)
        await db.flush()
        db.add(UserProfile(user_id=admin.id))

        # Create demo user
        demo = User(
            email="demo@schemesense.ai",
            password_hash=get_password_hash("Demo@123"),
            full_name="Priya Reddy",
            preferred_language="te",
        )
        db.add(demo)
        await db.flush()
        demo_profile = UserProfile(
            user_id=demo.id,
            age=22,
            gender="female",
            state="Andhra Pradesh",
            district="Visakhapatnam",
            occupation="student",
            income_annual=180000,
            education_level="graduation",
            category="OBC",
            is_student=True,
            marital_status="single",
        )
        db.add(demo_profile)

        # Create departments
        dept_map = {}
        for d in DEPARTMENTS:
            dept = Department(name=d["name"], ministry=d["ministry"])
            db.add(dept)
            await db.flush()
            dept_map[d["name"]] = dept.id

        # Create schemes
        for sd in SCHEMES_DATA:
            scheme = Scheme(
                name=sd["name"],
                name_te=sd.get("name_te"),
                department_id=dept_map.get(sd["dept_name"]),
                description=sd["description"],
                description_te=sd.get("description_te"),
                objective=sd.get("objective"),
                status=sd.get("status", "active"),
                state_specific=sd.get("state_specific"),
                official_url=sd.get("official_url"),
                benefit_value_inr=sd.get("benefit_value_inr", 0),
                benefits=sd.get("benefits", {}),
                benefits_te=sd.get("benefits_te", {}),
                required_docs=sd.get("required_docs", []),
                required_docs_te=sd.get("required_docs_te", []),
                app_start_date=sd.get("app_start_date"),
                app_end_date=sd.get("app_end_date"),
                category_tags=sd.get("category_tags", []),
            )
            db.add(scheme)
            await db.flush()

            for r in sd.get("rules", []):
                rule = EligibilityRule(scheme_id=scheme.id, **r)
                db.add(rule)

        await db.commit()
        print("✅ Database seeded successfully!")
        print("   Admin: admin@schemesense.ai / Admin@123")
        print("   Demo:  demo@schemesense.ai  / Demo@123")
