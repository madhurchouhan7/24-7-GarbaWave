export interface DictionaryTerm {
  term: string;
  gujarati: string;
  pronunciation: string;
  definition: string;
  tip: string;
}

const terms: DictionaryTerm[] = [
  { term: 'Garba', gujarati: 'ગરબા', pronunciation: 'Gar-baa', definition: 'A traditional Gujarati dance usually performed in a circle around a central lamp or picture of Goddess Amba.', tip: 'Start with 2-tali (two claps) before moving to more complex steps.' },
  { term: 'Raas', gujarati: 'રાસ', pronunciation: 'Raas', definition: 'The energetic dance performed with sticks (dandiyas), originating from the dance of Lord Krishna and Gopis.', tip: 'Keep your wrists loose for faster spinning.' },
  { term: 'Dandiya', gujarati: 'દાંડિયા', pronunciation: 'Daan-di-ya', definition: 'The wooden or metal sticks used as props in the Raas dance.', tip: 'Hold them from the bottom for better leverage.' },
  { term: 'Taali', gujarati: 'તાળી', pronunciation: 'Taa-lee', definition: 'Clap. Forms the basis of many Garba steps like Be-Taali (two claps) and Tran-Taali (three claps).', tip: 'Clap to the beat of the dhol to stay in sync.' },
  { term: 'Dodhiya', gujarati: 'દોઢિયું', pronunciation: 'Do-dhi-yu', definition: 'A popular 1.5 beat Garba step pattern, very common in modern Navratri.', tip: 'It\'s all about the footwork and timing.' },
  { term: 'Garbi', gujarati: 'ગરબી', pronunciation: 'Gar-bee', definition: 'A wooden structure or pot with holes and a lamp inside, representing the divine feminine energy.', tip: 'Often placed in the center of the dance circle.' },
  { term: 'Mandali', gujarati: 'મંડળી', pronunciation: 'Man-da-lee', definition: 'A group of singers and musicians who perform the live Garba music.', tip: 'They set the pace—listen to their cues for tempo changes.' },
  { term: 'Navratri', gujarati: 'નવરાત્રી', pronunciation: 'Nav-raa-tree', definition: 'The nine-night festival celebrating the divine feminine, during which Garba is performed.', tip: 'Pace yourself—nine nights of dancing requires stamina!' },
  { term: 'Aarti', gujarati: 'આરતી', pronunciation: 'Aar-tee', definition: 'The devotional ritual and song performed to honor the Goddess, usually before or during a break in dancing.', tip: 'A moment of rest and devotion.' },
  { term: 'Toran', gujarati: 'તોરણ', pronunciation: 'To-ran', definition: 'A decorative door hanging, often made of marigolds or mango leaves, welcoming the Goddess.', tip: 'A sign of festivity and auspiciousness.' },
  { term: 'Ras Garba', gujarati: 'રાસ ગરબા', pronunciation: 'Raas Gar-baa', definition: 'The combined term for the whole evening\'s dance event.', tip: 'Usually starts with Garba and ends with Raas.' },
  { term: 'Sanedo', gujarati: 'સનેડો', pronunciation: 'Sa-ne-do', definition: 'A folk song genre that often involves playful, teasing lyrics and upbeat dancing.', tip: 'Get ready for high energy when this plays!' },
  { term: 'Khelaiya', gujarati: 'ખેલૈયા', pronunciation: 'Khe-lai-yaa', definition: 'The dancers or players participating in the Garba.', tip: 'That\'s you!' },
  { term: 'Fado', gujarati: 'ફાળો', pronunciation: 'Faa-do', definition: 'The contribution or donation collected for organizing the Navratri event.', tip: 'Community events rely on these.' },
  { term: 'Maa Amba', gujarati: 'માં અંબા', pronunciation: 'Maa Am-baa', definition: 'The primary Goddess worshipped during Navratri in Gujarat.', tip: 'The source of power (Shakti).' },
  { term: 'Diya', gujarati: 'દીવો', pronunciation: 'Dee-vo', definition: 'An oil lamp, often placed inside the Garbo (pot) or used during Aarti.', tip: 'Represents life and divine light.' },
  { term: 'Ghunghru', gujarati: 'ઘૂંઘરું', pronunciation: 'Ghung-hroo', definition: 'Musical anklets with metallic bells worn by dancers.', tip: 'Adds a rhythmic jingle to your steps.' },
  { term: 'Chaniya Choli', gujarati: 'ચણિયા ચોળી', pronunciation: 'Cha-ni-yaa Cho-lee', definition: 'The traditional colorful three-piece attire worn by women during Navratri.', tip: 'Mirror work makes it sparkle under the lights.' },
  { term: 'Kediyun', gujarati: 'કેડિયું', pronunciation: 'Ke-di-yun', definition: 'The traditional gathered top worn by men, often paired with kafni pajamas.', tip: 'Perfect for twirling.' },
  { term: 'Aadhya Shakti', gujarati: 'આદ્ય શક્તિ', pronunciation: 'Aad-hya Shak-tee', definition: 'The primordial cosmic energy or the Goddess herself.', tip: '"Vishvambhari Stuti" is sung in her honor.' }
];

