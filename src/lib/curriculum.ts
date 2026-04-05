/**
 * Australian Curriculum v9 Achievement Standards
 * Used to generate syllabus-aligned report comments.
 * Organised by subject and year level.
 */

interface AchievementStandard {
  standard: string
  keyIndicators: string[]
}

const curriculum: Record<string, Record<number, AchievementStandard>> = {
  English: {
    1: {
      standard: 'Students read and view short predictable texts. They identify the main idea and some detail in texts. They use knowledge of letters, sounds and high-frequency words to read texts. They create short texts for a familiar audience, using some punctuation and common letter patterns.',
      keyIndicators: ['letter-sound knowledge', 'high-frequency word recognition', 'main idea identification', 'creating short texts', 'basic punctuation'],
    },
    2: {
      standard: 'Students read, view and comprehend texts with some unfamiliar vocabulary. They identify literal and implied meaning in texts. They create texts using appropriate word choices and simple sentences with correct punctuation. They write legibly using correct letter formation.',
      keyIndicators: ['reading comprehension', 'literal and implied meaning', 'word choice', 'sentence structure', 'punctuation', 'legible handwriting'],
    },
    3: {
      standard: 'Students understand how language features are used to link ideas. They read texts that contain varied sentence structures, some unfamiliar vocabulary and images. They create texts that demonstrate understanding of how language and images are used to communicate ideas. They use knowledge of punctuation, spelling and grammar to create texts.',
      keyIndicators: ['language features', 'varied sentence structures', 'unfamiliar vocabulary', 'text creation', 'spelling', 'grammar', 'punctuation'],
    },
    4: {
      standard: 'Students use language features to create coherence and add detail. They understand how texts vary in purpose, structure and topic. They create structured texts for a range of purposes and audiences, making language choices and using some editing processes.',
      keyIndicators: ['text structure', 'language choices', 'coherence', 'editing', 'audience awareness', 'purpose'],
    },
    5: {
      standard: 'Students explain how text structures and language features create meaning. They compare and analyse information in texts. They create structured and coherent texts for a range of purposes and audiences, selecting language features and applying editing processes.',
      keyIndicators: ['text analysis', 'comparing information', 'structured writing', 'language features', 'editing processes', 'coherent texts'],
    },
    6: {
      standard: 'Students understand how the use of text structures and language features can achieve particular effects. They analyse and explain how language features, images and vocabulary are used by different authors. They create detailed texts selecting specific vocabulary and language features to suit purpose and audience.',
      keyIndicators: ['analysing language effects', 'vocabulary selection', 'audience and purpose', 'detailed texts', 'evaluating author choices'],
    },
    7: {
      standard: 'Students understand how text structures and language features are used to influence audiences. They analyse the ways language features create meaning in texts. They create structured and coherent texts for a range of purposes and audiences, making considered vocabulary and grammar choices.',
      keyIndicators: ['audience influence', 'meaning creation', 'vocabulary and grammar choices', 'structured texts', 'analysing language features', 'coherent expression'],
    },
    8: {
      standard: 'Students explain how language features, images and vocabulary are used to represent ideas and issues. They interpret texts, questioning the reliability of sources. They create texts that respond to issues, selecting language to position audiences.',
      keyIndicators: ['representation of ideas', 'source reliability', 'positioning audiences', 'responding to issues', 'interpreting texts', 'language selection'],
    },
    9: {
      standard: 'Students analyse how authors combine language features to influence and engage audiences. They interpret, evaluate and compare information and ideas in texts. They create texts that persuade, inform and engage, using evidence to support claims and selecting language that creates tone and voice.',
      keyIndicators: ['analysing author techniques', 'evaluating texts', 'persuasive writing', 'evidence and claims', 'tone and voice', 'comparing texts'],
    },
    10: {
      standard: 'Students evaluate how text structures and language features can be used to construct representations. They develop and justify interpretations of texts. They create sustained texts that control language to achieve intended purposes and effects.',
      keyIndicators: ['evaluating representations', 'justified interpretations', 'sustained texts', 'controlled language', 'intended effects', 'critical analysis'],
    },
    11: {
      standard: 'Students analyse and evaluate how language features, stylistic choices and contexts shape meaning in literary and non-literary texts. They create sophisticated texts that sustain voice, control tone, and demonstrate command of language conventions.',
      keyIndicators: ['stylistic analysis', 'contextual understanding', 'sustained voice', 'sophisticated expression', 'language conventions', 'critical evaluation'],
    },
    12: {
      standard: 'Students critically analyse and evaluate how language, form and ideas shape meaning. They construct and justify complex interpretations using textual evidence. They create polished, sustained texts demonstrating control of language, audience and purpose.',
      keyIndicators: ['critical analysis', 'complex interpretations', 'textual evidence', 'polished expression', 'sustained argumentation', 'language mastery'],
    },
  },
  Mathematics: {
    1: {
      standard: 'Students connect number names and numerals with quantities up to 100. They partition numbers using place value. They continue and create patterns. They use familiar metric units and describe shapes and objects.',
      keyIndicators: ['number recognition to 100', 'place value', 'pattern creation', 'metric units', 'shape description'],
    },
    2: {
      standard: 'Students count to and from 1000. They perform simple addition and subtraction calculations. They recognise and represent multiplication as repeated addition. They describe and draw two-dimensional shapes and three-dimensional objects.',
      keyIndicators: ['counting to 1000', 'addition and subtraction', 'multiplication concepts', '2D and 3D shapes', 'measurement'],
    },
    3: {
      standard: 'Students recall addition and multiplication facts for single-digit numbers. They represent and solve problems involving addition and subtraction of two- and three-digit numbers. They recognise the connection between addition and subtraction, and multiplication and division.',
      keyIndicators: ['number facts', 'problem solving', 'operations connections', 'fractions', 'data representation', 'measurement'],
    },
    4: {
      standard: 'Students choose appropriate strategies for calculations involving multiplication and division. They recognise common equivalent fractions and make connections between fraction and decimal notations. They solve problems involving time duration and interpret data displays.',
      keyIndicators: ['multiplication and division strategies', 'fractions and decimals', 'time problems', 'data interpretation', 'problem solving'],
    },
    5: {
      standard: 'Students solve problems involving the four operations with whole numbers. They order, add and subtract fractions and decimals. They describe transformations and identify line and rotational symmetry. They interpret and compare data displays.',
      keyIndicators: ['four operations', 'fractions and decimals', 'transformations', 'symmetry', 'data comparison', 'problem solving'],
    },
    6: {
      standard: 'Students recognise the properties of prime, composite, square and triangular numbers. They solve problems involving all four operations with fractions, decimals, percentages and their equivalences. They connect decimal representations to the metric system.',
      keyIndicators: ['number properties', 'fractions decimals percentages', 'metric system', 'problem solving', 'algebraic thinking', 'data analysis'],
    },
    7: {
      standard: 'Students solve problems involving the order of operations, indices and integers. They make connections between whole numbers and index notation. They solve problems involving percentages and ratios. They describe relationships between variables using algebraic expressions.',
      keyIndicators: ['order of operations', 'integers', 'percentages and ratios', 'algebraic expressions', 'geometric reasoning', 'data analysis'],
    },
    8: {
      standard: 'Students solve problems involving rates and ratios. They make connections between expanding and factorising algebraic expressions. They graph linear relations and solve linear equations. They use Pythagoras\' theorem and calculate areas and volumes.',
      keyIndicators: ['rates and ratios', 'algebraic expressions', 'linear relations', 'Pythagoras\' theorem', 'area and volume', 'probability'],
    },
    9: {
      standard: 'Students solve problems involving simple interest and compound interest. They apply the index laws to numbers and algebraic expressions. They graph non-linear relations and solve problems using linear simultaneous equations. They calculate surface areas and volumes of right prisms and cylinders.',
      keyIndicators: ['financial mathematics', 'index laws', 'non-linear relations', 'simultaneous equations', 'surface area and volume', 'statistical analysis'],
    },
    10: {
      standard: 'Students expand binomial expressions and factorise monic quadratic expressions. They solve problems involving linear and quadratic equations. They use trigonometry to solve practical problems. They compare data sets by referring to the shapes of their distributions.',
      keyIndicators: ['quadratic expressions', 'trigonometry', 'probability', 'statistical analysis', 'algebraic reasoning', 'mathematical modelling'],
    },
    11: {
      standard: 'Students apply mathematical reasoning to solve problems in algebra, functions, calculus and statistics. They interpret and evaluate mathematical information in applied contexts. They use formal mathematical notation and terminology.',
      keyIndicators: ['functions and calculus', 'statistical inference', 'mathematical reasoning', 'formal notation', 'applied problem solving', 'modelling'],
    },
    12: {
      standard: 'Students solve complex problems using calculus, probability and statistics. They construct mathematical proofs and use deductive reasoning. They apply mathematical modelling to real-world scenarios and evaluate the validity of their solutions.',
      keyIndicators: ['calculus', 'mathematical proof', 'probability distributions', 'statistical analysis', 'mathematical modelling', 'deductive reasoning'],
    },
  },
  Science: {
    1: {
      standard: 'Students describe objects and events that they encounter in their everyday lives. They describe changes to objects and living things. They identify how explorations can be improved and communicate their observations.',
      keyIndicators: ['everyday observations', 'describing changes', 'living things', 'communicating findings', 'improving investigations'],
    },
    2: {
      standard: 'Students describe changes to objects, materials and living things. They identify that certain materials and resources have different uses. They use informal measurements in their explorations and record and represent observations.',
      keyIndicators: ['properties of materials', 'changes', 'living things', 'informal measurement', 'recording observations'],
    },
    3: {
      standard: 'Students use their understanding of the movement of Earth and the characteristics of living things to suggest explanations for everyday observations. They describe features common to living things. They represent data and communicate ideas.',
      keyIndicators: ['Earth and space', 'living things', 'heat and light', 'fair testing', 'data representation', 'scientific communication'],
    },
    4: {
      standard: 'Students apply their knowledge of contact and non-contact forces, properties of materials, and life cycles to suggest explanations for observations. They describe situations where science understanding can influence their own and others\' actions.',
      keyIndicators: ['forces', 'material properties', 'life cycles', 'Earth\'s surface', 'scientific influence', 'investigation planning'],
    },
    5: {
      standard: 'Students explain everyday phenomena associated with the transfer of light and the properties of materials. They describe the key features of the solar system. They analyse how living things are suited to their environment.',
      keyIndicators: ['light', 'materials', 'solar system', 'adaptations', 'environmental factors', 'scientific investigations'],
    },
    6: {
      standard: 'Students explain how changes can be classified as reversible or irreversible. They explain the role of energy in causing change. They describe how sudden geological changes and extreme weather events can affect Earth\'s surface.',
      keyIndicators: ['reversible and irreversible changes', 'energy', 'geological changes', 'growth and survival', 'scientific reasoning', 'investigation design'],
    },
    7: {
      standard: 'Students describe techniques to separate mixtures. They represent and predict the effects of unbalanced forces. They explain how the relative positions of Earth, the sun and moon affect phenomena on Earth. They classify and organise diverse organisms.',
      keyIndicators: ['mixtures and separation', 'forces', 'Earth-sun-moon system', 'classification of organisms', 'scientific method', 'data analysis'],
    },
    8: {
      standard: 'Students compare physical and chemical changes and identify energy transformations. They explain how the body coordinates its functions. They analyse the relationship between structure and function in cells. They plan investigations controlling variables.',
      keyIndicators: ['physical and chemical changes', 'energy transformations', 'body systems', 'cell biology', 'controlled experiments', 'scientific reasoning'],
    },
    9: {
      standard: 'Students explain chemical processes and natural radioactivity in terms of atoms. They describe models of energy transfer and wave behaviour. They explain how biological systems function and respond to external changes. They design investigations and analyse trends in data.',
      keyIndicators: ['atomic structure', 'chemical reactions', 'energy transfer', 'waves', 'ecosystems', 'body systems', 'experimental design', 'data analysis'],
    },
    10: {
      standard: 'Students analyse how the periodic table organises elements. They explain the concept of energy conservation and the processes of natural selection. They evaluate the validity and reliability of claims made in secondary sources. They design and improve investigations.',
      keyIndicators: ['periodic table', 'chemical reactions', 'energy conservation', 'genetics', 'natural selection', 'global systems', 'evaluating claims', 'investigation design'],
    },
    11: {
      standard: 'Students analyse and apply scientific models and theories to explain complex phenomena. They evaluate experimental methods and the reliability of data. They communicate scientific ideas using appropriate terminology and conventions.',
      keyIndicators: ['scientific models', 'experimental analysis', 'data reliability', 'scientific communication', 'complex phenomena', 'research skills'],
    },
    12: {
      standard: 'Students critically evaluate scientific claims and investigate complex questions using appropriate methodologies. They analyse interrelationships between scientific concepts and apply understanding to real-world problems.',
      keyIndicators: ['critical evaluation', 'complex investigations', 'interrelationships', 'real-world application', 'scientific methodology', 'evidence-based reasoning'],
    },
  },
  Humanities: {
    1: {
      standard: 'Students identify important dates and changes in their own lives. They identify features of familiar places and recognise why some places are important to people. They sequence events in order.',
      keyIndicators: ['personal history', 'places and spaces', 'sequencing events', 'important places', 'observation'],
    },
    2: {
      standard: 'Students identify connections between people, places and events. They describe how features of places can be represented. They recognise that the world is made up of many diverse communities.',
      keyIndicators: ['connections', 'place features', 'diverse communities', 'past and present', 'mapping skills'],
    },
    3: {
      standard: 'Students identify individuals, events and aspects of the past that have significance in the present. They identify connections between people and the characteristics of places. They recognise that places have diverse environmental and human characteristics.',
      keyIndicators: ['historical significance', 'connections', 'place characteristics', 'community diversity', 'inquiry skills'],
    },
    4: {
      standard: 'Students recognise the significance of events in bringing about change. They describe the experiences of an individual or group in the past. They identify factors that shape the environmental characteristics of places.',
      keyIndicators: ['change and continuity', 'past experiences', 'environmental factors', 'resource management', 'historical inquiry'],
    },
    5: {
      standard: 'Students describe the significance of people and events in contributing to the development of Australian society. They identify and describe the interconnections between people and the human and environmental characteristics of places.',
      keyIndicators: ['Australian society', 'significant people and events', 'interconnections', 'human and environmental geography', 'civic participation'],
    },
    6: {
      standard: 'Students explain the significance of an event or development and identify different perspectives. They describe how Australia\'s democracy and legal system shape society. They explain the interconnections between countries and the effects of trade and migration.',
      keyIndicators: ['democracy', 'perspectives', 'migration and trade', 'global connections', 'citizenship', 'evidence analysis'],
    },
    7: {
      standard: 'Students suggest reasons for change and continuity over time. They describe the effects of change on societies. They describe geographical processes that influence environments and human wellbeing. They identify the role of groups and institutions.',
      keyIndicators: ['historical change', 'cause and effect', 'geographical processes', 'human wellbeing', 'source analysis', 'inquiry methods'],
    },
    8: {
      standard: 'Students recognise and explain patterns of change and continuity over time. They explain the causes and effects of events and developments. They describe how people, places and environments are interconnected across the world.',
      keyIndicators: ['patterns of change', 'cause and effect', 'global interconnections', 'economic and business concepts', 'source evaluation', 'geographical inquiry'],
    },
    9: {
      standard: 'Students explain the significance of events, developments, periods and movements. They analyse the causes and effects of events. They evaluate the rights and responsibilities of citizens. They analyse geographical data and propose solutions to challenges.',
      keyIndicators: ['historical significance', 'causal analysis', 'rights and responsibilities', 'geographical analysis', 'evaluating sources', 'evidence-based conclusions'],
    },
    10: {
      standard: 'Students evaluate the significance of events in effecting change. They analyse and account for the different perspectives of individuals and groups. They evaluate the effectiveness of responses to national and global issues.',
      keyIndicators: ['evaluating significance', 'multiple perspectives', 'national and global issues', 'critical analysis', 'ethical reasoning', 'evidence evaluation'],
    },
  },
  'Health & Physical Education': {
    1: {
      standard: 'Students describe ways to keep healthy and safe. They identify actions that promote health, safety and wellbeing. They perform fundamental movement skills and demonstrate strategies for working cooperatively.',
      keyIndicators: ['health and safety', 'fundamental movement', 'cooperation', 'wellbeing', 'personal hygiene'],
    },
    2: {
      standard: 'Students describe changes that occur as they grow. They identify and practise emotional responses that account for their own and others\' feelings. They perform fundamental movement skills in a variety of movement sequences.',
      keyIndicators: ['growth and change', 'emotional responses', 'movement skills', 'personal identity', 'safety strategies'],
    },
    3: {
      standard: 'Students identify factors that influence their health behaviours. They describe strategies to promote health and wellbeing. They apply fundamental movement skills to modified games and activities.',
      keyIndicators: ['health behaviours', 'wellbeing strategies', 'movement skills', 'modified games', 'relationships', 'safety'],
    },
    4: {
      standard: 'Students examine the influence of physical activity on health and wellbeing. They apply strategies to manage emotions and demonstrate respect in group activities. They refine fundamental movement skills and apply them in game situations.',
      keyIndicators: ['physical activity', 'emotional management', 'respect', 'game skills', 'health influences', 'teamwork'],
    },
    5: {
      standard: 'Students investigate developmental changes and transitions. They examine how community and environmental factors influence health and wellbeing. They apply specialised movement skills and concepts of fair play.',
      keyIndicators: ['developmental changes', 'community health', 'specialised movement', 'fair play', 'decision making', 'fitness concepts'],
    },
    6: {
      standard: 'Students investigate community resources to support health and wellbeing. They examine the influence of media and peers on health decisions. They apply specialised movement skills and tactics in physical activities.',
      keyIndicators: ['community resources', 'media influence', 'peer influence', 'movement tactics', 'health decisions', 'personal fitness'],
    },
    7: {
      standard: 'Students evaluate strategies and resources to manage changes and transitions. They analyse factors that influence health, safety and wellbeing. They apply and refine movement concepts and strategies in physical activities.',
      keyIndicators: ['managing transitions', 'health analysis', 'movement strategies', 'risk assessment', 'respectful relationships', 'physical fitness'],
    },
    8: {
      standard: 'Students evaluate the impact of changes and transitions on health and wellbeing. They analyse strategies for managing personal health. They apply and transfer movement concepts and strategies across physical activities.',
      keyIndicators: ['impact analysis', 'personal health management', 'transferable movement skills', 'teamwork strategies', 'health promotion', 'physical literacy'],
    },
    9: {
      standard: 'Students critically analyse contextual factors that influence health and wellbeing. They evaluate health information and apply decision-making skills. They apply and evaluate movement concepts and strategies in challenging physical activities.',
      keyIndicators: ['critical analysis', 'health evaluation', 'decision making', 'challenging activities', 'leadership', 'advocacy'],
    },
    10: {
      standard: 'Students critically evaluate health information, products and services. They propose and evaluate responses to health issues. They design and implement strategies to promote health in their communities. They demonstrate leadership and refined movement skills.',
      keyIndicators: ['health evaluation', 'community health promotion', 'leadership', 'refined movement', 'strategic thinking', 'ethical decision making'],
    },
  },
  'The Arts': {
    1: {
      standard: 'Students describe artworks they make and view. They use the elements of arts subjects in their creative work. They share their artworks with peers and describe the ideas behind them.',
      keyIndicators: ['creative expression', 'arts elements', 'describing artworks', 'sharing ideas', 'observation'],
    },
    2: {
      standard: 'Students describe the ideas and elements in their own and others\' artworks. They use skills, techniques and processes in their creative work. They present and perform creative works to familiar audiences.',
      keyIndicators: ['skills and techniques', 'creative processes', 'performance', 'describing elements', 'audience awareness'],
    },
    3: {
      standard: 'Students describe and discuss similarities and differences between artworks. They use elements and processes to communicate ideas and intentions. They collaborate to plan and make artworks.',
      keyIndicators: ['comparing artworks', 'communicating ideas', 'collaboration', 'creative processes', 'arts vocabulary'],
    },
    4: {
      standard: 'Students describe and discuss the use of elements in artworks they make, present and view. They discuss how artworks communicate ideas and meaning. They combine elements and processes to create artworks.',
      keyIndicators: ['elements analysis', 'meaning and communication', 'creative combination', 'presentation', 'arts appreciation'],
    },
    5: {
      standard: 'Students explain how ideas are communicated in artworks they make, present and view. They describe the influences on their own and others\' artworks. They use elements, skills and processes to create artworks that communicate ideas.',
      keyIndicators: ['idea communication', 'artistic influences', 'skill development', 'creative expression', 'analysis'],
    },
    6: {
      standard: 'Students explain how elements, techniques and processes are used in artworks to communicate ideas, perspectives and meaning. They plan, create and present artworks that demonstrate developing technical skills.',
      keyIndicators: ['technical skills', 'perspectives', 'meaning making', 'planning', 'presentation', 'critical analysis'],
    },
    7: {
      standard: 'Students identify and analyse how artworks reflect and communicate ideas, beliefs and experiences. They plan and refine artworks, applying understanding of elements, skills, techniques and processes.',
      keyIndicators: ['analysis', 'beliefs and experiences', 'planning and refining', 'technical application', 'contextual understanding'],
    },
    8: {
      standard: 'Students analyse how artists use elements, skills, processes and forms to communicate ideas and intentions. They plan, develop and refine artworks that reflect their intentions and demonstrate increasing technical proficiency.',
      keyIndicators: ['artist analysis', 'intention and form', 'technical proficiency', 'development and refinement', 'creative problem solving'],
    },
    9: {
      standard: 'Students analyse and evaluate how artists communicate meaning through their artworks. They manipulate elements, skills, techniques and processes to communicate complex ideas and justify their creative decisions.',
      keyIndicators: ['evaluating meaning', 'complex ideas', 'creative decisions', 'manipulation of elements', 'justification', 'artistic voice'],
    },
    10: {
      standard: 'Students evaluate how artworks from different cultures, times and places communicate ideas, beliefs and values. They develop a body of work demonstrating a personal aesthetic, technical accomplishment and conceptual understanding.',
      keyIndicators: ['cultural analysis', 'personal aesthetic', 'technical accomplishment', 'conceptual understanding', 'body of work', 'critical evaluation'],
    },
  },
  Technologies: {
    1: {
      standard: 'Students identify how people design and produce familiar products, services and environments. They use given components and simple techniques to safely create designed solutions.',
      keyIndicators: ['design awareness', 'simple techniques', 'safety', 'creating solutions', 'familiar products'],
    },
    2: {
      standard: 'Students describe the purpose of familiar products, services and environments. They identify the features and uses of technologies. They follow simple algorithms and create designed solutions.',
      keyIndicators: ['product purpose', 'technology features', 'simple algorithms', 'designed solutions', 'following processes'],
    },
    3: {
      standard: 'Students describe how social, technical and sustainability factors influence design decisions. They generate and record design ideas using annotated drawings. They follow and describe simple algorithms.',
      keyIndicators: ['design factors', 'annotated drawings', 'algorithms', 'sustainability', 'design processes'],
    },
    4: {
      standard: 'Students explain how products, services and environments are designed to best meet needs. They develop and communicate ideas using labelled drawings. They define simple problems and design algorithms involving branching and iteration.',
      keyIndicators: ['needs-based design', 'labelled drawings', 'branching and iteration', 'problem definition', 'evaluation'],
    },
    5: {
      standard: 'Students explain how people in design and technologies occupations address competing considerations. They create designed solutions for identified needs or opportunities. They design algorithms involving branching, iteration and user input.',
      keyIndicators: ['competing considerations', 'designed solutions', 'algorithms with input', 'evaluation criteria', 'technical skills'],
    },
    6: {
      standard: 'Students explain how the features of technologies impact on designed solutions. They generate, develop and communicate design ideas and decisions. They design, modify and follow algorithms using pseudocode and visual programming.',
      keyIndicators: ['technology impact', 'design decisions', 'pseudocode', 'visual programming', 'prototyping', 'evaluation'],
    },
    7: {
      standard: 'Students analyse how food and fibre are produced and how digital systems represent data. They design solutions using design thinking processes. They implement algorithms using general-purpose programming.',
      keyIndicators: ['food and fibre systems', 'data representation', 'design thinking', 'general-purpose programming', 'project management'],
    },
    8: {
      standard: 'Students explain how force, motion and energy are used to manipulate and control electromechanical systems. They analyse designed solutions. They design and implement solutions using programming and hardware.',
      keyIndicators: ['electromechanical systems', 'force and motion', 'solution analysis', 'programming', 'hardware', 'iterative design'],
    },
    9: {
      standard: 'Students explain how sustainability considerations are made. They analyse the impact of innovations and emerging technologies. They develop, modify and communicate design ideas. They implement modular programs with defined functions.',
      keyIndicators: ['sustainability', 'innovation impact', 'modular programming', 'functions', 'design communication', 'emerging technologies'],
    },
    10: {
      standard: 'Students evaluate design and technology decisions against identified criteria. They develop criteria for success and create designed solutions. They implement programs using object-oriented approaches and evaluate their solutions.',
      keyIndicators: ['criteria evaluation', 'object-oriented programming', 'design criteria', 'solution evaluation', 'enterprise skills', 'project management'],
    },
  },
  Languages: {
    1: {
      standard: 'Students interact in the target language using formulaic expressions. They recognise and copy key words and simple phrases. They identify that language can be used differently in different situations.',
      keyIndicators: ['formulaic expressions', 'key vocabulary', 'cultural awareness', 'basic interaction', 'recognition'],
    },
    2: {
      standard: 'Students participate in guided interactions using modelled language. They recognise and reproduce familiar words and simple sentences. They identify similarities and differences between languages.',
      keyIndicators: ['guided interaction', 'modelled language', 'simple sentences', 'language comparison', 'cultural elements'],
    },
    3: {
      standard: 'Students interact in structured activities using supported language. They identify key information in simple texts. They create short texts using modelled language.',
      keyIndicators: ['structured interaction', 'key information', 'short text creation', 'modelled language', 'cultural practices'],
    },
    4: {
      standard: 'Students interact with peers and the teacher in routine exchanges. They identify specific information in texts and create short texts for familiar contexts using a range of vocabulary.',
      keyIndicators: ['routine exchanges', 'specific information', 'familiar contexts', 'vocabulary range', 'cultural understanding'],
    },
    5: {
      standard: 'Students use the target language to interact, exchange information and express feelings. They identify main ideas and supporting details in texts. They create texts using practised vocabulary and structures.',
      keyIndicators: ['information exchange', 'main ideas', 'practised structures', 'expressing feelings', 'cultural connections'],
    },
    6: {
      standard: 'Students initiate and sustain interactions using descriptive and expressive language. They interpret information from a range of texts. They create texts selecting vocabulary and structures for specific purposes.',
      keyIndicators: ['sustained interaction', 'descriptive language', 'text interpretation', 'purposeful vocabulary', 'cultural identity'],
    },
    7: {
      standard: 'Students use the target language to communicate about personal experiences and broader topics. They identify and interpret textual features. They create texts using a range of structures and vocabulary for different purposes.',
      keyIndicators: ['personal and broader topics', 'textual features', 'varied structures', 'intercultural awareness', 'communication strategies'],
    },
    8: {
      standard: 'Students interact with others to exchange ideas, experiences and opinions. They interpret and convey meaning from a range of texts. They create texts for different audiences using appropriate structures and vocabulary.',
      keyIndicators: ['exchanging opinions', 'conveying meaning', 'audience awareness', 'text creation', 'intercultural understanding'],
    },
    9: {
      standard: 'Students interact to share and justify ideas and opinions. They interpret and evaluate information from diverse texts. They create texts that reflect cultural understanding using accurate grammar and vocabulary.',
      keyIndicators: ['justifying opinions', 'evaluating information', 'cultural reflection', 'accurate grammar', 'diverse texts'],
    },
    10: {
      standard: 'Students interact to negotiate meaning and sustain conversations on a range of topics. They analyse and evaluate texts from different perspectives. They create texts for a variety of contexts demonstrating control of language structures.',
      keyIndicators: ['negotiating meaning', 'sustained conversation', 'analytical skills', 'language control', 'intercultural competence', 'varied contexts'],
    },
  },
}

