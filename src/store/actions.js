import * as Actions from './constants'

export const actions = {
    [Actions.SET_SCATTER]:({commit}, scatter) => commit(Actions.SET_SCATTER, scatter),
    [Actions.SET_SCATEOS]:({commit}, scateos) => commit(Actions.SET_SCATEOS, scateos),
    [Actions.SET_NETWORK]:({commit}, networkString) => {
        const splits = networkString.replace('http://', '').replace('https://', '').split('/')[0].split(':');
        const network = {
            host:splits[0],
            port:parseInt(splits[1] || 80)
        }
        console.log('network', network);
        commit(Actions.SET_NETWORK, network)
    },
};