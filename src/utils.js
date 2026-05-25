import React from 'react';

export const DECORATIVE_FIGURES = [
    'https://pub-36abfb48eca14eb8b366a0211191ef0e.r2.dev/legacy/cafe-theater-festival-man-met-koffie-scaled.png',
    'https://pub-36abfb48eca14eb8b366a0211191ef0e.r2.dev/legacy/cafe-theater-festival-breakdancer-scaled.png',
    'https://pub-36abfb48eca14eb8b366a0211191ef0e.r2.dev/legacy/cafe-theater-festival-drag-queen-scaled.png',
    'https://pub-36abfb48eca14eb8b366a0211191ef0e.r2.dev/legacy/cafe-theater-festival-viool-speelster-scaled.png'
];

export const getRandomFigures = (seedString) => {
    let seed = 0;
    if (seedString) {
        for (let i = 0; i < seedString.length; i++) {
            seed = ((seed << 5) - seed) + seedString.charCodeAt(i);
            seed |= 0;
        }
    } else {
        seed = Math.floor(Math.random() * 10000);
    }
    const index1 = Math.abs(seed) % DECORATIVE_FIGURES.length;
    let index2 = Math.abs(seed >> 1) % DECORATIVE_FIGURES.length;
    if (index1 === index2) index2 = (index2 + 1) % DECORATIVE_FIGURES.length;
    return [DECORATIVE_FIGURES[index1], DECORATIVE_FIGURES[index2]];
};

export const parseDateForSorting = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return new Date(NaN);
  const trimmedDateString = dateString.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDateString)) {
      return new Date(trimmedDateString);
  }

  const dmyParts = trimmedDateString.split('-');
  if (dmyParts.length === 3) {
      const [d, m, y] = dmyParts;
      if (!isNaN(parseInt(d, 10)) && !isNaN(parseInt(m, 10)) && !isNaN(parseInt(y, 10))) {
          const isoFormattedString = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const date = new Date(isoFormattedString);
          if (!isNaN(date.getTime())) return date;
      }
  }

  const monthNames = {
    'januari': '01', 'jan': '01', 'februari': '02', 'feb': '02', 'maart': '03', 'mrt': '03',
    'april': '04', 'apr': '04', 'mei': '05', 'juni': '06', 'jun': '06', 'juli': '07', 'jul': '07',
    'augustus': '08', 'aug': '08', 'september': '09', 'sep': '09', 'oktober': '10', 'okt': '10',
    'november': '11', 'nov': '11', 'december': '12', 'dec': '12'
  };

  const textParts = trimmedDateString.split(' ');
  if (textParts.length === 3 && textParts[1]) {
    const day = textParts[0];
    const monthNum = monthNames[textParts[1].toLowerCase()];
    const year = textParts[2];
    if (day && monthNum && year) {
        const isoFormattedString = `${year}-${monthNum}-${String(day).padStart(2, '0')}`;
        const date = new Date(isoFormattedString);
        if (!isNaN(date.getTime())) return date;
    }
  }

  const fallbackDate = new Date(trimmedDateString);
  if (!isNaN(fallbackDate.getTime())) return fallbackDate;

  return new Date(NaN);
};

export const renderPrivacyPolicyContent = (content, textColorClass = 'text-gray-700') => {
  const lines = content.trim().split('\n');
  const elements = [];
  let currentList = [];

  const addCurrentList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className={`list-disc pl-5 mb-4 ${textColorClass}`}>
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    if (trimmedLine.match(/^\d+\.\s/)) {
      addCurrentList();
      elements.push(<h3 key={`h3-${index}`} className={`text-xl font-bold mb-2 ${textColorClass}`}>{trimmedLine}</h3>);
    } else if (trimmedLine.startsWith('- ')) {
      const listItemContent = trimmedLine.substring(2).trim();
      currentList.push(
        <li key={`li-${index}`} dangerouslySetInnerHTML={{ __html: listItemContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
      );
    } else if (trimmedLine === '') {
      addCurrentList();
    } else {
      addCurrentList();
      elements.push(
        <p key={`p-${index}`} dangerouslySetInnerHTML={{ __html: trimmedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} className={`mb-4 last:mb-0 ${textColorClass}`} />
      );
    }
  });

  addCurrentList();
  return elements;
};

export const renderGenericPopupText = (content) => {
  const lines = content.trim().split('\n\n');
  return lines.map((line, index) => (
      <p key={`p-${index}`} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} className="mb-4 last:mb-0 text-white" />
  ));
};
