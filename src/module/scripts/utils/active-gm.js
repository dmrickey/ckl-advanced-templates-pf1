const getFirstActiveGM = () => pf1.utils.getFirstActiveGM();
const isFirstGM = () => getFirstActiveGM() === game.user;
const isOwnerWithoutGm = (userId) => game.user.id === userId;
const handleSingleOwner = (userId, func) => {
    const gm = pf1.utils.getFirstActiveGM();
    const isFirstGM = game.user === gm;

    if (isFirstGM || (!gm && game.user.id === userId)) {
        await func();
    }
}

export { isFirstGM, isOwnerWithoutGm, handleSingleOwner };
