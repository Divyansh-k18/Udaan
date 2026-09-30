// Original practice material. Human academic review and translations are still pending.
// English-only additions intentionally use the existing English fallback; no fabricated translations.
const allExams = ['ssc-cgl-mini', 'bank-po-mini', 'rrb-ntpc-mini'];
const englishExams = ['ssc-cgl-mini', 'bank-po-mini'];
const awarenessExams = ['ssc-cgl-mini', 'rrb-ntpc-mini'];
const questions = [];
function add(subject, topic, text, correct, distractors, explanation, difficulty = 'easy') {
  const index = questions.length;
  const options = [...distractors];
  const answer = index % 4;
  options.splice(answer, 0, String(correct));
  questions.push({
    id: `expanded-${String(index + 1).padStart(3, '0')}`,
    exams: subject === 'English' ? englishExams : subject === 'General Knowledge' ? awarenessExams : allExams,
    subject, topic, difficulty, passageId: null,
    text: { 'en-IN': text }, spoken: { 'en-IN': text },
    options: { 'en-IN': options.map(String) }, answer,
    explanation: { 'en-IN': explanation }, altText: null, reviewedBy: null,
  });
}
function rows(subject, topic, items) {
  for (const [text, correct, distractors, explanation, difficulty] of items) add(subject, topic, text, correct, distractors, explanation, difficulty);
}

// Mathematics: five worked examples per topic, including new applied topics.
for (const [base, percent] of [[240,15],[350,20],[480,25],[600,12],[750,16]]) {
  const answer = base * percent / 100;
  add('Mathematics','Percentage',`What is ${percent} percent of ${base}?`,answer,[answer+10,answer-10,answer+20],`Percent means per hundred. Multiply ${base} by ${percent}, then divide by 100: ${base} × ${percent} ÷ 100 = ${answer}.`);
}
for (const numbers of [[12,18,24],[20,25,30,35],[8,12,16,20,24],[42,48,54],[15,21,27,33]]) {
  const sum = numbers.reduce((a,b)=>a+b,0), answer = sum/numbers.length;
  add('Mathematics','Average',`Find the arithmetic mean of ${numbers.join(', ')}.`,answer,[answer+2,answer-2,answer+4],`Add all ${numbers.length} values to get ${sum}. Divide by the number of values: ${sum} ÷ ${numbers.length} = ${answer}.`);
}
for (const [a,b,total] of [[2,3,100],[3,5,160],[4,7,220],[5,6,330],[7,9,320]]) {
  const unit=total/(a+b), answer=unit*a;
  add('Mathematics','Ratio',`A total of ${total} tokens is divided between A and B in the ratio ${a} to ${b}. How many tokens does A receive?`,answer,[answer+unit,answer-unit,total],`There are ${a+b} equal parts. Each part is ${total} ÷ ${a+b} = ${unit}. A receives ${a} parts, so ${a} × ${unit} = ${answer} tokens.`);
}
for (const [principal,rate,years] of [[2000,5,3],[3000,4,2],[1500,8,2],[4000,6,3],[2500,10,2]]) {
  const answer=principal*rate*years/100;
  add('Mathematics','Simple Interest',`Find the simple interest on ${principal} rupees at ${rate} percent per year for ${years} years.`,answer,[answer+100,answer-100,principal+answer],`Simple interest = principal × annual rate × time ÷ 100. Thus ${principal} × ${rate} × ${years} ÷ 100 = ${answer} rupees. This is interest only, not the final amount.`);
}
for (const [cost,sell] of [[400,500],[600,720],[800,1000],[500,650],[1200,1320]]) {
  const profit=sell-cost, answer=profit/cost*100;
  add('Mathematics','Profit and Loss',`An item costs ${cost} rupees and sells for ${sell} rupees. What is the profit percentage on cost?`,`${answer}%`,[`${answer+5}%`,`${answer+10}%`,`${answer-5}%`],`Profit = ${sell} − ${cost} = ${profit} rupees. Profit percentage uses cost as its base: ${profit} ÷ ${cost} × 100 = ${answer} percent.`,'medium');
}
for (const [speed,hours] of [[45,3],[60,4],[35,2],[72,5],[80,3]]) {
  const answer=speed*hours;
  add('Mathematics','Speed and Distance',`A vehicle travels at a constant ${speed} kilometres per hour for ${hours} hours. How far does it travel?`,`${answer} km`,[`${answer+speed} km`,`${answer-speed} km`,`${speed+hours} km`],`Distance = speed × time. Keep hours with kilometres per hour: ${speed} × ${hours} = ${answer} kilometres.`);
}
for (const [a,b] of [[6,12],[8,24],[10,15],[12,24],[15,30]]) {
  const answer=a*b/(a+b);
  add('Mathematics','Time and Work',`A completes a job in ${a} days and B in ${b} days. At constant rates, how many days will they take working together?`,`${answer} days`,[`${a+b} days`,`${Math.min(a,b)} days`,`${answer+1} days`],`A completes 1/${a} of the job per day; B completes 1/${b}. Add their rates and invert: time = (${a} × ${b}) ÷ (${a} + ${b}) = ${answer} days.`,'medium');
}
for (const [coefficient,x,constant] of [[3,7,5],[4,6,8],[5,9,10],[6,4,12],[7,8,3]]) {
  const rhs=coefficient*x+constant;
  add('Mathematics','Algebra',`Solve for x: ${coefficient}x + ${constant} = ${rhs}.`,x,[x+1,x-1,x+2],`Subtract ${constant} from both sides: ${coefficient}x = ${rhs-constant}. Divide both sides by ${coefficient}: x = ${x}. Substitution checks the original equation.`);
}

