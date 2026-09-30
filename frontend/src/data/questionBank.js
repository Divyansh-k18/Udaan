import { examCatalog } from "./examCatalog.js";
import { expandedQuestions } from "./expandedQuestions.js";

/*
  Udaan Question Bank
  -------------------
  IMPORTANT:
  - These are ORIGINAL demo questions created for Udaan.
  - They are NOT copied from previous exam papers.
  - reviewedBy is null because these questions still require human review.
  - Before production use, academic content and translations should be reviewed.
*/

const SUPPORTED_LANGUAGES = [
  "en-IN",
  "hi-IN",
  "mr-IN",
  "gu-IN",
  "bn-IN",
  "ta-IN",
];

/*
  Small helper so every translatable field has all 6 languages.
*/
function L(en, hi, mr, gu, bn, ta) {
  return {
    "en-IN": en,
    "hi-IN": hi,
    "mr-IN": mr,
    "gu-IN": gu,
    "bn-IN": bn,
    "ta-IN": ta,
  };
}

export const questionBank = [
  ...expandedQuestions,
  // =========================================================
  // REASONING
  // =========================================================

  {
    id: "reasoning-001",
    exams: ["ssc-cgl-mini", "bank-po-mini", "rrb-ntpc-mini"],
    subject: "Reasoning",
    topic: "Number Series",
    difficulty: "easy",
    passageId: null,

    text: L(
      "Find the next number: 2, 6, 12, 20, 30, ?",
      "अगली संख्या ज्ञात करें: 2, 6, 12, 20, 30, ?",
      "पुढील संख्या शोधा: 2, 6, 12, 20, 30, ?",
      "આગળની સંખ્યા શોધો: 2, 6, 12, 20, 30, ?",
      "পরবর্তী সংখ্যাটি নির্ণয় করুন: 2, 6, 12, 20, 30, ?",
      "அடுத்த எண்ணைக் கண்டறியவும்: 2, 6, 12, 20, 30, ?"
    ),

    spoken: L(
      "Find the next number in the series: two, six, twelve, twenty, thirty.",
      "श्रृंखला में अगली संख्या बताइए: दो, छह, बारह, बीस, तीस।",
      "या मालिकेतील पुढील संख्या सांगा: दोन, सहा, बारा, वीस, तीस.",
      "શ્રેણીમાં આગળની સંખ્યા કહો: બે, છ, બાર, વીસ, ત્રીસ.",
      "ধারাটির পরবর্তী সংখ্যা বলুন: দুই, ছয়, বারো, কুড়ি, ত্রিশ।",
      "இந்த தொடரின் அடுத்த எண்ணைக் கூறவும்: இரண்டு, ஆறு, பன்னிரண்டு, இருபது, முப்பது."
    ),

    options: L(
      ["36", "40", "42", "44"],
      ["36", "40", "42", "44"],
      ["36", "40", "42", "44"],
      ["36", "40", "42", "44"],
      ["36", "40", "42", "44"],
      ["36", "40", "42", "44"]
    ),

    answer: 2,

    explanation: L(
      "The differences are 4, 6, 8, 10, so the next difference is 12 and the answer is 42.",
      "अंतर 4, 6, 8, 10 हैं, इसलिए अगला अंतर 12 है और उत्तर 42 है।",
      "फरक 4, 6, 8, 10 आहेत, त्यामुळे पुढील फरक 12 आणि उत्तर 42 आहे.",
      "તફાવતો 4, 6, 8, 10 છે, તેથી આગળનો તફાવત 12 અને જવાબ 42 છે.",
      "পার্থক্যগুলো 4, 6, 8, 10, তাই পরবর্তী পার্থক্য 12 এবং উত্তর 42।",
      "வேறுபாடுகள் 4, 6, 8, 10 ஆகும்; அடுத்த வேறுபாடு 12, எனவே விடை 42."
    ),

    altText: null,
    reviewedBy: null,
  },

  {
    id: "reasoning-002",
    exams: ["ssc-cgl-mini", "bank-po-mini", "rrb-ntpc-mini"],
    subject: "Reasoning",
    topic: "Blood Relations",
    difficulty: "easy",
    passageId: null,

    text: L(
      "Meera is Ravi's sister. Ravi is Arjun's father. How is Meera related to Arjun?",
      "मीरा, रवि की बहन है। रवि, अर्जुन के पिता हैं। मीरा का अर्जुन से क्या संबंध है?",
      "मीरा ही रवीची बहीण आहे. रवी हा अर्जुनचा वडील आहे. मीराचे अर्जुनशी नाते काय?",
      "મીરા રવિની બહેન છે. રવિ અર્જુનના પિતા છે. મીરાનો અર્જુન સાથે શું સંબંધ છે?",
      "মীরা রবির বোন। রবি অর্জুনের বাবা। মীরা অর্জুনের কী হন?",
      "மீரா ரவியின் சகோதரி. ரவி அர்ஜுனின் தந்தை. மீரா அர்ஜுனுக்கு என்ன உறவு?"
    ),

    spoken: L(
      "Meera is the sister of Ravi. Ravi is the father of Arjun. What is Meera's relationship to Arjun?",
      "मीरा रवि की बहन है और रवि अर्जुन के पिता हैं। मीरा अर्जुन की क्या लगती है?",
      "मीरा रवीची बहीण आहे आणि रवी अर्जुनचा वडील आहे. मीरा अर्जुनची कोण लागते?",
      "મીરા રવિની બહેન છે અને રવિ અર્જુનના પિતા છે. મીરા અર્જુનની શું લાગે?",
      "মীরা রবির বোন এবং রবি অর্জুনের বাবা। মীরা অর্জুনের কী হন?",
      "மீரா ரவியின் சகோதரி; ரவி அர்ஜுனின் தந்தை. மீரா அர்ஜுனுக்கு என்ன உறவு?"
    ),

    options: L(
      ["Mother", "Aunt", "Sister", "Grandmother"],
      ["माता", "बुआ", "बहन", "दादी"],
      ["आई", "आत्या", "बहीण", "आजी"],
      ["માતા", "ફોઈ", "બહેન", "દાદી"],
      ["মা", "পিসি", "বোন", "দাদি"],
      ["தாய்", "அத்தை", "சகோதரி", "பாட்டி"]
    ),

    answer: 1,

    explanation: L(
      "Meera is the sister of Arjun's father, so she is Arjun's aunt.",
      "मीरा अर्जुन के पिता की बहन है, इसलिए वह अर्जुन की बुआ है।",
      "मीरा अर्जुनच्या वडिलांची बहीण असल्यामुळे ती अर्जुनची आत्या आहे.",
      "મીરા અર્જુનના પિતાની બહેન હોવાથી તે અર્જુનની ફોઈ છે.",
      "মীরা অর্জুনের বাবার বোন, তাই তিনি অর্জুনের পিসি।",
      "மீரா அர்ஜுனின் தந்தையின் சகோதரி என்பதால் அவர் அர்ஜுனின் அத்தை."
    ),

    altText: null,
    reviewedBy: null,
  },

  {
    id: "reasoning-003",
    exams: ["ssc-cgl-mini", "bank-po-mini", "rrb-ntpc-mini"],
    subject: "Reasoning",
    topic: "Coding Decoding",
    difficulty: "medium",
    passageId: null,

    text: L(
      "If CAT is coded as DBU by moving each letter one step forward, how is DOG coded?",
      "यदि प्रत्येक अक्षर को एक स्थान आगे बढ़ाकर CAT को DBU लिखा जाता है, तो DOG को कैसे लिखा जाएगा?",
      "प्रत्येक अक्षर एक स्थान पुढे नेऊन CAT चे DBU असे कोडिंग केले तर DOG चे कोडिंग काय असेल?",
      "દરેક અક્ષરને એક સ્થાન આગળ ખસેડીને CAT ને DBU લખવામાં આવે તો DOG કેવી રીતે લખાશે?",
      "প্রতিটি অক্ষর এক ধাপ এগিয়ে CAT-কে DBU লেখা হলে DOG কীভাবে লেখা হবে?",
      "ஒவ்வொரு எழுத்தையும் ஒரு இடம் முன்னேற்றினால் CAT என்பது DBU ஆகிறது. DOG எவ்வாறு எழுதப்படும்?"
    ),

    spoken: L(
      "Each letter moves one alphabet position forward. Cat becomes D B U. What does dog become?",
      "हर अक्षर अंग्रेज़ी वर्णमाला में एक स्थान आगे जाता है। C A T से D B U बनता है। D O G क्या बनेगा?",
      "प्रत्येक अक्षर इंग्रजी वर्णमालेत एक स्थान पुढे जातो. C A T चे D B U होते. D O G काय होईल?",
      "દરેક અક્ષર અંગ્રેજી વર્ણમાળામાં એક સ્થાન આગળ જાય છે. C A T નું D B U થાય છે. D O G શું થશે?",
      "প্রতিটি অক্ষর ইংরেজি বর্ণমালায় এক ধাপ এগোয়। C A T থেকে D B U হয়। D O G কী হবে?",
      "ஒவ்வொரு எழுத்தும் ஆங்கில எழுத்துவரிசையில் ஒரு இடம் முன்னேறும். C A T என்பது D B U ஆகிறது. D O G என்ன ஆகும்?"
    ),

    options: L(
      ["EPH", "EOH", "FPH", "DNG"],
      ["EPH", "EOH", "FPH", "DNG"],
      ["EPH", "EOH", "FPH", "DNG"],
      ["EPH", "EOH", "FPH", "DNG"],
      ["EPH", "EOH", "FPH", "DNG"],
      ["EPH", "EOH", "FPH", "DNG"]
    ),

    answer: 0,

    explanation: L(
      "D becomes E, O becomes P, and G becomes H, giving EPH.",
      "D से E, O से P और G से H बनता है, इसलिए उत्तर EPH है।",
      "D चे E, O चे P आणि G चे H होते, म्हणून उत्तर EPH आहे.",
      "D નું E, O નું P અને G નું H થાય છે, તેથી જવાબ EPH છે.",
      "D থেকে E, O থেকে P এবং G থেকে H হয়, তাই উত্তর EPH।",
      "D என்பது E, O என்பது P, G என்பது H ஆகும்; எனவே விடை EPH."
    ),

    altText: null,
    reviewedBy: null,
  },

  {
    id: "reasoning-004",
    exams: ["ssc-cgl-mini", "bank-po-mini", "rrb-ntpc-mini"],
    subject: "Reasoning",
    topic: "Direction Sense",
    difficulty: "easy",
    passageId: null,

    text: L(
      "A person walks 4 km north and then 3 km east. What is the shortest distance from the starting point?",
      "एक व्यक्ति 4 किलोमीटर उत्तर और फिर 3 किलोमीटर पूर्व चलता है। प्रारंभिक स्थान से सबसे कम दूरी कितनी है?",
      "एक व्यक्ती 4 किलोमीटर उत्तरेकडे आणि नंतर 3 किलोमीटर पूर्वेकडे चालतो. सुरुवातीच्या ठिकाणापासून सर्वात कमी अंतर किती?",
      "એક વ્યક્તિ 4 કિલોમીટર ઉત્તર તરફ અને પછી 3 કિલોમીટર પૂર્વ તરફ ચાલે છે. શરૂઆતના સ્થળથી સૌથી ઓછું અંતર કેટલું?",
      "একজন ব্যক্তি 4 কিলোমিটার উত্তর এবং তারপর 3 কিলোমিটার পূর্ব দিকে হাঁটেন। শুরুর স্থান থেকে সর্বনিম্ন দূরত্ব কত?",
      "ஒருவர் 4 கிலோமீட்டர் வடக்காகவும் பின்னர் 3 கிலோமீட்டர் கிழக்காகவும் செல்கிறார். தொடக்க இடத்திலிருந்து குறைந்த தூரம் எவ்வளவு?"
    ),

    spoken: L(
      "A person walks four kilometres north, then three kilometres east. What is the shortest distance back to the starting point?",
      "एक व्यक्ति चार किलोमीटर उत्तर और फिर तीन किलोमीटर पूर्व जाता है। शुरुआती स्थान से उसकी सीधी दूरी कितनी है?",
      "एक व्यक्ती चार किलोमीटर उत्तर आणि नंतर तीन किलोमीटर पूर्वेला जातो. सुरुवातीपासून सरळ अंतर किती?",
      "એક વ્યક્તિ ચાર કિલોમીટર ઉત્તર અને પછી ત્રણ કિલોમીટર પૂર્વ જાય છે. શરૂઆતથી સીધું અંતર કેટલું?",
      "একজন ব্যক্তি চার কিলোমিটার উত্তর এবং তারপর তিন কিলোমিটার পূর্বে যান। শুরু থেকে সরাসরি দূরত্ব কত?",
      "ஒருவர் நான்கு கிலோமீட்டர் வடக்காகவும் பின்னர் மூன்று கிலோமீட்டர் கிழக்காகவும் செல்கிறார். தொடக்க இடத்திலிருந்து நேர்தூரம் எவ்வளவு?"
    ),

    options: L(
      ["5 km", "7 km", "1 km", "4 km"],
      ["5 किमी", "7 किमी", "1 किमी", "4 किमी"],
      ["5 किमी", "7 किमी", "1 किमी", "4 किमी"],
      ["5 કિમી", "7 કિમી", "1 કિમી", "4 કિમી"],
      ["5 কিমি", "7 কিমি", "1 কিমি", "4 কিমি"],
      ["5 கிமீ", "7 கிமீ", "1 கிமீ", "4 கிமீ"]
    ),

    answer: 0,

    explanation: L(
      "Using a 3-4-5 right triangle, the shortest distance is 5 km.",
      "3-4-5 समकोण त्रिभुज के अनुसार सीधी दूरी 5 किलोमीटर है।",
      "3-4-5 समकोणी त्रिकोणानुसार सरळ अंतर 5 किलोमीटर आहे.",
      "3-4-5 સમકોણ ત્રિકોણ પ્રમાણે સીધું અંતર 5 કિલોમીટર છે.",
      "3-4-5 সমকোণী ত্রিভুজ অনুযায়ী সরাসরি দূরত্ব 5 কিলোমিটার।",
      "3-4-5 செங்கோண முக்கோணத்தின் படி நேர்தூரம் 5 கிலோமீட்டர்."
    ),

    altText: null,
    reviewedBy: null,
  },

  // =========================================================
  // MATHEMATICS
  // =========================================================

  {
    id: "math-001",
    exams: ["ssc-cgl-mini", "bank-po-mini", "rrb-ntpc-mini"],
    subject: "Mathematics",
    topic: "Percentage",
    difficulty: "easy",
    passageId: null,

    text: L(
      "What is 15% of 240?",
      "240 का 15% कितना है?",
      "240 चे 15% किती?",
      "240 ના 15% કેટલા?",
      "240-এর 15% কত?",
      "240 இன் 15% எவ்வளவு?"
    ),

    spoken: L(
      "What is fifteen percent of two hundred forty?",
      "दो सौ चालीस का पंद्रह प्रतिशत कितना है?",
      "दोनशे चाळीसचे पंधरा टक्के किती?",
      "બસો ચાલીસના પંદર ટકા કેટલા?",
      "দুইশো চল্লিশের পনেরো শতাংশ কত?",
      "இருநூற்று நாற்பதின் பதினைந்து சதவீதம் எவ்வளவு?"
    ),

    options: L(
      ["24", "30", "36", "40"],
      ["24", "30", "36", "40"],
      ["24", "30", "36", "40"],
      ["24", "30", "36", "40"],
      ["24", "30", "36", "40"],
      ["24", "30", "36", "40"]
    ),

    answer: 2,

    explanation: L(
      "15% of 240 is 0.15 multiplied by 240, which equals 36.",
      "240 का 15 प्रतिशत 0.15 गुणा 240 है, जो 36 होता है।",
      "240 चे 15 टक्के म्हणजे 0.15 गुणिले 240, म्हणजे 36.",
      "240 ના 15 ટકા એટલે 0.15 ગુણ્યા 240, એટલે 36.",
      "240-এর 15 শতাংশ হলো 0.15 গুণ 240, অর্থাৎ 36।",
      "240 இன் 15 சதவீதம் என்பது 0.15 பெருக்கல் 240, அதாவது 36."
    ),

    altText: null,
    reviewedBy: null,
  },

  {
    id: "math-002",
    exams: ["ssc-cgl-mini", "bank-po-mini", "rrb-ntpc-mini"],
    subject: "Mathematics",
    topic: "Average",
    difficulty: "easy",
    passageId: null,

    text: L(
      "What is the average of 12, 18, 24 and 30?",
      "12, 18, 24 और 30 का औसत क्या है?",
      "12, 18, 24 आणि 30 यांची सरासरी किती?",
      "12, 18, 24 અને 30 ની સરેરાશ કેટલી?",
      "12, 18, 24 এবং 30-এর গড় কত?",
      "12, 18, 24 மற்றும் 30 இன் சராசரி என்ன?"
    ),

    spoken: L(
      "Find the average of twelve, eighteen, twenty-four and thirty.",
      "बारह, अठारह, चौबीस और तीस का औसत ज्ञात करें।",
      "बारा, अठरा, चोवीस आणि तीस यांची सरासरी शोधा.",
      "બાર, અઢાર, ચોવીસ અને ત્રીસની સરેરાશ શોધો.",
      "বারো, আঠারো, চব্বিশ এবং ত্রিশের গড় নির্ণয় করুন।",
      "பன்னிரண்டு, பதினெட்டு, இருபத்திநான்கு மற்றும் முப்பது ஆகியவற்றின் சராசரியை கண்டறியவும்."
    ),

    options: L(
      ["18", "20", "21", "24"],
      ["18", "20", "21", "24"],
      ["18", "20", "21", "24"],
      ["18", "20", "21", "24"],
      ["18", "20", "21", "24"],
      ["18", "20", "21", "24"]
    ),

    answer: 2,

    explanation: L(
      "The total is 84, and 84 divided by 4 equals 21.",
      "कुल 84 है और 84 को 4 से भाग देने पर 21 मिलता है।",
      "एकूण 84 असून 84 ला 4 ने भागल्यावर 21 मिळते.",
      "કુલ 84 છે અને 84 ને 4 થી ભાગતાં 21 મળે છે.",
      "মোট 84 এবং 84-কে 4 দিয়ে ভাগ করলে 21 হয়।",
      "மொத்தம் 84; அதை 4-ஆல் வகுத்தால் 21 கிடைக்கும்."
    ),

    altText: null,
    reviewedBy: null,
  },

  {
    id: "math-003",
    exams: ["ssc-cgl-mini", "bank-po-mini", "rrb-ntpc-mini"],
    subject: "Mathematics",
    topic: "Ratio",
    difficulty: "easy",
    passageId: null,

    text: L(
      "Two numbers are in the ratio 3:5 and their total is 64. What is the smaller number?",
      "दो संख्याओं का अनुपात 3:5 है और उनका योग 64 है। छोटी संख्या क्या है?",
      "दोन संख्यांचे गुणोत्तर 3:5 आहे आणि त्यांची बेरीज 64 आहे. लहान संख्या किती?",
      "બે સંખ્યાનો ગુણોત્તર 3:5 છે અને તેમનો કુલ 64 છે. નાની સંખ્યા કઈ?",
      "দুটি সংখ্যার অনুপাত 3:5 এবং তাদের যোগফল 64। ছোট সংখ্যাটি কত?",
      "இரண்டு எண்களின் விகிதம் 3:5 மற்றும் அவற்றின் மொத்தம் 64. சிறிய எண் எது?"
    ),

    spoken: L(
      "Two numbers are in the ratio three to five. Their total is sixty-four. Find the smaller number.",
      "दो संख्याओं का अनुपात तीन अनुपात पाँच है। उनका योग चौंसठ है। छोटी संख्या बताइए।",
      "दोन संख्यांचे गुणोत्तर तीन ते पाच आहे. त्यांची बेरीज चौसष्ट आहे. लहान संख्या शोधा.",
      "બે સંખ્યાનો ગુણોત્તર ત્રણથી પાંચ છે. તેમનો કુલ ચોસઠ છે. નાની સંખ્યા શોધો.",
      "দুটি সংখ্যার অনুপাত তিন অনুপাত পাঁচ। তাদের যোগফল চৌষট্টি। ছোট সংখ্যাটি নির্ণয় করুন।",
      "இரண்டு எண்களின் விகிதம் மூன்று என்பது ஐந்து. மொத்தம் அறுபத்து நான்கு. சிறிய எண்ணைக் கண்டறியவும்."
    ),

    options: L(
      ["18", "24", "32", "40"],
      ["18", "24", "32", "40"],
      ["18", "24", "32", "40"],
      ["18", "24", "32", "40"],
      ["18", "24", "32", "40"],
      ["18", "24", "32", "40"]
    ),

    answer: 1,

    explanation: L(
      "There are 8 ratio parts, so each part is 8 and the smaller number is 3 times 8, which is 24.",
      "कुल 8 अनुपात भाग हैं, इसलिए एक भाग 8 है और छोटी संख्या 3 गुणा 8 यानी 24 है।",
      "एकूण 8 गुणोत्तर भाग आहेत, त्यामुळे प्रत्येक भाग 8 आणि लहान संख्या 3 गुणिले 8 म्हणजे 24.",
      "કુલ 8 ગુણોત્તર ભાગ છે, તેથી દરેક ભાગ 8 અને નાની સંખ્યા 3 ગુણ્યા 8 એટલે 24.",
      "মোট 8টি অনুপাত অংশ, তাই প্রতি অংশ 8 এবং ছোট সংখ্যা 3 গুণ 8 অর্থাৎ 24।",
      "மொத்தம் 8 விகிதப் பாகங்கள்; ஒரு பாகம் 8, எனவே சிறிய எண் 3 பெருக்கல் 8, அதாவது 24."
    ),

    altText: null,
    reviewedBy: null,
  },

  {
    id: "math-004",
    exams: ["ssc-cgl-mini", "bank-po-mini", "rrb-ntpc-mini"],
    subject: "Mathematics",
    topic: "Simple Interest",
    difficulty: "medium",
    passageId: null,

    text: L(
      "Find the simple interest on ₹5,000 at 8% per year for 2 years.",
      "₹5,000 पर 8% वार्षिक दर से 2 वर्षों का साधारण ब्याज ज्ञात करें।",
      "₹5,000 वर वार्षिक 8% दराने 2 वर्षांचे साधे व्याज शोधा.",
      "₹5,000 પર વાર્ષિક 8% દરે 2 વર્ષનું સાદું વ્યાજ શોધો.",
      "₹5,000 টাকার উপর বার্ষিক 8% হারে 2 বছরের সরল সুদ নির্ণয় করুন।",
      "₹5,000க்கு ஆண்டுக்கு 8% விகிதத்தில் 2 ஆண்டுகளுக்கான தனிவட்டியை கண்டறியவும்."
    ),

    spoken: L(
      "Find the simple interest on five thousand rupees at eight percent per year for two years.",
      "पाँच हजार रुपये पर आठ प्रतिशत वार्षिक दर से दो वर्षों का साधारण ब्याज कितना है?",
      "पाच हजार रुपयांवर आठ टक्के वार्षिक दराने दोन वर्षांचे साधे व्याज किती?",
      "પાંચ હજાર રૂપિયા પર આઠ ટકા વાર્ષિક દરે બે વર્ષનું સાદું વ્યાજ કેટલું?",
      "পাঁচ হাজার টাকার উপর বছরে আট শতাংশ হারে দুই বছরের সরল সুদ কত?",
      "ஐயாயிரம் ரூபாய்க்கு ஆண்டுக்கு எட்டு சதவீதத்தில் இரண்டு ஆண்டுகளுக்கான தனிவட்டி எவ்வளவு?"
    ),

    options: L(
      ["₹400", "₹600", "₹800", "₹1,000"],
      ["₹400", "₹600", "₹800", "₹1,000"],
      ["₹400", "₹600", "₹800", "₹1,000"],
      ["₹400", "₹600", "₹800", "₹1,000"],
      ["₹400", "₹600", "₹800", "₹1,000"],
      ["₹400", "₹600", "₹800", "₹1,000"]
    ),

    answer: 2,

    explanation: L(
      "Simple interest is principal times rate times time divided by 100, giving ₹800.",
      "साधारण ब्याज मूलधन गुणा दर गुणा समय भाग 100 होता है, जिससे ₹800 मिलता है।",
      "साधे व्याज म्हणजे मुद्दल गुणिले दर गुणिले वेळ भागिले 100, त्यामुळे ₹800 मिळतात.",
      "સાદું વ્યાજ એટલે મૂડી ગુણ્યા દર ગુણ્યા સમય ભાગ્યા 100, એટલે ₹800.",
      "সরল সুদ হলো মূলধন গুণ হার গুণ সময় ভাগ 100, তাই ₹800।",
      "தனிவட்டி என்பது முதல்தொகை பெருக்கல் வட்டி விகிதம் பெருக்கல் காலம் வகுத்தல் 100; எனவே ₹800."
    ),

    altText: null,
    reviewedBy: null,
  },

  // =========================================================
  // ENGLISH
  // =========================================================

  {
    id: "english-001",
    exams: ["ssc-cgl-mini", "bank-po-mini"],
    subject: "English",
    topic: "Synonyms",
    difficulty: "easy",
    passageId: null,

    text: L(
      'Choose the word closest in meaning to "brief".',
      'अंग्रेज़ी शब्द "brief" के सबसे निकट अर्थ वाला शब्द चुनें।',
      '"brief" या इंग्रजी शब्दाच्या सर्वात जवळचा अर्थ असलेला शब्द निवडा.',
      '"brief" અંગ્રેજી શબ્દના સૌથી નજીકના અર્થવાળો શબ્દ પસંદ કરો.',
      '"brief" ইংরেজি শব্দটির সবচেয়ে কাছাকাছি অর্থের শব্দটি বেছে নিন।',
      '"brief" என்ற ஆங்கிலச் சொல்லுக்கு மிக நெருக்கமான பொருளுடைய சொல்லைத் தேர்ந்தெடுக்கவும்.'
    ),

    spoken: L(
      "Choose the English word closest in meaning to brief.",
      "अंग्रेज़ी शब्द brief का सबसे निकट अर्थ वाला शब्द चुनिए।",
      "इंग्रजी शब्द brief च्या सर्वात जवळचा अर्थ असलेला शब्द निवडा.",
      "અંગ્રેજી શબ્દ brief ના સૌથી નજીકના અર્થવાળો શબ્દ પસંદ કરો.",
      "ইংরেজি শব্দ brief-এর সবচেয়ে কাছাকাছি অর্থের শব্দটি বেছে নিন।",
      "brief என்ற ஆங்கிலச் சொல்லுக்கு மிக நெருக்கமான பொருளுடைய சொல்லைத் தேர்ந்தெடுக்கவும்."
    ),

    options: L(
      ["Concise", "Ancient", "Difficult", "Careless"],
      ["Concise", "Ancient", "Difficult", "Careless"],
      ["Concise", "Ancient", "Difficult", "Careless"],
      ["Concise", "Ancient", "Difficult", "Careless"],
      ["Concise", "Ancient", "Difficult", "Careless"],
      ["Concise", "Ancient", "Difficult", "Careless"]
    ),

    answer: 0,

    explanation: L(
      '"Concise" means short and clear, which is closest to "brief".',
      '"Concise" का अर्थ छोटा और स्पष्ट होता है, जो "brief" के सबसे निकट है।',
      '"Concise" म्हणजे थोडक्यात आणि स्पष्ट, जो "brief" च्या जवळचा अर्थ आहे.',
      '"Concise" નો અર્થ ટૂંકું અને સ્પષ્ટ થાય છે, જે "brief" ના સૌથી નજીક છે.',
      '"Concise" অর্থ সংক্ষিপ্ত ও স্পষ্ট, যা "brief"-এর সবচেয়ে কাছাকাছি।',
      '"Concise" என்பது சுருக்கமாகவும் தெளிவாகவும் என்பதால் "brief" என்பதற்கு நெருக்கமான பொருள்.'
    ),

    altText: null,
    reviewedBy: null,
  },

  {
    id: "english-002",
    exams: ["ssc-cgl-mini", "bank-po-mini"],
    subject: "English",
    topic: "Antonyms",
    difficulty: "easy",
    passageId: null,

    text: L(
      'Choose the opposite of "scarce".',
      'अंग्रेज़ी शब्द "scarce" का विलोम चुनें।',
      '"scarce" या इंग्रजी शब्दाचा विरुद्धार्थी शब्द निवडा.',
      '"scarce" અંગ્રેજી શબ્દનો વિરુદ્ધ અર્થવાળો શબ્દ પસંદ કરો.',
      '"scarce" ইংরেজি শব্দটির বিপরীত শব্দ বেছে নিন।',
      '"scarce" என்ற ஆங்கிலச் சொல்லின் எதிர்ச்சொல்லைத் தேர்ந்தெடுக்கவும்.'
    ),

    spoken: L(
      "Choose the English word opposite in meaning to scarce.",
      "अंग्रेज़ी शब्द scarce का विपरीत अर्थ वाला शब्द चुनिए।",
      "इंग्रजी शब्द scarce चा विरुद्धार्थी शब्द निवडा.",
      "અંગ્રેજી શબ્દ scarce નો વિરુદ્ધ અર્થવાળો શબ્દ પસંદ કરો.",
      "ইংরেজি শব্দ scarce-এর বিপরীত অর্থের শব্দটি বেছে নিন।",
      "scarce என்ற ஆங்கிலச் சொல்லின் எதிர்ப்பொருள் கொண்ட சொல்லைத் தேர்ந்தெடுக்கவும்."
    ),

    options: L(
      ["Rare", "Limited", "Abundant", "Small"],
      ["Rare", "Limited", "Abundant", "Small"],
      ["Rare", "Limited", "Abundant", "Small"],
      ["Rare", "Limited", "Abundant", "Small"],
      ["Rare", "Limited", "Abundant", "Small"],
      ["Rare", "Limited", "Abundant", "Small"]
    ),

    answer: 2,

    explanation: L(
      '"Abundant" means available in large quantities, the opposite of "scarce".',
      '"Abundant" का अर्थ बड़ी मात्रा में उपलब्ध होना है, जो "scarce" का विपरीत है।',
      '"Abundant" म्हणजे मोठ्या प्रमाणात उपलब्ध, जो "scarce" चा विरुद्धार्थी आहे.',
      '"Abundant" એટલે મોટી માત્રામાં ઉપલબ્ધ, જે "scarce" નો વિરુદ્ધ અર્થ છે.',
      '"Abundant" অর্থ প্রচুর পরিমাণে থাকা, যা "scarce"-এর বিপরীত।',
      '"Abundant" என்பது அதிக அளவில் கிடைப்பது; இது "scarce" என்பதற்கு எதிர்ப்பொருள்.'
    ),

    altText: null,
    reviewedBy: null,
  },

  {
    id: "english-003",
    exams: ["ssc-cgl-mini", "bank-po-mini"],
    subject: "English",
    topic: "Grammar",
    difficulty: "easy",
    passageId: null,

    text: L(
      "Choose the grammatically correct English sentence.",
      "व्याकरण की दृष्टि से सही अंग्रेज़ी वाक्य चुनें।",
      "व्याकरणदृष्ट्या योग्य इंग्रजी वाक्य निवडा.",
      "વ્યાકરણ મુજબ સાચું અંગ્રેજી વાક્ય પસંદ કરો.",
      "ব্যাকরণগতভাবে সঠিক ইংরেজি বাক্যটি বেছে নিন।",
      "இலக்கணப்படி சரியான ஆங்கில வாக்கியத்தைத் தேர்ந்தெடுக்கவும்."
    ),

    spoken: L(
      "Choose the grammatically correct English sentence.",
      "व्याकरण की दृष्टि से सही अंग्रेज़ी वाक्य चुनिए।",
      "व्याकरणदृष्ट्या योग्य इंग्रजी वाक्य निवडा.",
      "વ્યાકરણ મુજબ સાચું અંગ્રેજી વાક્ય પસંદ કરો.",
      "ব্যাকরণগতভাবে সঠিক ইংরেজি বাক্যটি বেছে নিন।",
      "இலக்கணப்படி சரியான ஆங்கில வாக்கியத்தைத் தேர்ந்தெடுக்கவும்."
    ),

    options: L(
      [
        "She have lived here for five years.",
        "She has lived here for five years.",
        "She has live here for five years.",
        "She living here for five years.",
      ],
      [
        "She have lived here for five years.",
        "She has lived here for five years.",
        "She has live here for five years.",
        "She living here for five years.",
      ],
      [
        "She have lived here for five years.",
        "She has lived here for five years.",
        "She has live here for five years.",
        "She living here for five years.",
      ],
      [
        "She have lived here for five years.",
        "She has lived here for five years.",
        "She has live here for five years.",
        "She living here for five years.",
      ],
      [
        "She have lived here for five years.",
        "She has lived here for five years.",
        "She has live here for five years.",
        "She living here for five years.",
      ],
      [
        "She have lived here for five years.",
        "She has lived here for five years.",
        "She has live here for five years.",
        "She living here for five years.",
      ]
    ),

    answer: 1,

    explanation: L(
      '"She has lived here for five years" correctly uses the present perfect tense.',
      '"She has lived here for five years" में present perfect tense का सही प्रयोग हुआ है।',
      '"She has lived here for five years" या वाक्यात present perfect tense चा योग्य वापर आहे.',
      '"She has lived here for five years" માં present perfect tense નો સાચો ઉપયોગ થયો છે.',
      '"She has lived here for five years" বাক্যে present perfect tense সঠিকভাবে ব্যবহৃত হয়েছে।',
      '"She has lived here for five years" என்ற வாக்கியத்தில் present perfect tense சரியாக பயன்படுத்தப்பட்டுள்ளது.'
    ),

    altText: null,
    reviewedBy: null,
  },

  {
    id: "english-004",
    exams: ["ssc-cgl-mini", "bank-po-mini"],
    subject: "English",
    topic: "Subject Verb Agreement",
    difficulty: "medium",
    passageId: null,

    text: L(
      'Fill in the blank: "Neither the teacher nor the students ___ ready."',
      'रिक्त स्थान भरें: "Neither the teacher nor the students ___ ready."',
      'रिकामी जागा भरा: "Neither the teacher nor the students ___ ready."',
      'ખાલી જગ્યા भरो: "Neither the teacher nor the students ___ ready."',
      'শূন্যস্থান পূরণ করুন: "Neither the teacher nor the students ___ ready."',
      'காலியிடத்தை நிரப்பவும்: "Neither the teacher nor the students ___ ready."'
    ),

    spoken: L(
      "Fill in the blank. Neither the teacher nor the students blank ready.",
      "रिक्त स्थान भरिए। Neither the teacher nor the students, blank, ready.",
      "रिकामी जागा भरा. Neither the teacher nor the students, blank, ready.",
      "ખાલી જગ્યા भरो. Neither the teacher nor the students, blank, ready.",
      "শূন্যস্থান পূরণ করুন। Neither the teacher nor the students, blank, ready.",
      "காலியிடத்தை நிரப்பவும். Neither the teacher nor the students, blank, ready."
    ),

    options: L(
      ["was", "were", "is", "be"],
      ["was", "were", "is", "be"],
      ["was", "were", "is", "be"],
      ["was", "were", "is", "be"],
      ["was", "were", "is", "be"],
      ["was", "were", "is", "be"]
    ),

    answer: 1,

    explanation: L(
      'The verb agrees with the nearer subject "students", so "were" is correct.',
      'क्रिया निकट वाले subject "students" के अनुसार आती है, इसलिए "were" सही है।',
      'क्रियापद जवळच्या "students" या subject शी जुळते, म्हणून "were" योग्य आहे.',
      'ક્રિયાપદ નજીકના subject "students" સાથે મેળ ખાય છે, તેથી "were" સાચું છે.',
      'ক্রিয়াটি কাছের subject "students"-এর সঙ্গে মিলবে, তাই "were" সঠিক।',
      'வினைச்சொல் அருகிலுள்ள "students" என்ற subject-க்கு ஏற்ப வரும்; எனவே "were" சரி.'
    ),

    altText: null,
    reviewedBy: null,
  },

  // =========================================================
  // GENERAL KNOWLEDGE
  // =========================================================

  {
    id: "gk-001",
    exams: ["ssc-cgl-mini", "rrb-ntpc-mini"],
    subject: "General Knowledge",
    topic: "Science",
    difficulty: "easy",
    passageId: null,

    text: L(
      "Which is the largest planet in the Solar System?",
      "सौरमंडल का सबसे बड़ा ग्रह कौन सा है?",
      "सौरमालेतील सर्वात मोठा ग्रह कोणता?",
      "સૌરમંડળનો સૌથી મોટો ગ્રહ કયો છે?",
      "সৌরজগতের বৃহত্তম গ্রহ কোনটি?",
      "சூரியக் குடும்பத்தில் மிகப்பெரிய கோள் எது?"
    ),

    spoken: L(
      "Which planet is the largest in our Solar System?",
      "हमारे सौरमंडल का सबसे बड़ा ग्रह कौन सा है?",
      "आपल्या सौरमालेतील सर्वात मोठा ग्रह कोणता?",
      "આપણા સૌરમંડળનો સૌથી મોટો ગ્રહ કયો છે?",
      "আমাদের সৌরজগতের বৃহত্তম গ্রহ কোনটি?",
      "நமது சூரியக் குடும்பத்தில் மிகப்பெரிய கோள் எது?"
    ),

    options: L(
      ["Earth", "Mars", "Jupiter", "Venus"],
      ["पृथ्वी", "मंगल", "बृहस्पति", "शुक्र"],
      ["पृथ्वी", "मंगळ", "गुरू", "शुक्र"],
      ["પૃથ્વી", "મંગળ", "ગુરુ", "શુક્ર"],
      ["পৃথিবী", "মঙ্গল", "বৃহস্পতি", "শুক্র"],
      ["பூமி", "செவ்வாய்", "வியாழன்", "வெள்ளி"]
    ),

    answer: 2,

    explanation: L(
      "Jupiter is the largest planet in the Solar System.",
      "बृहस्पति सौरमंडल का सबसे बड़ा ग्रह है।",
      "गुरू हा सौरमालेतील सर्वात मोठा ग्रह आहे.",
      "ગુરુ સૌરમંડળનો સૌથી મોટો ગ્રહ છે.",
      "বৃহস্পতি সৌরজগতের বৃহত্তম গ্রহ।",
      "வியாழன் சூரியக் குடும்பத்தின் மிகப்பெரிய கோள்."
    ),

    altText: null,
    reviewedBy: null,
  },

  {
    id: "gk-002",
    exams: ["ssc-cgl-mini", "rrb-ntpc-mini"],
    subject: "General Knowledge",
    topic: "Physics",
    difficulty: "easy",
    passageId: null,

    text: L(
      "What is the SI unit of electric current?",
      "विद्युत धारा की SI इकाई क्या है?",
      "विद्युत प्रवाहाचे SI एकक काय आहे?",
      "વિદ્યુત પ્રવાહનું SI એકમ શું છે?",
      "তড়িৎ প্রবাহের SI একক কী?",
      "மின்னோட்டத்தின் SI அலகு எது?"
    ),

    spoken: L(
      "What is the S I unit used to measure electric current?",
      "विद्युत धारा मापने की एस आई इकाई क्या है?",
      "विद्युत प्रवाह मोजण्यासाठी एस आय एकक कोणते?",
      "વિદ્યુત પ્રવાહ માપવાનું એસ આઈ એકમ શું છે?",
      "তড়িৎ প্রবাহ মাপার এস আই একক কী?",
      "மின்னோட்டத்தை அளக்கும் எஸ் ஐ அலகு எது?"
    ),

    options: L(
      ["Volt", "Ampere", "Watt", "Ohm"],
      ["वोल्ट", "एम्पियर", "वाट", "ओम"],
      ["व्होल्ट", "अँपिअर", "वॅट", "ओम"],
      ["વોલ્ટ", "એમ્પિયર", "વોટ", "ઓમ"],
      ["ভোল্ট", "অ্যাম্পিয়ার", "ওয়াট", "ওহম"],
      ["வோல்ட்", "ஆம்பியர்", "வாட்", "ஓம்"]
    ),

    answer: 1,

    explanation: L(
      "The ampere is the SI unit of electric current.",
      "एम्पियर विद्युत धारा की SI इकाई है।",
      "अँपिअर हे विद्युत प्रवाहाचे SI एकक आहे.",
      "એમ્પિયર વિદ્યુત પ્રવાહનું SI એકમ છે.",
      "অ্যাম্পিয়ার হলো তড়িৎ প্রবাহের SI একক।",
      "ஆம்பியர் என்பது மின்னோட்டத்தின் SI அலகு."
    ),

    altText: null,
    reviewedBy: null,
  },

  {
    id: "gk-003",
    exams: ["ssc-cgl-mini", "rrb-ntpc-mini"],
    subject: "General Knowledge",
    topic: "India",
    difficulty: "easy",
    passageId: null,

    text: L(
      'Who wrote the Indian national anthem "Jana Gana Mana"?',
      'भारत के राष्ट्रगान "जन गण मन" के रचयिता कौन हैं?',
      'भारताचे राष्ट्रगीत "जन गण मन" कोणी लिहिले?',
      'ભારતનું રાષ્ટ્રગીત "જન ગણ મન" કોણે લખ્યું?',
      'ভারতের জাতীয় সংগীত "জন গণ মন" কে লিখেছিলেন?',
      'இந்திய தேசிய கீதமான "ஜன கண மன" யாரால் எழுதப்பட்டது?'
    ),

    spoken: L(
      "Who wrote India's national anthem, Jana Gana Mana?",
      "भारत का राष्ट्रगान जन गण मन किसने लिखा?",
      "भारताचे राष्ट्रगीत जन गण मन कोणी लिहिले?",
      "ભારતનું રાષ્ટ્રગીત જન ગણ મન કોણે લખ્યું?",
      "ভারতের জাতীয় সংগীত জন গণ মন কে লিখেছিলেন?",
      "இந்திய தேசிய கீதமான ஜன கண மன யாரால் எழுதப்பட்டது?"
    ),

    options: L(
      [
        "Rabindranath Tagore",
        "Bankim Chandra Chattopadhyay",
        "Sarojini Naidu",
        "Subramania Bharati",
      ],
      [
        "रवीन्द्रनाथ टैगोर",
        "बंकिम चंद्र चट्टोपाध्याय",
        "सरोजिनी नायडू",
        "सुब्रमण्यम भारती",
      ],
      [
        "रवींद्रनाथ टागोर",
        "बंकिमचंद्र चट्टोपाध्याय",
        "सरोजिनी नायडू",
        "सुब्रमण्यम भारती",
      ],
      [
        "રવીન્દ્રનાથ ટાગોર",
        "બંકિમચંદ્ર ચટ્ટોપાધ્યાય",
        "સરોજિની નાયડુ",
        "સુબ્રમણ્યમ ભારતી",
      ],
      [
        "রবীন্দ্রনাথ ঠাকুর",
        "বঙ্কিমচন্দ্র চট্টোপাধ্যায়",
        "সরোজিনী নাইডু",
        "সুব্রহ্মণ্য ভারতী",
      ],
      [
        "ரவீந்திரநாத் தாகூர்",
        "பங்கிம் சந்திர சட்டோபாத்யாய்",
        "சரோஜினி நாயுடு",
        "சுப்பிரமணிய பாரதி",
      ]
    ),

    answer: 0,

    explanation: L(
      'Rabindranath Tagore wrote "Jana Gana Mana".',
      '"जन गण मन" की रचना रवीन्द्रनाथ टैगोर ने की थी।',
      '"जन गण मन" रवींद्रनाथ टागोर यांनी लिहिले.',
      '"જન ગણ મન" રવીન્દ્રનાથ ટાગોરે લખ્યું હતું.',
      '"জন গণ মন" রবীন্দ্রনাথ ঠাকুর লিখেছিলেন।',
      '"ஜன கண மன" ரவீந்திரநாத் தாகூரால் எழுதப்பட்டது.'
    ),

    altText: null,
    reviewedBy: null,
  },

  {
    id: "gk-004",
    exams: ["ssc-cgl-mini", "rrb-ntpc-mini"],
    subject: "General Knowledge",
    topic: "Biology",
    difficulty: "easy",
    passageId: null,

    text: L(
      "Which process do green plants use to make their food?",
      "हरे पौधे अपना भोजन बनाने के लिए किस प्रक्रिया का उपयोग करते हैं?",
      "हिरव्या वनस्पती अन्न तयार करण्यासाठी कोणती प्रक्रिया वापरतात?",
      "લીલા છોડ પોતાનું ખોરાક બનાવવા માટે કઈ પ્રક્રિયાનો ઉપયોગ કરે છે?",
      "সবুজ উদ্ভিদ খাদ্য তৈরি করতে কোন প্রক্রিয়া ব্যবহার করে?",
      "பச்சைத் தாவரங்கள் தங்களது உணவை தயாரிக்க எந்த செயல்முறையைப் பயன்படுத்துகின்றன?"
    ),

    spoken: L(
      "What process allows green plants to make their own food?",
      "हरे पौधे अपना भोजन किस प्रक्रिया से बनाते हैं?",
      "हिरव्या वनस्पती स्वतःचे अन्न कोणत्या प्रक्रियेद्वारे तयार करतात?",
      "લીલા છોડ પોતાનું ખોરાક કઈ પ્રક્રિયા દ્વારા બનાવે છે?",
      "সবুজ উদ্ভিদ কোন প্রক্রিয়ায় নিজেদের খাদ্য তৈরি করে?",
      "பச்சைத் தாவரங்கள் எந்த செயல்முறையின் மூலம் தங்களது உணவை தயாரிக்கின்றன?"
    ),

    options: L(
      ["Respiration", "Photosynthesis", "Digestion", "Transpiration"],
      ["श्वसन", "प्रकाश संश्लेषण", "पाचन", "वाष्पोत्सर्जन"],
      ["श्वसन", "प्रकाशसंश्लेषण", "पचन", "बाष्पोत्सर्जन"],
      ["શ્વસન", "પ્રકાશસંશ્લેષણ", "પાચન", "વાષ્પોત્સર્જન"],
      ["শ্বসন", "সালোকসংশ্লেষণ", "পরিপাক", "বাষ্পমোচন"],
      ["சுவாசம்", "ஒளிச்சேர்க்கை", "செரிமானம்", "நீராவிப்போக்கு"]
    ),

    answer: 1,

    explanation: L(
      "Green plants make food using photosynthesis.",
      "हरे पौधे प्रकाश संश्लेषण द्वारा भोजन बनाते हैं।",
      "हिरव्या वनस्पती प्रकाशसंश्लेषणाद्वारे अन्न तयार करतात.",
      "લીલા છોડ પ્રકાશસંશ્લેષણ દ્વારા ખોરાક બનાવે છે.",
      "সবুজ উদ্ভিদ সালোকসংশ্লেষণের মাধ্যমে খাদ্য তৈরি করে।",
      "பச்சைத் தாவரங்கள் ஒளிச்சேர்க்கை மூலம் உணவை தயாரிக்கின்றன."
    ),

    altText: null,
    reviewedBy: null,
  },
];

