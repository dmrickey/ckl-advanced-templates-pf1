const getToken = (itemPf) => itemPf
    ? [...canvas.scene.tokens].find(x => x.actor.id === itemPf.actor.id)?.object
    : undefined;

export default getToken;