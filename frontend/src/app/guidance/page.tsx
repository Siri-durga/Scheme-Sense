'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
import { Lang } from '@/lib/i18n';
import {
  Compass,
  Sparkles,
  LogIn,
  UserCheck,
  Search,
  CheckCircle2,
  Cpu,
  FileText,
  ExternalLink,
  Bookmark,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  LayoutDashboard,
  MessageSquare,
  ChevronRight
} from 'lucide-react';

interface Step {
  id: number;
  title: string;
  titleTe: string;
  subtitle: string;
  subtitleTe: string;
  icon: any;
  content: string[];
  contentTe: string[];
  tips?: string[];
  tipsTe?: string[];
  actionLink?: string;
  actionText?: string;
  actionTextTe?: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    title: 'Step 1 — Getting Started',
    titleTe: 'దశ 1 — ప్రారంభించడం',
    subtitle: 'Begin your journey with Scheme Sense AI',
    subtitleTe: 'స్కీమ్ సెన్స్ AI తో మీ ప్రయాణాన్ని ప్రారంభించండి',
    icon: Sparkles,
    content: [
      'Welcome to Scheme Sense AI! As a first-time visitor, your primary objective is to discover welfare programs tailored specifically to your unique life circumstances.',
      'Take a moment to glance over the clean dashboard layout: top navigation allows quick access to schemes, bookmarks, AI chat assistance, guidance, and your personal profile.',
      'Whether you are a student, farmer, entrepreneur, or senior citizen, the system is designed to identify matching state and central government initiatives effortlessly.',
    ],
    contentTe: [
      'స్కీమ్ సెన్స్ AI కి స్వాగతం! మొదటిసారి వచ్చినప్పుడు, మీ ప్రాథమిక లక్ష్యం మీకు ప్రత్యేకంగా సరిపోయే సంక్షేమ పథకాలను కనుగొనడం.',
      'పైభాగంలోని నావిగేషన్ బార్‌ను గమనించండి: ఇది పథకాలు, సేవ్ చేసినవి, AI చాట్, గైడెన్స్ మరియు మీ ప్రొఫైల్‌కు సులభ ప్రాప్యతను అందిస్తుంది.',
      'మీరు విద్యార్థి అయినా, రైతు అయినా, వ్యాపారి అయినా లేదా సీనియర్ సిటిజన్ అయినా, ఈ వేదిక మీ కోసం రూపొందించబడింది.',
    ],
    tips: [
      'Bookmark this website on your browser for quick return.',
      'Switch between English and Telugu anytime from the top-right globe button.',
    ],
    tipsTe: [
      'త్వరిత ప్రాప్యత కోసం ఈ పేజీని మీ బ్రౌజర్‌లో బుక్‌మార్క్ చేయండి.',
      'కుడివైపు పైభాగంలో ఉన్న గ్లోబ్ బటన్ ద్వారా ఎప్పుడైనా ఇంగ్లీష్ మరియు తెలుగు మధ్య మారవచ్చు.',
    ],
    actionLink: '/dashboard',
    actionText: 'Explore Dashboard',
    actionTextTe: 'డాష్‌బోర్డ్ చూడండి',
  },
  {
    id: 2,
    title: 'Step 2 — Create or Login to Your Account',
    titleTe: 'దశ 2 — ఖాతా సృష్టించండి లేదా లాగిన్ అవ్వండి',
    subtitle: 'Secure access to your personal scheme portal',
    subtitleTe: 'మీ వ్యక్తిగత పథక పోర్టల్‌కు సురక్షిత లాగిన్',
    icon: LogIn,
    content: [
      'To save your progress and receive personalized scheme matches, create a free citizen account or log in.',
      'Sign Up requires only basic credentials: your full name, email address, password, and preferred language.',
      'For quick testing and demonstrations, you can also use the one-click "Demo Citizen" or "Demo Admin" buttons located on the login screen.',
    ],
    contentTe: [
      'మీ పురోగతిని సేవ్ చేసుకోవడానికి మరియు వ్యక్తిగతీకరించిన పథకాలను పొందడానికి ఉచిత సిటిజన్ ఖాతాను సృష్టించండి లేదా లాగిన్ అవ్వండి.',
      'నమోదు కోసం మీ పేరు, ఇమెయిల్, పాస్‌వర్డ్ మరియు ప్రాధాన్యత గల భాష మాత్రమే అవసరం.',
      'డెమో ప్రయోజనాల కోసం లాగిన్ పేజీలో "Demo Citizen" బటన్ ద్వారా ఒక్క క్లిక్‌తో లాగిన్ కావచ్చు.',
    ],
    tips: [
      'Credentials are secure and protected with JWT token authentication.',
      'Select your preferred language during sign up for automatic localized recommendations.',
    ],
    tipsTe: [
      'మీ ఖాతా వివరాలు సురక్షితంగా రక్షించబడతాయి.',
      'సైన్ అప్ సమయంలో మీరు ఎంచుకున్న భాష ఆధారంగా సూచనలు కనిపిస్తాయి.',
    ],
    actionLink: '/login',
    actionText: 'Go to Login / Register',
    actionTextTe: 'లాగిన్ / రిజిస్టర్ కి వెళ్ళండి',
  },
  {
    id: 3,
    title: 'Step 3 — Complete Your Profile',
    titleTe: 'దశ 3 — మీ ప్రొఫైల్ పూర్తి చేయండి',
    subtitle: 'The secret to accurate matching scores',
    subtitleTe: 'ఖచ్చితమైన అర్హత ఫలితాల కోసం అత్యంత ముఖ్యం',
    icon: UserCheck,
    content: [
      'Government welfare schemes have specific eligibility guidelines based on demographic factors. Completing your profile is the single most important step in Scheme Sense AI.',
      'Provide your age, gender, state, district, occupation, annual family income, education level, and social category (General, OBC, SC, ST).',
      'Specify key flags like Student status, Farmer status, Below Poverty Line (BPL), or Person with Disability (PwD) if applicable.',
    ],
    contentTe: [
      'ప్రభుత్వ పథకాలు వివిధ జనాభా మరియు సామాజిక అంశాలపై ఆధారపడి ఉంటాయి. అందువల్ల మీ ప్రొఫైల్ పూర్తి చేయడం అత్యంత కీలకమైన దశ.',
      'వయస్సు, లింగం, రాష్ట్రం, జిల్లా, వృత్తి, వార్షిక కుటుంబ ఆదాయం, విద్య మరియు సామాజిక వర్గం (General, OBC, SC, ST) నమోదు చేయండి.',
      'విద్యార్థి, రైతు, దారిద్య్ర రేఖకు దిగువన (BPL), లేదా వికలాంగుడు వంటి వివరాలను కూడా సరిగ్గా ఎంచుకోండి.',
    ],
    tips: [
      'Honest and accurate profile data produces 100% accurate eligibility scores.',
      'You can update your profile anytime if your income, occupation, or education changes.',
    ],
    tipsTe: [
      'ఖచ్చితమైన వివరాలు ఇస్తేనే ఉత్తమ సరిపోలికలు లభిస్తాయి.',
      'మీ సమాచారం మారినప్పుడు ఎప్పుడైనా ప్రొఫైల్ పేజీలో వివరాలను నవీకరించవచ్చు.',
    ],
    actionLink: '/profile',
    actionText: 'Complete Your Profile Now',
    actionTextTe: 'ఇప్పుడే ప్రొఫైల్ పూర్తి చేయండి',
  },
  {
    id: 4,
    title: 'Step 4 — Explore Government Schemes',
    titleTe: 'దశ 4 — ప్రభుత్వ పథకాలను అన్వేషించండి',
    subtitle: 'Search across central and state welfare initiatives',
    subtitleTe: 'కేంద్ర మరియు రాష్ట్ర సంక్షేమ పథకాలను వెతకండి',
    icon: Search,
    content: [
      'Browse through dozens of active central and state welfare schemes in agriculture, education, healthcare, housing, financial inclusion, and small business support.',
      'Use the intuitive search bar on your dashboard to instantly look up schemes by keyword (e.g., "scholarship", "farmer loan", "housing subsidy", "health insurance").',
      'Filter schemes by your state or category to narrow down the most relevant opportunities.',
    ],
    contentTe: [
      'వ్యవసాయం, విద్య, వైద్యం, గృహ నిర్మాణం మరియు వ్యాపార రంగానికి సంబంధించిన పథకాలను సులభంగా వీక్షించండి.',
      'డాష్‌బోర్డ్‌లోని సెర్చ్ బార్ ద్వారా "స్కాలర్‌షిప్", "రైతు రుణం", "ఆరోగ్య బీమా" వంటి పదాలతో వెతకవచ్చు.',
      'రాష్ట్రం లేదా వర్గం వారీగా ఫిల్టర్ చేసి మీకు కావాల్సిన పథకాలను త్వరగా ఎంచుకోండి.',
    ],
    tips: [
      'Search works dynamically — start typing and results update in real-time.',
      'Pay attention to State-Specific badges vs Central Government schemes.',
    ],
    tipsTe: [
      'సెర్చ్ బార్‌లో టైప్ చేసిన వెంటనే ఫలితాలు ప్రత్యక్షంగా కనిపిస్తాయి.',
      'రాష్ట్ర పథకాలు మరియు కేంద్ర పథకాల ట్యాగ్‌లను గమనించండి.',
    ],
    actionLink: '/dashboard',
    actionText: 'Search Schemes on Dashboard',
    actionTextTe: 'పథకాల కోసం వెతకండి',
  },
  {
    id: 5,
    title: 'Step 5 — Understand Scheme Eligibility',
    titleTe: 'దశ 5 — పథక అర్హతను అర్థం చేసుకోండి',
    subtitle: 'Transparent Match Scores with clear reasons',
    subtitleTe: 'స్పష్టమైన కారణాలతో మ్యాచ్ స్కోర్ల వివరాలు',
    icon: CheckCircle2,
    content: [
      'Scheme Sense AI calculates a personalized "Match Score" (0% to 100%) for every scheme based on your profile attributes.',
      'High Match (80%+): You meet almost all core criteria (age, income, category, state).',
      'Medium Match (50%–79%): You qualify for most conditions, but need to verify special terms.',
      'Low Match (<50%): Some conditions may conflict with your profile (e.g., outside target income bracket or wrong state).',
    ],
    contentTe: [
      'మీ ప్రొఫైల్ ఆధారంగా ప్రతి పథకానికి 0% నుండి 100% వరకు "మ్యాచ్ స్కోర్" లెక్కించబడుతుంది.',
      'అధిక మ్యాచ్ (80%+): మీరు దాదాపు అన్ని అర్హతలను (వయస్సు, ఆదాయం, వర్గం) పూర్తి చేశారు.',
      'మధ్యస్థ మ్యాచ్ (50%–79%): చాలా నిబంధనలు సరిపోతాయి, కొన్ని ప్రత్యేక షరతులు పరిశీలించాలి.',
      'తక్కువ మ్యాచ్ (<50%): మీ ప్రొఫైల్‌కు కొన్ని నిబంధనలు సరిపోలకపోవచ్చు.',
    ],
    tips: [
      'Look for the green "Eligible Because" bullet points on scheme cards.',
      'Never guess — the platform clearly highlights why you qualify.',
    ],
    tipsTe: [
      'స్కీమ్ కార్డ్‌లపై ఆకుపచ్చ రంగులో ఉండే "అర్హత కారణాలు" పరిశీలించండి.',
      'మీరు ఎందుకు అర్హులో వేదిక స్వయంగా స్పష్టంగా వివరిస్తుంది.',
    ],
    actionLink: '/dashboard/schemes',
    actionText: 'Check My Eligible Schemes',
    actionTextTe: 'నా అర్హమైన పథకాలు చూడండి',
  },
  {
    id: 6,
    title: 'Step 6 — Get AI-Based Recommendations',
    titleTe: 'దశ 6 — AI-ఆధారిత సిఫార్సులు పొందండి',
    subtitle: 'Automated match engine and benefits calculator',
    subtitleTe: 'ఆటోమేటిక్ మ్యాచింగ్ మరియు లబ్ధి లెక్కింపు',
    icon: Cpu,
    content: [
      'Behind the scenes, our rule-based scoring engine and vector AI compare your profile constraints against the entire scheme database.',
      'Use the "Refresh Matches" button on your dashboard anytime to trigger a fresh computation across the latest database updates.',
      'Check the Potential Benefits Calculator: it estimates the cumulative monetary benefits (₹) you could claim across all qualifying schemes.',
    ],
    contentTe: [
      'మా ఆధునిక AI ఇంజిన్ మీ ప్రొఫైల్ వివరాలను ప్రభుత్వ పథకాల డేటాబేస్‌తో సమగ్రంగా పోలుస్తుంది.',
      'కొత్తగా విడుదలైన పథకాలతో మీ అర్హతలను సరిపోల్చడానికి "Refresh Matches" బటన్ నొక్కండి.',
      'మీరు పొందగల మొత్తం ఆర్థిక లబ్ధిని (₹) సంభావ్య లబ్ధుల కాలిక్యులేటర్ ద్వారా తెలుసుకోండి.',
    ],
    tips: [
      'Schemes are automatically sorted by relevance and deadline urgency.',
      'Check back regularly as new government welfare schemes are frequently added.',
    ],
    tipsTe: [
      'పథకాలు వాటి ప్రాముఖ్యత మరియు గడువు ఆధారంగా అమర్చబడతాయి.',
      'ప్రభుత్వం కొత్త పథకాలు ప్రవేశపెట్టినప్పుడు క్రమం తప్పకుండా డాష్‌బోర్డ్ చూడండి.',
    ],
    actionLink: '/dashboard',
    actionText: 'View Benefits Calculator',
    actionTextTe: 'లబ్ధుల కాలిక్యులేటర్ చూడండి',
  },
  {
    id: 7,
    title: 'Step 7 — View Scheme Details',
    titleTe: 'దశ 7 — పూర్తి పథక వివరాలు పరిశీలించండి',
    subtitle: 'Deep dive into benefits, rules, and documentation',
    subtitleTe: 'లబ్ధులు, నిబంధనలు మరియు పత్రాల పూర్తి సమాచారం',
    icon: FileText,
    content: [
      'Click on any scheme card to open its comprehensive details page. Before applying, inspect 5 crucial areas:',
      '1. Benefits: Exact financial aid, subsidy percentage, loan terms, or pension amount.',
      '2. Detailed Eligibility: Minimum/maximum age, family income limits, and land-holding criteria.',
      '3. Required Documents: Aadhaar card, income certificate, caste certificate, bank passbook, domicile proof, etc.',
      '4. Application Timeline: Launch date, application start date, and application deadline.',
      '5. Managing Ministry/Department: Nodal agency responsible for disbursal.',
    ],
    contentTe: [
      'ఏ పథకంపై అయినా క్లిక్ చేసి దాని సమగ్ర వివరాల పేజీని తెరవండి. దరఖాస్తు చేయడానికి ముందు ఈ 5 అంశాలను చూడండి:',
      '1. లబ్ధులు: ఆర్థిక సాయం, సబ్సిడీ మొత్తం, లేదా పెన్షన్ వివరాలు.',
      '2. వివరణాత్మక అర్హత: వయస్సు పరిమితి, కుటుంబ ఆదాయ పరిమితి మరియు భూమి వివరాలు.',
      '3. అవసరమైన పత్రాలు: ఆధార్, ఆదాయ ధృవీకరణ పత్రం, కుల ధృవీకరణ పత్రం, బ్యాంక్ పాస్‌బుక్ మొదలైనవి.',
      '4. దరఖాస్తు కాలపరిమితి: ప్రారంభ తేదీ మరియు చివరి గడువు తేదీ.',
      '5. ప్రభుత్వ శాఖ: పథకాన్ని అమలు చేసే సంబంధిత మంత్రిత్వ శాఖ లేదా విభాగం.',
    ],
    tips: [
      'Ensure all required documents are ready and names match your official ID.',
      'Keep note of closing deadlines so you do not miss application windows.',
    ],
    tipsTe: [
      'అన్ని పత్రాలు సిద్ధంగా ఉన్నాయో లేదో ముందే చూసుకోండి.',
      'చివరి తేదీ ముగియక ముందే దరఖాస్తు చేసుకోవడం మర్చిపోకండి.',
    ],
  },
  {
    id: 8,
    title: 'Step 8 — Apply for a Scheme',
    titleTe: 'దశ 8 — పథకానికి దరఖాస్తు చేసుకోండి',
    subtitle: 'Direct navigation to official government portals',
    subtitleTe: 'అధికారిక ప్రభుత్వ వెబ్‌సైట్‌లకు ప్రత్యక్ష లింకులు',
    icon: ExternalLink,
    content: [
      'Once you have confirmed eligibility and prepared your required documents, it is time to apply.',
      'On the Scheme Details page, click the green "Official Application Link" or "Apply Now" button.',
      'This redirects you safely to the official Indian Government portal (.gov.in or state portal) where you can fill the official application form without intermediaries or scams.',
    ],
    contentTe: [
      'అర్హత నిర్ధారించుకుని, పత్రాలు సిద్ధం చేసుకున్న తర్వాత దరఖాస్తు చేయడానికి సిద్ధం కావచ్చు.',
      'పథకం వివరాల పేజీలోని "Official Application Link" లేదా "Apply Now" బటన్‌ను క్లిక్ చేయండి.',
      'ఇది మిమ్మల్ని సురక్షితంగా అధికారిక ప్రభుత్వ పోర్టల్ (.gov.in) కి తీసుకెళ్తుంది. మధ్యవర్తుల అవసరం లేకుండా దరఖాస్తు చేసుకోండి.',
    ],
    tips: [
      'Always apply only through verified government URLs provided on Scheme Sense AI.',
      'Save your application registration number / acknowledgement slip after submitting on the portal.',
    ],
    tipsTe: [
      'స్కీమ్ సెన్స్ AI లో ఇచ్చిన ధృవీకరించిన అధికారిక లింకుల ద్వారా మాత్రమే దరఖాస్తు చేయండి.',
      'దరఖాస్తు చేసిన తర్వాత రసీదు నంబర్‌ను భద్రపరుచుకోండి.',
    ],
  },
  {
    id: 9,
    title: 'Step 9 — Track and Manage Schemes',
    titleTe: 'దశ 9 — పథకాలను ట్రాక్ చేయండి మరియు సేవ్ చేసుకోండి',
    subtitle: 'Bookmark your favorite schemes for easy access',
    subtitleTe: 'సులభ వీక్షణ కోసం మీకు నచ్చిన పథకాలను బుక్‌మార్క్ చేయండి',
    icon: Bookmark,
    content: [
      'Found a great scheme you want to review later? Click the "Save" (bookmark) icon on any scheme card.',
      'Access all your bookmarked schemes anytime from the "Saved" tab in the top navigation bar.',
      'Use the Saved tab as your personal shortlist to track ongoing applications, upcoming scheme openings, or required document collection.',
    ],
    contentTe: [
      'తర్వాత దరఖాస్తు చేయాలనుకుంటున్న పథకాలను స్కీమ్ కార్డ్‌పై ఉన్న "Save" ఐకాన్ నొక్కి సేవ్ చేయండి.',
      'పైభాగంలోని "Saved" నావిగేషన్ మెనూ ద్వారా సేవ్ చేసిన పథకాలను ఎప్పుడైనా చూడవచ్చు.',
      'మీ దరఖాస్తు స్థితిని ట్రాక్ చేయడానికి మరియు పత్రాలను సిద్ధం చేసుకోవడానికి సేవ్ చేసిన జాబితాను ఉపయోగించండి.',
    ],
    tips: [
      'You can unsave a scheme anytime once you have finished applying.',
      'Your saved schemes stay synced to your user account across logins.',
    ],
    tipsTe: [
      'దరఖాస్తు పూర్తయిన తర్వాత ఎప్పుడైనా జాబితా నుండి పథకాన్ని తొలగించవచ్చు.',
      'సేవ్ చేసిన పథకాలు మీ ఖాతాలో శాశ్వతంగా భద్రంగా ఉంటాయి.',
    ],
    actionLink: '/dashboard/saved',
    actionText: 'View Saved Schemes',
    actionTextTe: 'సేవ్ చేసిన పథకాలు చూడండి',
  },
  {
    id: 10,
    title: 'Step 10 — Get Help & AI Assistance',
    titleTe: 'దశ 10 — సహాయం మరియు AI సహాయకుడు',
    subtitle: 'Ask questions in plain English or Telugu 24/7',
    subtitleTe: '24/7 తెలుగు లేదా ఇంగ్లీష్‌లో ప్రశ్నలు అడగండి',
    icon: MessageSquare,
    content: [
      'Have questions about eligibility, application procedures, or which scheme pays the highest benefit? Meet your Scheme Sense AI Assistant!',
      'Click "AI Assistant" in the navigation bar to chat in natural conversational language. You can ask in English or Telugu.',
      'Example questions: "Which scholarship can an OBC engineering student get?", "How do I apply for PM Kisan?", "What documents are required for Rythu Bharosa?".',
    ],
    contentTe: [
      'అర్హత, దరఖాస్తు విధానం లేదా లబ్ధుల గురించి సందేహాలు ఉన్నాయా? మా Scheme Sense AI అసిస్టెంట్‌ని అడగండి!',
      'నావిగేషన్ బార్‌లోని "AI Assistant" పై క్లిక్ చేసి ఇంగ్లీష్ లేదా తెలుగులో సులభంగా చాట్ చేయండి.',
      'ఉదాహరణ ప్రశ్నలు: "రైతు భరోసాకి ఏ పత్రాలు కావాలి?", "ఇంజనీరింగ్ విద్యార్థులకు ఏ స్కాలర్‌షిప్‌లు ఉన్నాయి?".',
    ],
    tips: [
      'The AI assistant is grounded with accurate government scheme criteria.',
      'For complex administrative issues, refer to the official helpline numbers displayed on the scheme detail pages.',
    ],
    tipsTe: [
      'AI సహాయకుడు అధికారిక ప్రభుత్వ డేటా ఆధారంగా ఖచ్చితమైన సమాధానాలు ఇస్తుంది.',
      'మరిన్ని వివరాలకు సంబంధిత శాఖ హెల్ప్‌లైన్ నంబర్లను సంప్రదించవచ్చు.',
    ],
    actionLink: '/chat',
    actionText: 'Chat with AI Assistant Now',
    actionTextTe: 'AI సహాయకుడితో చాట్ చేయండి',
  },
];

