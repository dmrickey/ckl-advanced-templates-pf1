const getToken = (itemPf) => itemPf?.parentActor?.getActiveTokens()?.[0] || undefined;

export { getToken };
