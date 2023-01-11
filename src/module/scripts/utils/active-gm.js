const getFirstActiveGM = () => pf1.utils.getFirstActiveGM();
const isFirstGM = () => getFirstActiveGM() === game.user;
const isCurrentUser = (userId) => game.user.id === userId;
const handleSingleOwner = async (userId, func) => {
    const gm = getFirstActiveGM();

    if (isFirstGM() || (!gm && isCurrentUser(userId))) {
        return await func();
    }
    return null;
}

export { isFirstGM, isCurrentUser, handleSingleOwner };
