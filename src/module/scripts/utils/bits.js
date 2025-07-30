
export const isSet = (current, desired) => {
    return (current & desired) === desired;
}