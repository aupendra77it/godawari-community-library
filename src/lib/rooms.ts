export type Room = { id: string; name: string; english: string; description: string; icon: string; category: string };
export const rooms: Room[] = [
 {id:"library",name:"पुस्तकालय कक्ष",english:"Library Room",description:"पुस्तक, पत्रपत्रिका, पठन तथा पुस्तक आदानप्रदान सेवा",icon:"📚",category:"Learning"},
 {id:"women",name:"महिला कक्ष",english:"Women’s Room",description:"महिला सशक्तीकरण, छलफल, सीप तथा सामुदायिक गतिविधि",icon:"👩",category:"Community"},
 {id:"children",name:"बाल कक्ष",english:"Children’s Room",description:"बालमैत्री पठन, सिर्जनात्मक सिकाइ र बाल गतिविधि",icon:"🧸",category:"Learning"},
 {id:"youth",name:"युवा कक्ष",english:"Youth Room",description:"युवा नेतृत्व, सीप विकास, नवप्रवर्तन र सहभागिता",icon:"🌱",category:"Community"},
 {id:"it",name:"सूचना प्रविधि कक्ष",english:"Information Technology Room",description:"कम्प्युटर, डिजिटल साक्षरता र सूचना प्रविधि पहुँच",icon:"💻",category:"Technology"},
 {id:"audio-visual",name:"श्रव्य दृश्य तथा संगीत कक्ष",english:"Audio-Visual & Music Room",description:"श्रव्यदृश्य सामग्री, संगीत र सिर्जनात्मक प्रस्तुति",icon:"🎧",category:"Technology"},
 {id:"disaster-risk",name:"विपद जोखिम न्यूनीकरण कक्ष",english:"Disaster Risk Reduction Room",description:"विपद् सचेतना, तयारी, जोखिम न्यूनीकरण र सूचना",icon:"🛟",category:"Safety"},
 {id:"health",name:"स्वास्थ्य कक्ष/खोप केन्द्र",english:"Health Room / Vaccination Center",description:"स्वास्थ्य सचेतना तथा खोपसम्बन्धी सामुदायिक सेवा",icon:"🩺",category:"Wellbeing"},
 {id:"breastfeeding",name:"स्तनपान कक्ष",english:"Breastfeeding Room",description:"आमा तथा शिशुका लागि सुरक्षित, सहज र गोप्य स्थान",icon:"🤱",category:"Wellbeing"},
 {id:"office",name:"कार्यालय कक्ष",english:"Office Room",description:"प्रशासन, अभिलेख, कर्मचारी तथा संस्थागत व्यवस्थापन",icon:"🏢",category:"Administration"},
 {id:"training",name:"तालिम हल",english:"Training Hall",description:"तालिम, बैठक, अभिमुखीकरण र सामुदायिक कार्यक्रम",icon:"🎓",category:"Learning"},
 {id:"diyo",name:"दीयो सूचना कर्नर",english:"Diyo Information Corner",description:"स्थानीय सूचना, उपयोगी जानकारी र समुदाय सूचना पहुँच",icon:"💡",category:"Information"}
];
