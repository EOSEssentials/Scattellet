import * as Mutations from './constants'

export const mutations = {
    [Mutations.SET_SCATTER]:(state, scatter) => state.scatter = scatter,
    [Mutations.SET_SCATEOS]:(state, scateos) => state.scateos = scateos,
};