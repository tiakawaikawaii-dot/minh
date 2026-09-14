import { useState } from 'react';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

type Props = {
  onVerify: () => void;
};

export default function AgeGate({ onVerify }: Props) {
  const [denied, setDenied] = useState(false);

  if (denied) {
    return (
      <div className="fixed inset-0 z-[100] bg-ink-950 flex flex-col items-center justify-center px-6 text-center">
        <AlertTriangle className="w-16 h-16 text-error-500 mb-4" />
        <h1 className="font-display font-bold text-xl text-ink-100 mb-2">Acesso restrito</h1>
        <p className="text-sm text-ink-400 max-w-xs">
          Este aplicativo é destinado apenas para maiores de 18 anos. Você pode voltar quando for maior de idade.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-ink-950 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <ShieldCheck className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="font-display font-bold text-2xl text-center text-ink-100 mb-2">
          PolyBuzz +18
        </h1>
        <p className="text-sm text-ink-400 text-center mb-6 leading-relaxed">
          Este aplicativo contem conteudo adulto, roleplay sem censura e temas maduros.
          Confirme que voce tem 18 anos ou mais para continuar.
        </p>
        <div className="space-y-3">
          <button
            onClick={onVerify}
            className="w-full py-3.5 btn-primary text-base"
          >
            Tenho 18 anos ou mais
          </button>
          <button
            onClick={() => setDenied(true)}
            className="w-full py-3.5 rounded-xl bg-ink-800 hover:bg-ink-700 text-ink-300 text-sm font-medium transition-all"
          >
            Sou menor de idade
          </button>
        </div>
        <p className="text-[11px] text-ink-500 text-center mt-6 leading-relaxed">
          Ao continuar, voce concorda que este app contem conteudo +18 sem restricoes.
          O conteudo e gerado por IA e e ficticio.
        </p>
      </div>
    </div>
  );
}