export function getDictionaryTerms(): DictionaryTerm[] {
  return terms;
}

export function openDictionaryModal(): void {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4';
  
  const modal = document.createElement('div');
  modal.className = 'bg-surface-base w-full max-w-md max-h-[80vh] rounded-2xl p-6 border border-theme-subtle flex flex-col gap-4 font-sans overflow-hidden';
  
  const header = document.createElement('div');
  header.className = 'flex justify-between items-center shrink-0';
  
  const title = document.createElement('h2');
  title.className = 'text-xl font-display text-theme-primary';
  title.textContent = '📖 Garba Dictionary';
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'text-theme-secondary hover:text-theme-primary p-2';
  closeBtn.innerHTML = '✕'; // safe as it's static
  closeBtn.onclick = () => document.body.removeChild(overlay);
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search terms...';
  searchInput.className = 'px-3 py-2 bg-surface-elevated border border-theme-subtle rounded-lg text-theme-primary outline-none focus:border-theme-active shrink-0';
  
  const listContainer = document.createElement('div');
  listContainer.className = 'flex-1 overflow-y-auto flex flex-col gap-3 pr-2';
  
  const renderList = (filterText: string) => {
    listContainer.innerHTML = '';
    const filtered = terms.filter(t => 
      t.term.toLowerCase().includes(filterText.toLowerCase()) || 
      t.definition.toLowerCase().includes(filterText.toLowerCase())
    );
    
    filtered.forEach(t => {
      const card = document.createElement('div');
      card.className = 'bg-surface-elevated p-4 rounded-xl border border-theme-subtle flex flex-col gap-1';
      
      const termHead = document.createElement('div');
      termHead.className = 'flex items-baseline justify-between';
      
      const termName = document.createElement('h3');
      termName.className = 'text-lg font-display text-theme-primary';
      termName.textContent = t.term;
      
      const guj = document.createElement('span');
      guj.className = 'text-sm text-theme-accent';
      guj.textContent = t.gujarati;
      
      termHead.appendChild(termName);
      termHead.appendChild(guj);
      
      const pron = document.createElement('p');
      pron.className = 'text-xs text-theme-muted italic';
      pron.textContent = t.pronunciation;
      
      const def = document.createElement('p');
      def.className = 'text-sm text-theme-secondary mt-1';
      def.textContent = t.definition;
      
      const tip = document.createElement('p');
      tip.className = 'text-xs text-theme-gold mt-2 font-medium bg-theme-gold/10 inline-block px-2 py-1 rounded';
      tip.textContent = '💡 ' + t.tip;
      
      card.appendChild(termHead);
      card.appendChild(pron);
      card.appendChild(def);
      card.appendChild(tip);
      
      listContainer.appendChild(card);
    });
  };
  
  searchInput.addEventListener('input', (e) => {
    renderList((e.target as HTMLInputElement).value);
  });
  
  renderList('');
  
  modal.appendChild(header);
  modal.appendChild(searchInput);
  modal.appendChild(listContainer);
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
