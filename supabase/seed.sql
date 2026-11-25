-- Demo seed data for a fresh development database only.
insert into public.resource_rooms (slug, name_ne, name_en, description_ne, icon, sort_order) values
('library','पुस्तकालय कक्ष','Library Room','पुस्तक, पत्रपत्रिका, पठन तथा पुस्तक आदानप्रदान सेवा','📚',1),
('women','महिला कक्ष','Women’s Room','महिला सशक्तीकरण, छलफल, सीप तथा सामुदायिक गतिविधि','👩',2),
('children','बाल कक्ष','Children’s Room','बालमैत्री पठन, सिर्जनात्मक सिकाइ र बाल गतिविधि','🧸',3),
('youth','युवा कक्ष','Youth Room','युवा नेतृत्व, सीप विकास, नवप्रवर्तन र सहभागिता','🌱',4),
('it','सूचना प्रविधि कक्ष','Information Technology Room','कम्प्युटर, डिजिटल साक्षरता र सूचना प्रविधि पहुँच','💻',5),
('audio-visual','श्रव्य दृश्य तथा संगीत कक्ष','Audio-Visual & Music Room','श्रव्यदृश्य सामग्री, संगीत र सिर्जनात्मक प्रस्तुति','🎧',6),
('disaster-risk','विपद जोखिम न्यूनीकरण कक्ष','Disaster Risk Reduction Room','विपद् सचेतना, तयारी, जोखिम न्यूनीकरण र सूचना','🛟',7),
('health','स्वास्थ्य कक्ष/खोप केन्द्र','Health Room / Vaccination Center','स्वास्थ्य सचेतना तथा खोपसम्बन्धी सामुदायिक सेवा','🩺',8),
('breastfeeding','स्तनपान कक्ष','Breastfeeding Room','आमा तथा शिशुका लागि सुरक्षित, सहज र गोप्य स्थान','🤱',9),
('office','कार्यालय कक्ष','Office Room','प्रशासन, अभिलेख, कर्मचारी तथा संस्थागत व्यवस्थापन','🏢',10),
('training','तालिम हल','Training Hall','तालिम, बैठक, अभिमुखीकरण र सामुदायिक कार्यक्रम','🎓',11),
('diyo','दीयो सूचना कर्नर','Diyo Information Corner','स्थानीय सूचना, उपयोगी जानकारी र समुदाय सूचना पहुँच','💡',12)
on conflict (slug) do nothing;