// Reasoning: entirely textual so no diagram or colour perception is required.
rows('Reasoning','Number Series',[
 ['Find the next number: 3, 6, 12, 24, ?',48,[36,42,54],'Each number is multiplied by 2. Therefore 24 × 2 = 48.'],
 ['Find the next number: 5, 10, 17, 26, ?',37,[35,36,39],'The successive increases are 5, 7 and 9. The next increase is 11, so 26 + 11 = 37.'],
 ['Find the next number: 81, 27, 9, 3, ?',1,[0,2,6],'Divide each number by 3. Therefore 3 ÷ 3 = 1.'],
 ['Find the next number: 1, 8, 27, 64, ?',125,[100,120,144],'These are cubes: 1 cubed, 2 cubed, 3 cubed, 4 cubed. The next is 5 cubed, or 125.'],
 ['Find the next number: 4, 9, 16, 25, ?',36,[30,35,49],'These are consecutive squares from 2 squared through 5 squared. Next is 6 squared = 36.'],
]);
rows('Reasoning','Blood Relations',[
 ["Asha is Nikhil's mother. Nikhil is Tara's father. How is Asha related to Tara?",'Grandmother',['Mother','Aunt','Sister'],"Asha is the mother of Tara's father, so she is Tara's grandmother."],
 ["Rohan is Mira's brother. Mira is Neel's mother. How is Rohan related to Neel?",'Uncle',['Father','Grandfather','Cousin'],"The brother of one's mother is one's uncle."],
 ["Kiran is Dev's father. Dev is Riya's father. How is Kiran related to Riya?",'Grandfather',['Uncle','Brother','Father'],"Kiran is the father of Riya's father, so he is her grandfather."],
 ["Priya and Aman are siblings. Aman is Sia's father. How is Priya related to Sia?",'Aunt',['Mother','Grandmother','Daughter'],"Priya is the sister of Sia's father, making her Sia's aunt."],
 ["Leela is the mother of both Ravi and Sita. How is Ravi related to Sita?",'Brother',['Father','Uncle','Grandfather'],"Ravi and Sita share their mother; Ravi is Sita's brother."],
]);
for (const word of ['DOG','SUN','MAP','BOOK','FISH']) {
  const coded=[...word].map(c=>String.fromCharCode(c.charCodeAt(0)+1)).join('');
  const reverse=[...word].reverse().join('');
  add('Reasoning','Coding Decoding',`In a code, every letter is replaced by the next letter in the English alphabet. How is ${word} written?`,coded,[word,reverse,[...word].map(c=>String.fromCharCode(c.charCodeAt(0)+2)).join('')],`Shift each letter forward one place: ${[...word].map((c,i)=>`${c} becomes ${coded[i]}`).join(', ')}. The code is ${coded}.`);
}
rows('Reasoning','Direction Sense',[
 ['You face north, turn right, then turn right again. Which direction do you face?','South',['North','East','West'],'The first right turn faces east; the second faces south.'],
 ['You face east and turn left through a quarter-turn. Which direction do you face?','North',['South','East','West'],'A quarter-turn is 90 degrees. Turning left from east faces north.'],
 ['A walker moves 4 km east, then 3 km north. What is the straight-line distance from the starting point?','5 km',['7 km','1 km','12 km'],'The perpendicular legs form a right triangle. Distance = square root of (4 squared + 3 squared) = square root of 25 = 5 km.','medium'],
 ['A walker moves 6 km north, then 2 km south along the same road. Where is the walker relative to the start?','4 km north',['8 km north','4 km south','2 km north'],'Opposite movements cancel: 6 − 2 = 4 km north.'],
 ['You face west and turn left, then turn right. Which direction do you face?','West',['East','North','South'],'Left from west faces south. Right from south returns to west.'],
]);
rows('Reasoning','Analogy',[
 ['Complete the relation: Bird is to nest as bee is to ___.','Hive',['Web','Den','Burrow'],'A nest is a home for a bird; a hive is a home for bees.'],
 ['Complete the relation: Hand is to glove as foot is to ___.','Sock',['Hat','Belt','Scarf'],'A glove covers a hand; a sock covers a foot.'],
 ['Complete the relation: Author is to book as composer is to ___.','Music',['Canvas','Building','Garden'],'An author creates a book; a composer creates music.'],
 ['Complete the relation: Thermometer is to temperature as clock is to ___.','Time',['Mass','Length','Speed'],'A thermometer measures temperature; a clock measures or indicates time.'],
 ['Complete the relation: 4 is to 16 as 7 is to ___.',49,[14,21,42],'The second number is the square of the first: 4 squared = 16, so 7 squared = 49.'],
]);
rows('Reasoning','Classification',[
 ['Which item is not a unit of length?','Kilogram',['Metre','Centimetre','Kilometre'],'Kilogram measures mass. The other three units measure length.'],
 ['Which number is not prime?',21,[11,13,17],'21 = 3 × 7, so it has factors besides 1 and itself. The other numbers are prime.'],
 ['Which shape has no straight sides?','Circle',['Triangle','Square','Rectangle'],'A circle has a curved boundary. The other shapes are polygons with straight sides.'],
 ['Which word does not name a month?','Monday',['March','June','October'],'Monday is a day of the week; the other choices are months.'],
 ['Which number is not a perfect square?',45,[16,25,36],'16, 25 and 36 are the squares of 4, 5 and 6. 45 lies between 36 and 49.'],
]);
for (const [total,position] of [[20,6],[30,12],[40,9],[25,7],[50,18]]) {
  const answer=total-position+1;
  add('Reasoning','Ranking',`In a row of ${total} students, Anu is ${position}th from the left. What is her position from the right?`,answer,[answer-1,answer+1,total-position-1],`The two ranks count Anu twice. Right rank = total − left rank + 1 = ${total} − ${position} + 1 = ${answer}.`);
}
rows('Reasoning','Syllogisms',[
 ['All roses are flowers. All flowers are plants. Which conclusion must follow?','All roses are plants',['All plants are roses','All flowers are roses','No roses are plants'],'Every rose belongs to the flower group, which is entirely within the plant group. The converse statements do not follow.'],
 ['All pencils are tools. Some tools are blue. Must some pencils be blue?','Cannot be determined',['Yes, always','No pencil can be blue','All tools are pencils'],'The blue tools might include pencils or might be other tools. No overlap with pencils is guaranteed.','medium'],
 ['No fish are birds. All sparrows are birds. Which conclusion must follow?','No sparrows are fish',['All sparrows are fish','Some fish are sparrows','All birds are sparrows'],'Sparrows lie inside the bird group, and the bird and fish groups do not overlap.'],
 ['Some artists are teachers. All teachers are readers. Which conclusion must follow?','Some artists are readers',['All artists are readers','All readers are teachers','No artists are readers'],'The artists who are teachers must also be readers. This says nothing about every artist.'],
 ['All apples are fruits. No fruits are stones. Which conclusion must follow?','No apples are stones',['All stones are apples','Some apples are stones','All fruits are apples'],'Apples are within the fruit group. Since fruits and stones do not overlap, apples cannot be stones.'],
]);

