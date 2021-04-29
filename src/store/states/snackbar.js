export const state = () => ({
    snack: ''
  })
  
export default {
    namespaced: true,
    state: {
        snack: '',
        color: 'error'
    },
    mutations: {
        setSnack (state, snack) {
            state.snack = snack.message;
            state.color = snack.color;
        }
    },
    actions: {
        setSuccess({ commit }, message){
            commit('setSnack', {'message': message, 'color': 'success'});
        },
        setError({ commit }, message){
            commit('setSnack', {'message': message, 'color': 'error'});
        }
    }
}