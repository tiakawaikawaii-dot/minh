import { useState } from 'react';
import { Upload, Link as LinkIcon, X } from 'lucide-react';

type Props = {
  value: string;
  onChange: (url: string) => void;
};

const avatarPresets = [
  // Women
  'https://images.pexels.com/photos/20198788/pexels-photo-20198788.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/33444227/pexels-photo-33444227.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/12695346/pexels-photo-12695346.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/20140722/pexels-photo-20140722.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/28863299/pexels-photo-28863299.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/20209273/pexels-photo-20209273.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/13007160/pexels-photo-13007160.png?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/36520899/pexels-photo-36520899.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/20747722/pexels-photo-20747722.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/37191977/pexels-photo-37191977.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/10599879/pexels-photo-10599879.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Men
  'https://images.pexels.com/photos/35964824/pexels-photo-35964824.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/36913998/pexels-photo-36913998.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/14189670/pexels-photo-14189670.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/19750575/pexels-photo-19750575.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/4079383/pexels-photo-4079383.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/7914449/pexels-photo-7914449.png?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/28002663/pexels-photo-28002663.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/32179351/pexels-photo-32179351.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/15006584/pexels-photo-15006584.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Fantasy / Warrior
  'https://images.pexels.com/photos/26178753/pexels-photo-26178753.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/37905259/pexels-photo-37905259.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/35248218/pexels-photo-35248218.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/29426270/pexels-photo-29426270.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/29440076/pexels-photo-29440076.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/13076498/pexels-photo-13076498.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Anime / Cosplay
  'https://images.pexels.com/photos/12551751/pexels-photo-12551751.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/30486833/pexels-photo-30486833.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/39285061/pexels-photo-39285061.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/19243931/pexels-photo-19243931.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/35984150/pexels-photo-35984150.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/33723456/pexels-photo-33723456.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Gothic / Dark
  'https://images.pexels.com/photos/28213236/pexels-photo-28213236.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/6061242/pexels-photo-6061242.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/28912375/pexels-photo-28912375.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/34968059/pexels-photo-34968059.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/19615531/pexels-photo-19615531.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  // Mysterious
  'https://images.pexels.com/photos/36390527/pexels-photo-36390527.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/30713510/pexels-photo-30713510.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/32730342/pexels-photo-32730342.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'https://images.pexels.com/photos/30390894/pexels-photo-30390894.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
];

const avatarLabels: Record<string, string> = {
  'https://images.pexels.com/photos/20198788/pexels-photo-20198788.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Misterio',
  'https://images.pexels.com/photos/33444227/pexels-photo-33444227.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Contemplativa',
  'https://images.pexels.com/photos/12695346/pexels-photo-12695346.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Dramatica',
  'https://images.pexels.com/photos/20140722/pexels-photo-20140722.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Sombria',
  'https://images.pexels.com/photos/28863299/pexels-photo-28863299.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Noturna',
  'https://images.pexels.com/photos/20209273/pexels-photo-20209273.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Brilhante',
  'https://images.pexels.com/photos/13007160/pexels-photo-13007160.png?auto=compress&cs=tinysrgb&h=650&w=940': 'Elegante',
  'https://images.pexels.com/photos/36520899/pexels-photo-36520899.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Sensual',
  'https://images.pexels.com/photos/20747722/pexels-photo-20747722.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Vermelho',
  'https://images.pexels.com/photos/37191977/pexels-photo-37191977.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Preto',
  'https://images.pexels.com/photos/10599879/pexels-photo-10599879.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Seda',
  'https://images.pexels.com/photos/35964824/pexels-photo-35964824.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Guerreiro',
  'https://images.pexels.com/photos/36913998/pexels-photo-36913998.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Enigma',
  'https://images.pexels.com/photos/14189670/pexels-photo-14189670.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Reflexivo',
  'https://images.pexels.com/photos/19750575/pexels-photo-19750575.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Pensador',
  'https://images.pexels.com/photos/4079383/pexels-photo-4079383.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Crepusculo',
  'https://images.pexels.com/photos/7914449/pexels-photo-7914449.png?auto=compress&cs=tinysrgb&h=650&w=940': 'Confianca',
  'https://images.pexels.com/photos/28002663/pexels-photo-28002663.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Elegante M',
  'https://images.pexels.com/photos/32179351/pexels-photo-32179351.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Traje',
  'https://images.pexels.com/photos/15006584/pexels-photo-15006584.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Azul M',
  'https://images.pexels.com/photos/26178753/pexels-photo-26178753.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Armadura',
  'https://images.pexels.com/photos/37905259/pexels-photo-37905259.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Espada',
  'https://images.pexels.com/photos/35248218/pexels-photo-35248218.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Norse',
  'https://images.pexels.com/photos/29426270/pexels-photo-29426270.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Viking',
  'https://images.pexels.com/photos/29440076/pexels-photo-29440076.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Guerreira',
  'https://images.pexels.com/photos/13076498/pexels-photo-13076498.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Medieval',
  'https://images.pexels.com/photos/12551751/pexels-photo-12551751.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Anime Azul',
  'https://images.pexels.com/photos/30486833/pexels-photo-30486833.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Anime Rosa',
  'https://images.pexels.com/photos/39285061/pexels-photo-39285061.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Cosplay 1',
  'https://images.pexels.com/photos/19243931/pexels-photo-19243931.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Cosplay 2',
  'https://images.pexels.com/photos/35984150/pexels-photo-35984150.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Anime Roxo',
  'https://images.pexels.com/photos/33723456/pexels-photo-33723456.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Anime Pink',
  'https://images.pexels.com/photos/28213236/pexels-photo-28213236.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Gotico',
  'https://images.pexels.com/photos/6061242/pexels-photo-6061242.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Dark',
  'https://images.pexels.com/photos/28912375/pexels-photo-28912375.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Fantasma',
  'https://images.pexels.com/photos/34968059/pexels-photo-34968059.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Veil',
  'https://images.pexels.com/photos/19615531/pexels-photo-19615531.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Mistico',
  'https://images.pexels.com/photos/36390527/pexels-photo-36390527.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Vermelho Sombrio',
  'https://images.pexels.com/photos/30713510/pexels-photo-30713510.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Maos',
  'https://images.pexels.com/photos/32730342/pexels-photo-32730342.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Luz',
  'https://images.pexels.com/photos/30390894/pexels-photo-30390894.jpeg?auto=compress&cs=tinysrgb&h=650&w=940': 'Fumaca',
};