rows('English','Synonyms',[
 ['Choose the word closest in meaning to "rapid".','Quick',['Late','Weak','Quiet'],'Rapid means fast or quick.'],
 ['Choose the word closest in meaning to "assist".','Help',['Hide','Refuse','Forget'],'To assist is to help someone do something.'],
 ['Choose the word closest in meaning to "ancient".','Very old',['Modern','Brief','New'],'Ancient describes something from a very long time ago.'],
 ['Choose the word closest in meaning to "calm".','Peaceful',['Noisy','Angry','Restless'],'Calm describes a peaceful, untroubled state.'],
 ['Choose the word closest in meaning to "accurate".','Correct',['Careless','Rough','Uncertain'],'Accurate information or work is correct and precise.'],
]);
rows('English','Antonyms',[
 ['Choose the opposite of "expand".','Contract',['Increase','Extend','Enlarge'],'Expand means grow larger; contract means become smaller.'],
 ['Choose the opposite of "generous".','Stingy',['Kind','Helpful','Giving'],'Generous means willing to give; stingy means unwilling to give or spend.'],
 ['Choose the opposite of "victory".','Defeat',['Success','Triumph','Achievement'],'Victory is winning; defeat is losing.'],
 ['Choose the opposite of "temporary".','Permanent',['Brief','Short-lived','Passing'],'Temporary lasts for a limited time; permanent is intended to last.'],
 ['Choose the opposite of "include".','Exclude',['Add','Contain','Involve'],'To include is to make part of something; to exclude is to leave out.'],
]);
rows('English','Grammar',[
 ['Choose the correct article: She carried ___ umbrella.','an',['a','the only','no'],'Use an before a vowel sound. Umbrella begins with a vowel sound.'],
 ['Choose the correct past tense: Yesterday, they ___ to school.','went',['go','going','gone'],'Went is the simple past tense of go. Yesterday signals a completed past action.'],
 ['Choose the correct comparison: This road is ___ than that one.','wider',['widest','wide','most wide'],'Than calls for a comparative form. The comparative of wide is wider.'],
 ['Choose the correct pronoun: Ravi and ___ completed the task.','I',['me','my','mine'],'The pronoun is part of the subject, so use I. You would say I completed the task.'],
 ['Choose the correct passive form of "The chef cooked the meal."','The meal was cooked by the chef.',['The meal is cook by the chef.','The meal cooked by the chef.','The meal has cook by the chef.'],'The simple past passive uses was or were plus a past participle: was cooked.','medium'],
]);
rows('English','Subject Verb Agreement',[
 ['Choose the correct verb: Each of the students ___ a notebook.','has',['have','are','were'],'Each is singular, so the verb is has. The plural word students does not change the subject.'],
 ['Choose the correct verb: The books on the shelf ___ new.','are',['is','was','has'],'The subject books is plural, so use are.'],
 ['Choose the correct verb: My brother ___ football every Sunday.','plays',['play','playing','are playing'],'A singular third-person subject takes plays in the simple present.'],
 ['Choose the correct verb: Neither answer ___ correct.','is',['are','were','have'],'Neither answer is singular in this sentence, so use is.'],
 ['Choose the correct verb: The teacher and the student ___ ready.','are',['is','has','was'],'Two distinct people joined by and form a plural subject, so use are.'],
]);
rows('English','Prepositions',[
 ['Fill the blank: The class begins ___ 9 a.m.','at',['on','in','by way of'],'Use at for a specific clock time.'],
 ['Fill the blank: We have a test ___ Monday.','on',['at','in','under'],'Use on for a named day.'],
 ['Fill the blank: She has lived here ___ 2020.','since',['for','during','by'],'Since introduces the starting point of a period continuing to the present.'],
 ['Fill the blank: He waited ___ two hours.','for',['since','at','on'],'For introduces a duration, such as two hours.'],
 ['Fill the blank: Divide the sweets equally ___ the two children.','between',['among','across','through'],'Between is the appropriate preposition for sharing between two identified people.'],
]);
rows('English','Spelling',[
 ['Choose the correctly spelled word.','Necessary',['Neccessary','Necesary','Necessery'],'Necessary has one c and two s letters.'],
 ['Choose the correctly spelled word.','Separate',['Seperate','Seperete','Separete'],'Separate uses a after the p: sep-a-rate.'],
 ['Choose the correctly spelled word.','Receive',['Recieve','Receeve','Receve'],'Receive is spelled r-e-c-e-i-v-e.'],
 ['Choose the correctly spelled word.','Environment',['Enviroment','Environmant','Envirnoment'],'Environment includes the n before ment: environ-ment.'],
 ['Choose the correctly spelled word.','Accommodation',['Accomodation','Acommodation','Acomodation'],'Accommodation contains double c and double m.'],
]);
rows('English','Idioms',[
 ['What does "a piece of cake" mean when describing a task?','An easy task',['An expensive task','A delayed task','A dangerous task'],'The idiom describes something easy to do; it does not literally refer to food.'],
 ['What does "break the ice" mean in a social situation?','Start friendly interaction',['End a friendship','Create confusion','Avoid conversation'],'To break the ice is to reduce initial awkwardness and help people begin talking.'],
 ['What does "once in a blue moon" mean?','Very rarely',['Every day','Immediately','Very loudly'],'The idiom refers to an event that occurs very rarely.'],
 ['What does "under the weather" mean?','Feeling unwell',['Standing outside','Feeling wealthy','Being late'],'Under the weather means feeling ill or not in good health.'],
 ['What does "hit the nail on the head" mean?','Say exactly the right thing',['Miss the main point','Speak too softly','Avoid an answer'],'The idiom means identifying or expressing something accurately.'],
]);
rows('English','Reading Comprehension',[
 ['Read: "Nila walks to the library every Saturday. She borrows two books and returns them the following week." When does Nila visit the library?','Every Saturday',['Every Monday','Every evening','Once a month'],'The first sentence explicitly states that Nila walks to the library every Saturday.'],
 ['Read: "The school garden dried out during the holidays. On reopening, the students watered it daily, and the plants recovered." What helped the plants recover?','Daily watering',['Less sunlight','Closing the school','Removing the soil'],'The passage links the recovery to the students watering the garden daily.'],
 ['Read: "A bus was delayed by heavy rain. Omar called his teacher to explain that he would arrive late." Why would Omar arrive late?','His bus was delayed by rain',['He forgot his books','He missed an alarm','His teacher cancelled class'],'The stated cause is the rain-related bus delay. The other causes are not given.'],
 ['Read: "The club repaired old bicycles instead of discarding them. This saved money and reduced waste." Which two benefits are mentioned?','Saving money and reducing waste',['Higher prices and more waste','Faster travel and better roads','More storage and new bicycles'],'Both saving money and reducing waste are explicitly stated. Do not infer benefits that the passage does not mention.'],
 ['Read: "Maya practised typing for ten minutes each day. After a month, she made fewer errors, although her speed stayed the same." What improved?','Her accuracy',['Her speed','Her eyesight','Her handwriting'],'Fewer typing errors indicate improved accuracy. The passage specifically says her speed did not change.'],
]);