/*
  ---------------------------------------------------------
  IMAGE ACCESSIBILITY VALIDATION
  ---------------------------------------------------------

  Current demo questions are text-only.

  Later, if a question contains:
  image
  imageUrl
  imageSrc
  OR media.type === "image"

  then altText MUST exist.

  Otherwise the question is rejected.
*/

function questionHasImage(question) {
  return Boolean(
    question.image ||
      question.imageUrl ||
      question.imageSrc ||
      question.media?.type === "image"
  );
}

function hasUsableAltText(question, language = "en-IN") {
  if (!question.altText) {
    return false;
  }

  if (typeof question.altText === "string") {
    return question.altText.trim().length > 0;
  }

  if (typeof question.altText === "object") {
    const text =
      question.altText[language] ||
      question.altText["en-IN"];

    return typeof text === "string" && text.trim().length > 0;
  }

  return false;
}

/*
  Exported so we can easily test accessibility validation.
*/
export function validateQuestion(question, language = "en-IN") {
  if (!question) {
    return {
      valid: false,
      reason: "Question is missing.",
    };
  }

  if (!question.id) {
    return {
      valid: false,
      reason: "Question was rejected because it has no id.",
    };
  }

  if (
    questionHasImage(question) &&
    !hasUsableAltText(question, language)
  ) {
    return {
      valid: false,
      reason:
        `Question "${question.id}" was rejected because it contains ` +
        "an image but does not have accessible altText.",
    };
  }

  return {
    valid: true,
    reason: null,
  };
}

