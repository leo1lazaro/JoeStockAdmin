export const CAPACIDADES = faixa(1, 11);
export const GRUPOS = faixa(1, 7);
export const VOTOS = faixa(0, 4);
export const CUSTOS = faixa(0, 10);

export const SEITAS = ['Anarch', 'Camarilla', 'Independent', 'Laibon', 'Sabbat'];

export const EDICOES = [
  'Ancient Hearts', 'Anarchs', 'Anarch Unbound', 'Anthology', 'Black Hand', 'Blood Shadowed Court',
  'Bloodlines', 'Camarilla Edition', 'Danse Macabre', 'Dark Sovereigns', 'Ebony Kingdom',
  'Echoes of Gehenna', 'Fall of London', 'Fifth Edition', 'Fifth Edition (Anarch)',
  'Fifth Edition (Companion)', 'Final Nights', 'First Blood', 'Gehenna', 'Heirs to the Blood', 'Jyhad',
  'Keepers of Tradition', 'Kindred Most Wanted', 'Legacies of Blood', 'Lords of the Night',
  'Lost Kindred', 'New Blood', 'New Blood II', 'New Blood III', 'Nights of Reckoning',
  'Noites Brasileiras', 'Sabbat', 'Sabbat Preconstructed', 'Sabbat V5', 'Sabbat War',
  'Secrets of New York', 'Shadows of Berlin', 'Sword of Caine', 'Tenth Anniversary', 'The Unaligned',
  'Third Edition', 'Thirtieth Anniversary', 'Twenty-Fifth Anniversary', 'Twilight Rebellion',
  'Vampire: The Eternal Struggle',
];

export const TITULOS = [
  'Primogen', 'Prince', 'Justicar', 'Inner Circle', 'Baron', 'Bishop', 'Archbishop', 'Priscus',
  'Cardinal', 'Regent', 'Magaji', '1 vote', '2 votes',
];

export const TRAITS_CRIPTA = [
  '+1 intercept', '+1 stealth', '+1 bleed', '+2 bleed', '+1 strength', '+2 strength',
  'Maneuver', 'Additional Strike', 'Aggravated', 'Prevent', 'Press', 'Enter Combat', 'Unlock',
  'Black Hand', 'Seraph', 'Infernal', 'Red List', 'Flight', 'Hand Size', 'Advancement', 'Banned', 'Not in TWD',
];

export const TRAITS_LIBRARY = [
  '+Intercept / -Stealth', '+Stealth / -Intercept', '+Bleed', '+Votes / Title', '+Strength',
  'Block Denial', 'Dodge', 'Maneuver', 'Additional Strike', 'Aggravated', 'Prevent', 'Press',
  'Combat Ends', 'Multi-Type', 'Multi-Discipline', 'Enter Combat', 'Create Vampire',
  'Blood to Uncontrolled', 'Bounce Bleed', 'Reduce Bleed', 'Wake / Unlock', 'Black Hand',
  'Seraph', 'Infernal', 'Burn Option', 'Banned', 'Not in TWD', 'No Requirement',
];

function faixa(minimo: number, maximo: number) {
  return Array.from({ length: maximo - minimo + 1 }, (_, indice) => String(minimo + indice));
}

export function combinarOpcoes(...listas: string[][]) {
  const opcoes = new Map<string, string>();
  for (const item of listas.flat()) {
    if (item.trim()) opcoes.set(item.toLocaleLowerCase('pt-BR'), item);
  }
  return [...opcoes.values()].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
}