rows('General Knowledge','Science',[
 ['Which gas do green plants absorb during photosynthesis?','Carbon dioxide',['Helium','Hydrogen','Neon'],'Plants use carbon dioxide and water, with light energy, to make sugars during photosynthesis.'],
 ['What is the chemical formula of water?','H2O',['CO2','O2','NaCl'],'A water molecule contains two hydrogen atoms and one oxygen atom, represented by H2O.'],
 ['Which process changes a liquid into a gas at its surface?','Evaporation',['Freezing','Condensation','Melting'],'Evaporation occurs when particles escape from a liquid surface into the gas phase.'],
 ['Which substance is a mixture?','Air',['Pure gold','Pure oxygen','Distilled water'],'Air is a mixture of gases, mainly nitrogen and oxygen. The other choices are pure substances as specified.'],
 ['Which particle has a negative electric charge?','Electron',['Proton','Neutron','Neutral atom'],'An electron has a negative charge. A proton is positive and a neutron has no net electric charge.'],
]);
rows('General Knowledge','Physics',[
 ['What is the SI unit of force?','Newton',['Joule','Watt','Pascal'],'Force is measured in newtons. A newton is the force required to accelerate one kilogram at one metre per second squared.'],
 ['Which instrument measures electric current?','Ammeter',['Voltmeter','Barometer','Thermometer'],'An ammeter measures current. A voltmeter measures potential difference.'],
 ['Sound cannot travel through which of these?','A vacuum',['Air','Water','Steel'],'Sound is a mechanical wave and needs a material medium. A vacuum contains no medium to carry it.'],
 ['Which device converts electrical energy mainly into mechanical rotation?','Electric motor',['Electric heater','Battery charger','Solar cell'],'An electric motor converts electrical energy into mechanical motion, often rotation.'],
 ['What happens to the speed of an object moving at constant velocity?','It remains constant',['It must increase','It must decrease','It becomes zero'],'Velocity includes speed and direction. If velocity is constant, speed is constant too.'],
]);
rows('General Knowledge','India',[
 ['Which city is the capital of India?','New Delhi',['Mumbai','Kolkata','Chennai'],'New Delhi is the capital of India.'],
 ['Which ocean lies to the south of India?','Indian Ocean',['Arctic Ocean','Atlantic Ocean','Southern Ocean'],'India projects southward into the Indian Ocean, with the Arabian Sea to the west and Bay of Bengal to the east.'],
 ['In which Indian city is the Gateway of India monument?','Mumbai',['Jaipur','Agra','Patna'],'The Gateway of India stands on the waterfront in Mumbai.'],
 ['Which mountain range lies along much of northern India?','Himalayas',['Andes','Alps','Rockies'],'The Himalayas extend along the northern part of the Indian subcontinent.'],
 ['Which Indian state is associated with the classical dance Bharatanatyam?','Tamil Nadu',['Punjab','Assam','Gujarat'],'Bharatanatyam is a classical dance tradition associated with Tamil Nadu.'],
]);
rows('General Knowledge','Biology',[
 ['Which organ pumps blood around the human body?','Heart',['Liver','Stomach','Kidney'],'The heart contracts to pump blood through the circulatory system.'],
 ['Which part of a plant usually absorbs water from the soil?','Roots',['Flowers','Fruits','Petals'],'Roots, especially root hairs, absorb water and dissolved minerals from the soil.'],
 ['Which component of blood mainly carries oxygen?','Red blood cells',['Platelets','Plasma proteins','White blood cells'],'Red blood cells contain haemoglobin, which binds and carries oxygen.'],
 ['What is the basic structural and functional unit of living organisms?','Cell',['Organ','Tissue','Skeleton'],'Cells are the basic units of life. Tissues and organs are made of cells.'],
 ['Which organ is primarily used for gas exchange in humans?','Lungs',['Stomach','Pancreas','Bladder'],'Gas exchange occurs across the tiny air sacs in the lungs, where oxygen enters blood and carbon dioxide leaves it.'],
]);
rows('General Knowledge','Geography',[
 ['Which is the largest ocean on Earth?','Pacific Ocean',['Atlantic Ocean','Indian Ocean','Arctic Ocean'],'The Pacific has the greatest surface area of the oceans.'],
 ['Which imaginary line divides Earth into Northern and Southern Hemispheres?','Equator',['Prime Meridian','Tropic of Cancer','Arctic Circle'],'The Equator is at zero degrees latitude and divides the Northern and Southern Hemispheres.'],
 ['On which continent is the Sahara Desert?','Africa',['Asia','Europe','South America'],'The Sahara occupies a large part of North Africa.'],
 ['Which direction does a compass north-seeking end generally indicate?','Magnetic north',['Geographic south','East','West'],'The north-seeking end aligns approximately with the local magnetic field toward magnetic north, which differs from geographic north.'],
 ['Which landform is surrounded by water on all sides?','Island',['Peninsula','Valley','Plateau'],'An island is land surrounded by water. A peninsula remains connected to a larger landmass.'],
]);
rows('General Knowledge','History',[
 ['In which year did India gain independence from British rule?',1947,[1945,1950,1930],'India became independent on 15 August 1947.'],
 ['Who led the Salt March to Dandi in 1930?','Mahatma Gandhi',['Jawaharlal Nehru','Subhas Chandra Bose','Bhagat Singh'],'Gandhi led the march to Dandi as a protest against the British salt tax.'],
 ['Which Mughal emperor commissioned the Taj Mahal?','Shah Jahan',['Akbar','Babur','Humayun'],'Shah Jahan commissioned the Taj Mahal in memory of Mumtaz Mahal.'],
 ['Which ancient civilization is associated with Harappa and Mohenjo-daro?','Indus Valley Civilization',['Roman civilization','Maya civilization','Inca civilization'],'Harappa and Mohenjo-daro were major urban centres of the Indus Valley Civilization.'],
 ['Who was the first President of independent India?','Rajendra Prasad',['Sardar Patel','Sarvepalli Radhakrishnan','Zakir Husain'],'Rajendra Prasad became the first President of the Republic of India in 1950.'],
]);
rows('General Knowledge','Computers',[
 ['What does CPU stand for?','Central Processing Unit',['Computer Power Utility','Central Print Unit','Control Program User'],'The CPU executes program instructions and performs core processing operations.'],
 ['Which of these is an input device?','Keyboard',['Monitor','Speaker','Printer'],'A keyboard sends user input to a computer; the other choices primarily provide output.'],
 ['What is the main purpose of a web browser?','Access and display web pages',['Supply electric power','Print every file automatically','Replace physical memory'],'A browser requests and displays web content such as text, links and multimedia.'],
 ['Which memory normally loses its contents when power is switched off?','RAM',['Read-only optical disc','Hard disk','USB flash drive'],'Ordinary RAM is volatile: it needs power to retain data. The other storage types are nonvolatile.'],
 ['Which tool reads on-screen text aloud for a user?','Screen reader',['Spreadsheet formula','File compressor','Disk formatter'],'A screen reader presents interface information through speech or a braille display. Accessible structure helps it interpret content.'],
]);
rows('General Knowledge','Environment',[
 ['Which energy source is renewable?','Sunlight',['Coal','Petroleum','Natural gas'],'Sunlight is replenished naturally; the other options are finite fossil fuels.'],
 ['What does recycling mainly involve?','Processing waste into usable materials',['Burning all waste','Mixing all waste with soil','Discarding usable products'],'Recycling recovers materials from waste so they can be used again.'],
 ['Which practice helps reduce water use?','Repairing leaking taps',['Leaving taps running','Washing a single item repeatedly','Ignoring leaking pipes'],'Repairing leaks prevents continuous avoidable water loss.'],
 ['What is biodiversity?','The variety of living organisms',['Only the number of trees','Only rainfall levels','The amount of plastic waste'],'Biodiversity includes variety within species, between species and across ecosystems.'],
 ['Which gas is a greenhouse gas?','Carbon dioxide',['Helium','Neon','Argon'],'Carbon dioxide absorbs infrared radiation and contributes to the greenhouse effect.'],
]);

export const expandedQuestions = questions;

