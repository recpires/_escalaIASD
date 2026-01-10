import { useState, useEffect } from 'react';
import { Book, X } from 'lucide-react';

const VERSES = [
  { text: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13" },
  { text: "O Senhor é o meu pastor; nada me faltará.", reference: "Salmos 23:1" },
  { text: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.", reference: "Jeremias 29:11" },
  { text: "Não temas, porque eu sou contigo; não te assombres, porque eu sou teu Deus; eu te fortaleço, e te ajudo, e te sustento com a destra da minha justiça.", reference: "Isaías 41:10" },
  { text: "Mas os que esperam no Senhor renovarão as forças, subirão com asas como águias; correrão, e não se cansarão; caminharão, e não se fatigarão.", reference: "Isaías 40:31" },
  { text: "Entrega o teu caminho ao Senhor; confia nele, e ele o fará.", reference: "Salmos 37:5" },
  { text: "E sabemos que todas as coisas contribuem juntamente para o bem daqueles que amam a Deus.", reference: "Romanos 8:28" },
  { text: "Sede fortes e corajosos; não temais, nem vos atemorizeis diante deles; porque o Senhor vosso Deus é o que vai convosco; não vos deixará nem vos desamparará.", reference: "Deuteronômio 31:6" },
  { text: "Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.", reference: "João 3:16" },
  { text: "Mil cairão ao teu lado, e dez mil à tua direita, mas não chegará a ti.", reference: "Salmos 91:7" },
  { text: "Alegrai-vos sempre no Senhor; outra vez digo, alegrai-vos.", reference: "Filipenses 4:4" },
  { text: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.", reference: "Salmos 119:105" },
  { text: "Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.", reference: "Mateus 11:28" }
];

export const BibleVerse = () => {
  const [verse, setVerse] = useState<{ text: string; reference: string } | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Select random verse on mount
    const randomIndex = Math.floor(Math.random() * VERSES.length);
    setVerse(VERSES[randomIndex]);
  }, []);

  if (!isVisible || !verse) return null;

  return (
    <div className="bg-gradient-to-r from-sda-blue to-blue-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden mb-8">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Book size={120} />
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2 text-sda-gold">
            <Book className="w-5 h-5" />
            <span className="text-sm font-semibold uppercase tracking-wider">Versículo do Dia</span>
          </div>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <blockquote className="text-xl md:text-2xl font-serif italic leading-relaxed mb-4">
          "{verse.text}"
        </blockquote>

        <p className="text-right text-sda-gold font-medium">
          — {verse.reference}
        </p>
      </div>
    </div>
  );
};
