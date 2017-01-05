import { createAction } from 'redux-actions';
import CenaApi from '../../utils/CenaApi';

export const fetchBuilds = createAction('PROBUILDS_SEARCH_VIEW/FETCH_BUILDS', (championId, page, pageSize) => ({
  promise: CenaApi.getBuilds(championId, page, pageSize),
  data: {
    championId,
    page,
    pageSize,
  },
}));