export function getAchievementStandard(subject: string, yearLevel: number): AchievementStandard | null {
  // Try exact match first
  const subjectData = curriculum[subject]
  if (subjectData && subjectData[yearLevel]) {
    return subjectData[yearLevel]
  }

  // Try fuzzy match on subject name
  const key = Object.keys(curriculum).find(k =>
    k.toLowerCase().includes(subject.toLowerCase()) ||
    subject.toLowerCase().includes(k.toLowerCase())
  )
  if (key && curriculum[key][yearLevel]) {
    return curriculum[key][yearLevel]
  }

  // Map common variations
  const aliases: Record<string, string> = {
    'maths': 'Mathematics',
    'math': 'Mathematics',
    'hass': 'Humanities',
    'humanities and social sciences': 'Humanities',
    'history': 'Humanities',
    'geography': 'Humanities',
    'civics': 'Humanities',
    'economics': 'Humanities',
    'business': 'Humanities',
    'hpe': 'Health & Physical Education',
    'health': 'Health & Physical Education',
    'physical education': 'Health & Physical Education',
    'pe': 'Health & Physical Education',
    'sport': 'Health & Physical Education',
    'drama': 'The Arts',
    'music': 'The Arts',
    'visual arts': 'The Arts',
    'visual art': 'The Arts',
    'media arts': 'The Arts',
    'dance': 'The Arts',
    'art': 'The Arts',
    'digital technologies': 'Technologies',
    'design and technologies': 'Technologies',
    'design': 'Technologies',
    'ict': 'Technologies',
    'computing': 'Technologies',
    'lote': 'Languages',
    'japanese': 'Languages',
    'french': 'Languages',
    'chinese': 'Languages',
    'mandarin': 'Languages',
    'german': 'Languages',
    'italian': 'Languages',
    'spanish': 'Languages',
    'indonesian': 'Languages',
    'korean': 'Languages',
    'auslan': 'Languages',
  }

  const mapped = aliases[subject.toLowerCase()]
  if (mapped && curriculum[mapped] && curriculum[mapped][yearLevel]) {
    return curriculum[mapped][yearLevel]
  }

  // Clamp to nearest available year level
  if (key || mapped) {
    const data = curriculum[key || mapped!]
    if (data) {
      const years = Object.keys(data).map(Number).sort((a, b) => a - b)
      const closest = years.reduce((prev, curr) =>
        Math.abs(curr - yearLevel) < Math.abs(prev - yearLevel) ? curr : prev
      )
      return data[closest]
    }
  }

  return null
}

export function getCurriculumSubjects(): string[] {
  return Object.keys(curriculum)
}
