const getToken = (itemPf) => itemPf?.parent?.getActiveTokens()?.[0] || undefined;

export { getToken };
