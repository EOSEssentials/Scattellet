import * as Mutations from './constants'

export const mutations = {
    [Mutations.SET_SCATTER]:(state, scatter) => state.scatter = scatter,
    [Mutations.SET_SCATEOS]:(state, scateos) => state.scateos = scateos,
    [Mutations.SET_NETWORK]:(state, network) => state.selectedNetwork = network,
};