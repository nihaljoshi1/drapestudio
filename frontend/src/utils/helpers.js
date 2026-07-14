export function colourToHex(name = '') {
  const map = {
    white: '#F5F5F5', black: '#1A1A1A', ivory: '#F7F5F2',
    grey: '#9E9E9E', gray: '#9E9E9E', navy: '#1B2A4A',
    blue: '#3B6FD4', red: '#E8315A', green: '#4CAF72',
    yellow: '#F5C842', pink: '#F48FB1', brown: '#6D4C41',
    beige: '#D6C9A8', cream: '#FFF8E7', olive: '#7D8A2E',
    orange: '#E8813A', purple: '#7B4EA0', khaki: '#C3B277',
    camel: '#C19A6B', tan: '#D2B48C', rust: '#B7410E',
    teal: '#008080', mustard: '#FFDB58', coral: '#FF6B6B',
  }
  return map[name?.toLowerCase()] || '#D6D0C4'
}