/*
  Fisher-Yates shuffle.

  It works on a COPY so the original question bank
  is never reordered.
*/
function shuffleArray(items) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [
      result[j],
      result[i],
    ];
  }

  return result;
}

function resolveLanguage(language) {
  if (SUPPORTED_LANGUAGES.includes(language)) {
    return language;
  }

  return "en-IN";
}

/*
  Convert one stored multilingual question into the
  language requested by the page.

  English is always the fallback.
*/
function localizeQuestion(question, language) {
  const selectedLanguage = resolveLanguage(language);

  function pick(value) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      return (
        value[selectedLanguage] ??
        value["en-IN"] ??
        value
      );
    }

    return value;
  }

  return {
    ...question,

    text: pick(question.text),

    spoken: pick(question.spoken),

    options: pick(question.options),

    explanation: pick(question.explanation),

    altText: question.altText
      ? pick(question.altText)
      : null,

    language: question.text?.[selectedLanguage] ? selectedLanguage : "en-IN",
  };
}

/*
  =========================================================
  getQuestions()
  =========================================================

  Example:

  getQuestions({
    exam: "ssc-cgl-mini",
    subject: "Mathematics",
    topic: "Percentage",
    count: 3,
    shuffle: true,
    language: "en-IN",
  });

  Returns:

  {
    questions: [...],
    warning: null
  }

  If there are not enough questions, it returns every
  available valid question AND a warning.
*/
export function getQuestions({
  exam = null,
  subject = null,
  topic = null,
  count = null,
  shuffle = false,
  language = "en-IN",
} = {}) {
  const warnings = [];

  const selectedLanguage = resolveLanguage(language);

  if (selectedLanguage !== language) {
    warnings.push(
      `Language "${language}" is not available. English was used instead.`
    );
  }

  let matches = questionBank.filter((question) => {
    if (
      exam &&
      !question.exams.includes(exam)
    ) {
      return false;
    }

    if (
      subject &&
      question.subject !== subject
    ) {
      return false;
    }

    if (
      topic &&
      question.topic !== topic
    ) {
      return false;
    }

    return true;
  });

  /*
    Reject inaccessible image questions.
  */
  const validQuestions = [];

  for (const question of matches) {
    const validation = validateQuestion(
      question,
      selectedLanguage
    );

    if (!validation.valid) {
      warnings.push(validation.reason);
      continue;
    }

    validQuestions.push(question);
  }

  matches = validQuestions;

  if (shuffle) {
    matches = shuffleArray(matches);
  }

  if (count !== null) {
    const requestedCount = Number(count);

    if (
      !Number.isInteger(requestedCount) ||
      requestedCount < 1
    ) {
      warnings.push(
        `Invalid question count "${count}". Count must be a positive whole number.`
      );

      return {
        questions: [],
        warning: warnings.join(" "),
      };
    }

    if (matches.length < requestedCount) {
      warnings.push(
        `Not enough questions are available. ` +
          `${requestedCount} question(s) were requested, ` +
          `but only ${matches.length} valid question(s) were found.`
      );
    }

    matches = matches.slice(
      0,
      requestedCount
    );
  }

  const localizedQuestions = matches.map(
    (question) =>
      localizeQuestion(
        question,
        selectedLanguage
      )
  );

  return {
    questions: localizedQuestions,
    warning:
      warnings.length > 0
        ? warnings.join(" ")
        : null,
  };
}

