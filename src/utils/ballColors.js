/**
 * Helper to get Lotto ball color class and hex color code based on official range rules
 * 1~10: Yellow (#FBC400)
 * 11~20: Blue (#69C8F2)
 * 21~30: Red (#FF7272)
 * 31~40: Gray (#AAAAAA)
 * 41~45: Green (#B0D840)
 */

export function getBallColorInfo(num) {
  const n = Number(num);
  if (n >= 1 && n <= 10) {
    return {
      className: 'ball-yellow',
      hex: '#FBC400',
      name: 'Yellow',
      bgClass: 'bg-[#FBC400]',
      textClass: 'text-slate-900',
      borderClass: 'border-[#FBC400]'
    };
  } else if (n >= 11 && n <= 20) {
    return {
      className: 'ball-blue',
      hex: '#69C8F2',
      name: 'Blue',
      bgClass: 'bg-[#69C8F2]',
      textClass: 'text-white',
      borderClass: 'border-[#69C8F2]'
    };
  } else if (n >= 21 && n <= 30) {
    return {
      className: 'ball-red',
      hex: '#FF7272',
      name: 'Red',
      bgClass: 'bg-[#FF7272]',
      textClass: 'text-white',
      borderClass: 'border-[#FF7272]'
    };
  } else if (n >= 31 && n <= 40) {
    return {
      className: 'ball-gray',
      hex: '#AAAAAA',
      name: 'Gray',
      bgClass: 'bg-[#AAAAAA]',
      textClass: 'text-white',
      borderClass: 'border-[#AAAAAA]'
    };
  } else if (n >= 41 && n <= 45) {
    return {
      className: 'ball-green',
      hex: '#B0D840',
      name: 'Green',
      bgClass: 'bg-[#B0D840]',
      textClass: 'text-white',
      borderClass: 'border-[#B0D840]'
    };
  }
  return {
    className: 'ball-gray',
    hex: '#AAAAAA',
    name: 'Gray',
    bgClass: 'bg-slate-700',
    textClass: 'text-white',
    borderClass: 'border-slate-600'
  };
}
