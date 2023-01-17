const getFirstActiveGM = () => globalThis.pf1.utils.getFirstActiveGM();
const isFirstGM = () => getFirstActiveGM() === game.user;
const isCurrentUser = (userId) => game.user.id === userId;
const handleSingleOwner = async (userId, func) => {
    const gm = getFirstActiveGM();

    if (isFirstGM() || (!gm && isCurrentUser(userId))) {
        await func();
    }
}

export { isFirstGM, isCurrentUser, handleSingleOwner };