export default function GuidancePage() {
  const { user, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('en');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'stepper' | 'all'>('stepper');

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (user?.preferred_language) {
      setLang(user.preferred_language as Lang);
    }
  }, [user]);

  const currentStep = STEPS[activeStep - 1];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar lang={lang} onLangChange={setLang} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb / Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold mb-2">
              <Compass size={14} />
              <span>{lang === 'te' ? 'యూజర్ గైడ్' : 'New User Guidance'}</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-black text-gray-900 ${lang === 'te' ? 'telugu' : ''}`}>
              {lang === 'te' ? 'స్కీమ్ సెన్స్ AI పూర్తి మార్గదర్శకం' : 'Complete Guide to Scheme Sense AI'}
            </h1>
            <p className={`text-gray-600 text-sm sm:text-base mt-1 ${lang === 'te' ? 'telugu' : ''}`}>
              {lang === 'te'
                ? 'ప్రభుత్వ పథకాలను కనుగొనడం, అర్హత తెలుసుకోవడం మరియు దరఖాస్తు చేసుకోవడం వరకు దశలవారీ వివరణ.'
                : 'A friendly step-by-step walkthrough to discover, understand, and apply for government schemes.'}
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white border border-gray-200 p-1 rounded-xl shadow-sm text-xs font-semibold">
            <button
              onClick={() => setViewMode('stepper')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'stepper' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {lang === 'te' ? 'దశల వారీ వీక్షణ' : 'Step-by-Step Mode'}
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                viewMode === 'all' ? 'bg-green-600 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {lang === 'te' ? 'అన్ని 10 దశలు' : 'View All 10 Steps'}
            </button>
          </div>
        </div>

        {/* Welcome Banner Card */}
        <div className="bg-gradient-to-r from-green-700 to-green-900 rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
              <span>{lang === 'te' ? 'స్కీమ్ సెన్స్ AI కి స్వాగతం' : 'Welcome to Scheme Sense AI'}</span>
            </h2>
            <p className="text-green-100 text-sm sm:text-base leading-relaxed mb-4">
              {lang === 'te'
                ? 'భారతదేశంలో వందలాది కేంద్ర మరియు రాష్ట్ర ప్రభుత్వ పథకాలు ఉన్నాయి, కానీ సరైన సమాచారం మరియు అవగాహన లేకపోవడం వల్ల చాలామంది అర్హులైన పౌరులు ప్రయోజనాలను కోల్పోతున్నారు. స్కీమ్ సెన్స్ AI ఈ సమస్యను పరిష్కరిస్తుంది. ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ సహాయంతో మీ వ్యక్తిగత ప్రొఫైల్‌కు అనువైన పథకాలను కేవలం నిమిషాల్లో కనుగొనవచ్చు.'
                : 'Every year, thousands of crores in central and state welfare benefits go unclaimed simply because citizens are unaware of schemes they qualify for. Scheme Sense AI bridges this gap using intelligent profile matching, transparent eligibility scoring, and direct application links without complex jargon or middlemen.'}
            </p>
            <div className="flex flex-wrap gap-3 text-xs font-medium">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
                <Check size={14} className="text-green-300" /> {lang === 'te' ? 'ఉచిత పౌర సేవ' : '100% Free Service'}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
                <Check size={14} className="text-green-300" /> {lang === 'te' ? 'కేంద్ర & రాష్ట్ర పథకాలు' : 'Central & State Schemes'}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
                <Check size={14} className="text-green-300" /> {lang === 'te' ? 'సురక్షితమైన డేటా' : 'Privacy Protected'}
              </span>
            </div>
          </div>
        </div>

        {/* STEP-BY-STEP MODE */}
        {viewMode === 'stepper' && (
          <div>
            {/* Step Navigation Pill Bar */}
            <div className="bg-white border border-gray-200 rounded-2xl p-3 mb-6 shadow-sm">
              <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-3 px-1">
                <span>{lang === 'te' ? `దశ ${activeStep} / 10` : `Step ${activeStep} of 10`}</span>
                <span className="text-green-700 font-semibold">{Math.round((activeStep / 10) * 100)}% Complete</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-4">
                <div
                  className="bg-green-600 h-full transition-all duration-300 ease-out"
                  style={{ width: `${(activeStep / 10) * 100}%` }}
                />
              </div>

              {/* Step Buttons horizontal scroll */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {STEPS.map(step => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      activeStep === step.id
                        ? 'bg-green-600 text-white shadow-sm'
                        : activeStep > step.id
                        ? 'bg-green-50 text-green-800 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-white/20">
                      {step.id}
                    </span>
                    <span className="hidden sm:inline">
                      {lang === 'te' ? step.titleTe.split(' — ')[1] : step.title.split(' — ')[1]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Step Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <currentStep.icon size={28} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
                      {lang === 'te' ? `దశ ${currentStep.id}` : `Step ${currentStep.id}`}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {lang === 'te' ? currentStep.titleTe : currentStep.title}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {lang === 'te' ? currentStep.subtitleTe : currentStep.subtitle}
                    </p>
                  </div>
                </div>

                {currentStep.actionLink && (
                  <Link
                    href={currentStep.actionLink}
                    className="inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-sm"
                  >
                    <span>{lang === 'te' ? currentStep.actionTextTe : currentStep.actionText}</span>
                    <ArrowRight size={14} />
                  </Link>
                )}
              </div>

              {/* Paragraphs */}
              <div className="space-y-3 text-gray-700 text-sm sm:text-base leading-relaxed mb-6">
                {(lang === 'te' ? currentStep.contentTe : currentStep.content).map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>

              {/* Tips Box */}
              {currentStep.tips && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-5 mb-6">
                  <h4 className="text-xs font-bold text-green-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-green-600" />
                    <span>{lang === 'te' ? 'ముఖ్య సూచనలు' : 'Helpful Advice for This Step'}</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-green-900">
                    {(lang === 'te' ? currentStep.tipsTe! : currentStep.tips).map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prev / Next Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
                  disabled={activeStep === 1}
                  className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-green-700 px-4 py-2 rounded-xl hover:bg-gray-100 transition disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ArrowLeft size={16} />
                  <span>{lang === 'te' ? 'వెనుకకు' : 'Previous Step'}</span>
                </button>

                <div className="text-xs text-gray-400 font-medium hidden sm:block">
                  {lang === 'te' ? 'దశల ద్వారా నావిగేట్ చేయండి' : 'Navigate through steps'}
                </div>

                <button
                  onClick={() => setActiveStep(prev => Math.min(10, prev + 1))}
                  disabled={activeStep === 10}
                  className="flex items-center gap-1.5 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition shadow-sm disabled:opacity-30 disabled:pointer-events-none"
                >
                  <span>{lang === 'te' ? 'తదుపరి దశ' : 'Next Step'}</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW ALL 10 STEPS MODE */}
        {viewMode === 'all' && (
          <div className="space-y-6">
            {STEPS.map(step => (
              <div
                key={step.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                      <step.icon size={24} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-green-600 uppercase tracking-wider">
                        {lang === 'te' ? `దశ ${step.id} / 10` : `Step ${step.id} of 10`}
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                        {lang === 'te' ? step.titleTe : step.title}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm">
                        {lang === 'te' ? step.subtitleTe : step.subtitle}
                      </p>
                    </div>
                  </div>

                  {step.actionLink && (
                    <Link
                      href={step.actionLink}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition"
                    >
                      <span>{lang === 'te' ? step.actionTextTe : step.actionText}</span>
                      <ChevronRight size={14} />
                    </Link>
                  )}
                </div>

                <div className="space-y-2 text-gray-700 text-sm leading-relaxed mb-4">
                  {(lang === 'te' ? step.contentTe : step.content).map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                {step.tips && (
                  <div className="bg-green-50/70 border border-green-100 rounded-xl p-3 sm:p-4">
                    <ul className="space-y-1 text-xs text-green-900">
                      {(lang === 'te' ? step.tipsTe! : step.tips).map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-green-600 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Launch Bottom Bar */}
        <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-3">
            {lang === 'te' ? 'త్వరిత ప్రారంభ లింకులు' : 'Ready to start using Scheme Sense AI?'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/dashboard"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-xl transition group"
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard size={18} className="text-green-600" />
                <span className="text-sm font-semibold text-gray-800 group-hover:text-green-800">
                  {lang === 'te' ? 'డాష్‌బోర్డ్' : 'Go to Dashboard'}
                </span>
              </div>
              <ArrowRight size={14} className="text-gray-400 group-hover:text-green-600 transition" />
            </Link>

            <Link
              href="/profile"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-xl transition group"
            >
              <div className="flex items-center gap-2.5">
                <UserCheck size={18} className="text-green-600" />
                <span className="text-sm font-semibold text-gray-800 group-hover:text-green-800">
                  {lang === 'te' ? 'ప్రొఫైల్ పూర్తి చేయండి' : 'Update Profile'}
                </span>
              </div>
              <ArrowRight size={14} className="text-gray-400 group-hover:text-green-600 transition" />
            </Link>

            <Link
              href="/chat"
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 rounded-xl transition group"
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare size={18} className="text-green-600" />
                <span className="text-sm font-semibold text-gray-800 group-hover:text-green-800">
                  {lang === 'te' ? 'AI అసిస్టెంట్' : 'Ask AI Assistant'}
                </span>
              </div>
              <ArrowRight size={14} className="text-gray-400 group-hover:text-green-600 transition" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
