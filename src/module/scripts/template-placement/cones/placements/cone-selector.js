import createCone from './cone';
import createCone15 from './cone-15';

/**
 * Creates a cone originating fromo the given token
 *
 * @param {object} options The template creation data
 *
 * @param {TokenPF} token The originating token
 *
 * @returns {object} The created template
 */
export default async function (options, token) {
    return options.distance === 15
        ? await createCone15(options, token)
        : await createCone(options, token);
}
