'use client';

/**
 * Piksel ve Umut - Sesli Anlatım Motoru
 * Tarayıcı üzerinden metinleri seslendiren kararlı yapı.
 */
export const speak = (text: string) => {
  if (typeof window === 'undefined') return;

  const synth = window.speechSynthesis;
  
  // Önceki seslendirmeleri durdur ki çakışma olmasın
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'tr-TR';
  utterance.rate = 0.95; // Biraz daha doğal bir hız
  utterance.pitch = 1;   // Tonlamayı dengede tutuyoruz
  
  // Sesin yüklenmesini bekle (bazı tarayıcılarda geç yüklenebilir)
  synth.speak(utterance);
};