/*
  Helper for multilingual section names.
*/
function getLocalizedValue(
  value,
  language
) {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return (
      value[language] ??
      value["en-IN"] ??
      ""
    );
  }

  return value;
}

/*
  =========================================================
  buildPaper()
  =========================================================

  Example:

  buildPaper(
    "ssc-cgl-mini",
    "en-IN"
  );

  It reads the required number of questions from
  examCatalog.js automatically.

  If a section needs more questions than are available,
  the available questions are still returned and a clear
  warning is included instead of crashing.
*/
export function buildPaper(
  examId,
  language = "en-IN"
) {
  const warnings = [];

  const selectedLanguage =
    resolveLanguage(language);

  if (selectedLanguage !== language) {
    warnings.push(
      `Language "${language}" is not available. English was used instead.`
    );
  }

  const exam = examCatalog.find(
    (item) => item.id === examId
  );

  if (!exam) {
    return {
      examId,
      examName: null,
      language: selectedLanguage,
      sections: [],
      questions: [],
      totalRequested: 0,
      totalReturned: 0,
      warning:
        `Exam "${examId}" was not found in examCatalog.js.`,
    };
  }

  const paperSections = [];

  for (const section of exam.sections) {
    const result = getQuestions({
      exam: examId,
      subject: section.subject,
      count: section.questions,
      shuffle: true,
      language: selectedLanguage,
    });

    const sectionName =
      getLocalizedValue(
        section.name,
        selectedLanguage
      );

    if (result.warning) {
      warnings.push(
        `${sectionName || section.subject}: ${result.warning}`
      );
    }

    paperSections.push({
      name:
        sectionName ||
        section.subject,

      subject: section.subject,

      requestedQuestions:
        section.questions,

      returnedQuestions:
        result.questions.length,

      minutes:
        section.minutes,

      marksPerQuestion:
        section.marks,

      negativeMarks:
        section.negative,

      questions:
        result.questions,
    });
  }

  const allQuestions =
    paperSections.flatMap(
      (section) =>
        section.questions
    );

  const totalRequested =
    exam.sections.reduce(
      (total, section) =>
        total + section.questions,
      0
    );

  return {
    examId: exam.id,

    examName:
      getLocalizedValue(
        exam.name,
        selectedLanguage
      ),

    language:
      selectedLanguage,

    totalMinutes:
      exam.totalMinutes,

    sectionalTiming:
      exam.sectionalTiming,

    sections:
      paperSections,

    questions:
      allQuestions,

    totalRequested,

    totalReturned:
      allQuestions.length,

    warning:
      warnings.length > 0
        ? warnings.join(" ")
        : null,
  };
}