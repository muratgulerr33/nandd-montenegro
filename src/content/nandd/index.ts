import homeData from './home.json';
import kurumsalData from './kurumsal.json';
import iletisimData from './iletisim.json';
import seafieldData from './seafield-residences.json';
import asisData from './asis-adriatic.json';

export type ContentData = typeof homeData;

export const home = homeData;
export const kurumsal = kurumsalData;
export const iletisim = iletisimData;
export const seafield = seafieldData;
export const asis = asisData;

/**
 * Şimdilik tüm locale'ler için TR içeriği döndürür.
 * İleride locale bazlı JSON eklenince genişletilebilir.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- locale ileride kullanılacak
export function getContent(locale: string): {
  home: typeof homeData;
  kurumsal: typeof kurumsalData;
  iletisim: typeof iletisimData;
  seafield: typeof seafieldData;
  asis: typeof asisData;
} {
  // Şimdilik her zaman TR içeriği döndür
  return {
    home,
    kurumsal,
    iletisim,
    seafield,
    asis,
  };
}

/**
 * WordPress göreceli path'lerini absolute URL'e çevirir.
 * wp-content/uploads/... gibi path'leri https://nanddconstruction.com/ ile birleştirir.
 */
export function toAbsoluteImageUrl(src: string): string {
  if (!src) return '';
  
  // Zaten absolute URL ise olduğu gibi döndür
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // wp-content/uploads/... gibi göreceli path'leri absolute yap
  if (src.startsWith('wp-content/') || src.startsWith('/wp-content/')) {
    const cleanPath = src.startsWith('/') ? src.slice(1) : src;
    return `https://nanddconstruction.com/${cleanPath}`;
  }
  
  // Diğer durumlarda da base URL ekle
  return `https://nanddconstruction.com/${src}`;
}

