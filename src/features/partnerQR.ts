const CITIES = [
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 
  'London', 'New York', 'Toronto'
];

export function openPartnerFinderModal(): void {
  const overlay = document.createElement('div');
  overlay.className = 'fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4';
  
  const modal = document.createElement('div');
  modal.className = 'bg-surface-base w-full max-w-sm rounded-2xl p-6 border border-theme-subtle flex flex-col gap-4 font-sans';
  
  const title = document.createElement('h2');
  title.className = 'text-xl font-display text-theme-primary';
  title.textContent = '🥢 Find a Dandiya Partner';
  
  const form = document.createElement('div');
  form.className = 'flex flex-col gap-3';
  
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.placeholder = 'Name (Optional)';
  nameInput.className = 'px-3 py-2 bg-surface-elevated border border-theme-subtle rounded-lg text-theme-primary outline-none focus:border-theme-active';
  
  const citySelect = document.createElement('select');
  citySelect.className = 'px-3 py-2 bg-surface-elevated border border-theme-subtle rounded-lg text-theme-primary outline-none focus:border-theme-active';
  CITIES.forEach(city => {
    const opt = document.createElement('option');
    opt.value = city;
    opt.textContent = city;
    citySelect.appendChild(opt);
  });
  
  const nightInput = document.createElement('input');
  nightInput.type = 'number';
  nightInput.min = '1';
  nightInput.max = '9';
  nightInput.placeholder = 'Navratri Night (1-9)';
  nightInput.className = 'px-3 py-2 bg-surface-elevated border border-theme-subtle rounded-lg text-theme-primary outline-none focus:border-theme-active';
  
  const generateBtn = document.createElement('button');
  generateBtn.className = 'bg-theme-accent text-white px-4 py-2 rounded-lg mt-2 font-medium';
  generateBtn.textContent = 'Generate Partner Code';
  
  const resultDiv = document.createElement('div');
  resultDiv.className = 'hidden flex-col gap-2 mt-4';
  
  const urlDisplay = document.createElement('p');
  urlDisplay.className = 'text-theme-accent text-lg font-bold break-all bg-surface-elevated p-3 rounded-lg border border-theme-subtle';
  
  const note = document.createElement('p');
  note.className = 'text-theme-muted text-xs';
  note.textContent = 'Share this with your WhatsApp group — someone with the same city and night will connect!';
  
  const disclaimer = document.createElement('p');
  disclaimer.className = 'text-theme-muted text-xs italic';
  disclaimer.textContent = 'GarbaWave doesn\'t store your info — this is a URL-only tool.';
  
  const actionRow = document.createElement('div');
  actionRow.className = 'flex gap-2';
  
  const copyBtn = document.createElement('button');
  copyBtn.className = 'flex-1 bg-surface-elevated border border-theme-subtle py-2 rounded-lg text-theme-primary text-sm';
  copyBtn.textContent = 'Copy';
  
  const waBtn = document.createElement('button');
  waBtn.className = 'flex-1 bg-[#25D366] text-white py-2 rounded-lg text-sm font-medium';
  waBtn.textContent = 'Share via WhatsApp';
  
  actionRow.appendChild(copyBtn);
  actionRow.appendChild(waBtn);
  
  let currentUrl = '';
  
  generateBtn.onclick = () => {
    const name = nameInput.value.trim();
    const city = citySelect.value;
    const night = nightInput.value;
    if (!night) return;
    
    const payload = btoa(JSON.stringify({ name, city, night }));
    currentUrl = window.location.origin + '#partner=' + payload;
    
    urlDisplay.textContent = currentUrl;
    resultDiv.classList.remove('hidden');
    resultDiv.classList.add('flex');
    form.classList.add('hidden');
  };
  
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy', 2000);
    });
  };
  
  waBtn.onclick = () => {
    const text = `Hey! I'm looking for a Dandiya partner for Night ${nightInput.value} in ${citySelect.value}. Join me on GarbaWave: ${currentUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'mt-4 px-4 py-2 text-theme-secondary text-sm';
  closeBtn.textContent = 'Close';
  closeBtn.onclick = () => document.body.removeChild(overlay);
  
  form.appendChild(nameInput);
  form.appendChild(citySelect);
  form.appendChild(nightInput);
  form.appendChild(generateBtn);
  
  resultDiv.appendChild(urlDisplay);
  resultDiv.appendChild(actionRow);
  resultDiv.appendChild(note);
  resultDiv.appendChild(disclaimer);
  
  modal.appendChild(title);
  modal.appendChild(form);
  modal.appendChild(resultDiv);
  modal.appendChild(closeBtn);
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}
