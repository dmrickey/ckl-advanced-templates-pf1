const getToken = (itemPf) => itemPf?.actor?.getActiveTokens()?.[0] || undefined;

export { getToken };
