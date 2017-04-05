import typeToReducer from 'type-to-reducer';
import Immutable from 'immutable';
import { fetchProPlayers } from '../../modules/ProPlayersActions';

const initState = Immutable.fromJS({
  fetched: false,
  isFetching: false,
  ids: [],
  data: {},
  fetchError: false,
  errorMessage: '',
});

export default typeToReducer({
  [fetchProPlayers]: {
    PENDING: state => state.merge({ fetchError: false, isFetching: true }),
    FULFILLED: (state, { payload }) => state.merge({
      fetched: true,
      isFetching: false,
      ids: Immutable.List(payload.proPlayersIds),
    }),
    REJECTED: (state, action) => state.merge({
      isFetching: false,
      fetchError: true,
      errorMessage: action.payload.errorMessage,
    }),
  },
}, initState);