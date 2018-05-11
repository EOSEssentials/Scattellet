import * as Actions from './constants'

export const actions = {
    [Actions.SET_SCATTER]:({commit}, scatter) => commit(Actions.SET_SCATTER, scatter),
    [Actions.SET_SCATEOS]:({commit}, scateos) => commit(Actions.SET_SCATEOS, scateos),
};