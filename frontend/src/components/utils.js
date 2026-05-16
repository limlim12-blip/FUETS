export const cls = (...c) => c.filter(Boolean).join(" ");


export const makeId = (p) => `${p}${Math.random().toString(36).slice(2, 10)}`;