export default function AvatarPicker({ value, onChange }: Props) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [tab, setTab] = useState<'presets' | 'url'>('presets');

  const handleUrlSubmit = () => {
    const url = urlInput.trim();
    if (!url) {
      setUrlError('Cole um link de imagem');
      return;
    }
    if (!url.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|avif)/i) && !url.includes('pexels.com') && !url.includes('imgur') && !url.includes('pravatar')) {
      setUrlError('Use um link direto de imagem (jpg, png, webp)');
      return;
    }
    onChange(url);
    setUrlInput('');
    setUrlError('');
    setShowUrlInput(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUrlError('Imagem muito grande (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
        setUrlError('');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <img
          src={value}
          alt="Preview"
          className="w-20 h-20 rounded-2xl object-cover border border-ink-600 flex-shrink-0"
        />
        <div className="flex-1">
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => { setTab('presets'); setShowUrlInput(false); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === 'presets' ? 'bg-brand-500/20 text-brand-400' : 'bg-ink-800 text-ink-400'
              }`}
            >
              Galeria
            </button>
            <button
              onClick={() => { setTab('url'); setShowUrlInput(!showUrlInput); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === 'url' ? 'bg-brand-500/20 text-brand-400' : 'bg-ink-800 text-ink-400'
              }`}
            >
              Link URL
            </button>
            <label className="px-3 py-1.5 rounded-lg text-xs font-medium bg-ink-800 text-ink-400 hover:text-ink-200 cursor-pointer transition-all flex items-center gap-1">
              <Upload className="w-3 h-3" />
              Upload
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-[11px] text-ink-500">
            {tab === 'presets' ? 'Escolha da galeria' : 'Cole o link de uma imagem'}
          </p>
        </div>
      </div>

      {tab === 'url' && showUrlInput && (
        <div className="flex gap-2 mb-3 animate-slide-up">
          <div className="flex-1 relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleUrlSubmit();
                }
              }}
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full pl-10 pr-3 py-2 input-field text-xs"
            />
          </div>
          <button
            onClick={handleUrlSubmit}
            className="px-3 py-2 bg-brand-500 hover:bg-brand-600 rounded-xl text-xs text-white font-medium transition-all"
          >
            Usar
          </button>
        </div>
      )}

      {urlError && (
        <p className="text-[11px] text-error-500 mb-2">{urlError}</p>
      )}

      {tab === 'presets' && (
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 -m-1">
          {avatarPresets.map((url) => (
            <button
              key={url}
              onClick={() => onChange(url)}
              title={avatarLabels[url] || ''}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-all relative group ${
                value === url ? 'border-brand-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={url} alt={avatarLabels[url] || ''} className="w-full h-full object-cover" loading="lazy" />
              {value === url && (
                <div className="absolute inset-0 bg-brand-500/20 flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                    <X className="w-3 h-3 text-white rotate-45" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
